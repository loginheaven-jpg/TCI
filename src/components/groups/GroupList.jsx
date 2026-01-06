import React, { useState, useEffect } from 'react';
import { useGroups } from '../../hooks/useGroups';
import { useMembers } from '../../hooks/useMembers';
import GroupCard from './GroupCard';
import GroupCreate from './GroupCreate';
import CSVUploader from './CSVUploader';
import Button from '../ui/Button';
import Loading from '../ui/Loading';
import Alert from '../ui/Alert';

export default function GroupList({ onSelectGroup }) {
  const { groups, loading, error, createGroup, deleteGroup, fetchGroups } = useGroups();
  const { addMembers } = useMembers();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (data) => {
    const result = await createGroup(data);
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

  const openUploadModal = (groupId) => {
    setSelectedGroupId(groupId);
    setShowUploadModal(true);
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
          {groups.map((group) => (
            <div key={group.id} className="relative group">
              <GroupCard
                group={group}
                onClick={() => onSelectGroup(group)}
              />

              {/* 액션 버튼들 */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
            </div>
          ))}
        </div>
      )}

      {/* 그룹 생성 모달 */}
      <GroupCreate
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateGroup}
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
