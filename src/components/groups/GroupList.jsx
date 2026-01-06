import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useGroups } from '../../hooks/useGroups';
import GroupCard from './GroupCard';
import GroupCreate from './GroupCreate';
import GroupEdit from './GroupEdit';
import CSVUploader from './CSVUploader';
import Button from '../ui/Button';
import Loading from '../ui/Loading';
import Alert from '../ui/Alert';
import Modal from '../ui/Modal';

export default function GroupList({ onSelectGroup }) {
  const { user } = useAuth();
  const {
    groups,
    loading,
    error,
    createGroup,
    updateGroup,
    deleteGroup,
    fetchGroups,
    addMembers,
    verifyGroupPassword,
    isGroupOwner
  } = useGroups(user?.id);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchGroups();
    }
  }, [user?.id]);

  const handleCreateGroup = async (data) => {
    const result = await createGroup(data.name, data.description, data.password);
    if (result.error) {
      throw new Error(result.error.message);
    }
    await fetchGroups();
    return result;
  };

  const handleUpdateGroup = async (groupId, updates) => {
    const result = await updateGroup(groupId, updates);
    if (result.error) {
      throw new Error(result.error.message);
    }
    await fetchGroups();
    return result;
  };

  const handleDeleteGroup = async (groupId) => {
    const result = await deleteGroup(groupId);
    if (result.error) {
      throw new Error(result.error.message);
    }
    setDeleteConfirm(null);
    await fetchGroups();
  };

  const handleUploadCSV = async (members, groupId) => {
    const result = await addMembers(groupId, members);
    if (result.error) {
      throw new Error(result.error.message);
    }
    await fetchGroups();
    return result;
  };

  const handleGroupClick = (group) => {
    // 그룹 소유자는 암호 없이 바로 입장
    if (isGroupOwner(group)) {
      onSelectGroup(group);
    } else {
      // 일반 사용자는 암호 입력 필요
      setSelectedGroup(group);
      setPassword('');
      setPasswordError('');
      setShowPasswordModal(true);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setVerifying(true);

    try {
      const result = await verifyGroupPassword(selectedGroup.id, password);
      if (result.valid) {
        setShowPasswordModal(false);
        onSelectGroup(selectedGroup);
      } else {
        setPasswordError('암호가 올바르지 않습니다.');
      }
    } catch (err) {
      setPasswordError('암호 확인 중 오류가 발생했습니다.');
    } finally {
      setVerifying(false);
    }
  };

  const openUploadModal = (groupId) => {
    setSelectedGroupId(groupId);
    setShowUploadModal(true);
  };

  const openEditModal = (group) => {
    setSelectedGroup(group);
    setShowEditModal(true);
  };

  if (loading && groups.length === 0) {
    return <Loading text="그룹 목록을 불러오는 중..." />;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">내 그룹</h2>
          <p className="text-gray-500 mt-1">TCI 검사 결과를 그룹별로 관리합니다</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="shadow-lg shadow-blue-500/25"
        >
          + 새 그룹
        </Button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <Alert variant="error" onClose={() => {}}>
          {error.message || '그룹을 불러오는데 실패했습니다.'}
        </Alert>
      )}

      {/* 그룹 목록 */}
      {groups.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl
                        flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📊</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            아직 그룹이 없습니다
          </h3>
          <p className="text-gray-500 mb-6">
            새 그룹을 만들고 TCI 검사 결과를 업로드해보세요
          </p>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            첫 그룹 만들기
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => {
            const isOwner = isGroupOwner(group);

            return (
              <div key={group.id} className="relative group/card">
                <GroupCard
                  group={group}
                  onClick={() => handleGroupClick(group)}
                />

                {/* 소유자 배지 */}
                {isOwner && (
                  <div className="absolute top-4 left-4">
                    <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-lg font-medium">
                      관리자
                    </span>
                  </div>
                )}

                {/* 액션 버튼들 (소유자만) */}
                {isOwner && (
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(group);
                      }}
                      className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center
                                hover:bg-gray-50 transition text-gray-500"
                      title="그룹 수정"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openUploadModal(group.id);
                      }}
                      className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center
                                hover:bg-blue-50 transition text-blue-500"
                      title="CSV 업로드"
                    >
                      📤
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(group.id);
                      }}
                      className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center
                                hover:bg-red-50 transition text-red-500"
                      title="그룹 삭제"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 그룹 생성 모달 */}
      <GroupCreate
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateGroup}
      />

      {/* 그룹 수정 모달 */}
      <GroupEdit
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedGroup(null);
        }}
        group={selectedGroup}
        onSubmit={handleUpdateGroup}
      />

      {/* CSV 업로드 모달 */}
      <CSVUploader
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedGroupId(null);
        }}
        onUpload={handleUploadCSV}
        groupId={selectedGroupId}
      />

      {/* 암호 입력 모달 */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setSelectedGroup(null);
          setPassword('');
          setPasswordError('');
        }}
        title="그룹 암호 입력"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-800">{selectedGroup?.name}</span>
            그룹에 입장하려면 암호를 입력하세요.
          </p>

          {passwordError && (
            <Alert variant="error" onClose={() => setPasswordError('')}>
              {passwordError}
            </Alert>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              그룹 암호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="암호를 입력하세요"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowPasswordModal(false);
                setSelectedGroup(null);
                setPassword('');
                setPasswordError('');
              }}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              loading={verifying}
              disabled={!password.trim()}
            >
              입장
            </Button>
          </div>
        </form>
      </Modal>

      {/* 삭제 확인 모달 */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-2">그룹 삭제</h3>
            <p className="text-gray-600 mb-6">
              이 그룹과 모든 멤버 데이터가 삭제됩니다.<br />
              정말 삭제하시겠습니까?
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setDeleteConfirm(null)}
              >
                취소
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => handleDeleteGroup(deleteConfirm)}
              >
                삭제
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
