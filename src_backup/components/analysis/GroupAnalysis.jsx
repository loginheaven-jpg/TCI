import React, { useState, useEffect } from 'react';
import { useMembers } from '../../hooks/useMembers';
import Tabs from '../ui/Tabs';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Loading from '../ui/Loading';
import Alert from '../ui/Alert';
import TemperamentTab from './TemperamentTab';
import CharacterTab from './CharacterTab';
import MemberSelector from './MemberSelector';
import CSVUploader from '../groups/CSVUploader';
import { generateGroupReportPDF } from '../../utils/pdfGenerator';

export default function GroupAnalysis({ group, onBack, onSelectMember }) {
  const { members, loading, error, fetchMembers, addMembers, deleteMember } = useMembers();
  const [activeTab, setActiveTab] = useState('temperament');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [showMemberSelector, setShowMemberSelector] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (group?.id) {
      fetchMembers(group.id);
    }
  }, [group?.id]);

  const selectedMembers = members.filter((m) => selectedMemberIds.includes(m.id));

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const element = document.getElementById('group-analysis-content');
      if (element) {
        await generateGroupReportPDF(element, group?.name || 'group');
      }
    } catch (err) {
      console.error('PDF 내보내기 실패:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleUploadCSV = async (membersData) => {
    const result = await addMembers(group.id, membersData);
    if (result.error) {
      throw new Error(result.error.message);
    }
    await fetchMembers(group.id);
    return result;
  };

  const tabs = [
    { id: 'temperament', label: '기질 분석', icon: '🧠' },
    { id: 'character', label: '성격 분석', icon: '💚' },
    { id: 'members', label: '멤버 관리', icon: '👥' },
  ];

  if (loading && members.length === 0) {
    return <Loading text="멤버 데이터를 불러오는 중..." />;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center
                      hover:bg-gray-200 transition text-gray-600"
          >
            ←
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{group?.name}</h2>
            <p className="text-gray-500">{members.length}명의 멤버</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {selectedMemberIds.length > 0 && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              {selectedMemberIds.length}명 선택됨
            </span>
          )}
          <Button
            variant="secondary"
            onClick={() => setShowMemberSelector(!showMemberSelector)}
          >
            {showMemberSelector ? '선택 닫기' : '멤버 선택'}
          </Button>
          <Button
            variant="secondary"
            onClick={handleExportPDF}
            loading={exporting}
            disabled={members.length === 0}
          >
            PDF 내보내기
          </Button>
          <Button variant="primary" onClick={() => setShowUploadModal(true)}>
            + CSV 업로드
          </Button>
        </div>
      </div>

      {/* 에러 */}
      {error && (
        <Alert variant="error">
          {error.message || '데이터를 불러오는데 실패했습니다.'}
        </Alert>
      )}

      {/* 멤버 선택기 */}
      {showMemberSelector && members.length > 0 && (
        <Card>
          <MemberSelector
            members={members}
            selectedIds={selectedMemberIds}
            onChange={setSelectedMemberIds}
            maxSelect={7}
          />
        </Card>
      )}

      {/* 멤버가 없는 경우 */}
      {members.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl
                        flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📊</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            아직 멤버가 없습니다
          </h3>
          <p className="text-gray-500 mb-6">
            CSV 파일을 업로드하여 TCI 검사 결과를 추가하세요
          </p>
          <Button variant="primary" onClick={() => setShowUploadModal(true)}>
            CSV 업로드하기
          </Button>
        </Card>
      ) : (
        <>
          {/* 탭 네비게이션 */}
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          {/* 탭 컨텐츠 */}
          <div id="group-analysis-content">
            {activeTab === 'temperament' && (
              <TemperamentTab members={members} selectedMembers={selectedMembers} />
            )}

            {activeTab === 'character' && (
              <CharacterTab members={members} selectedMembers={selectedMembers} />
            )}

            {activeTab === 'members' && (
              <Card>
                <h3 className="text-lg font-bold text-gray-800 mb-4">멤버 목록</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">이름</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">NS</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">HA</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">RD</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">PS</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">SD</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">CO</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">ST</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">기질</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">성격</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">액션</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {members.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-800">{member.name}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{member.ns_t}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{member.ha_t}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{member.rd_t}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{member.ps_t}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{member.sd_t}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{member.co_t}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{member.st_t}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              {member.temperament_type || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                              {member.character_type || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => onSelectMember?.(member)}
                                className="text-blue-500 hover:text-blue-700 transition"
                                title="개인 리포트"
                              >
                                📋
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`${member.name}님을 삭제하시겠습니까?`)) {
                                    deleteMember(member.id);
                                  }
                                }}
                                className="text-red-500 hover:text-red-700 transition"
                                title="삭제"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </>
      )}

      {/* CSV 업로드 모달 */}
      <CSVUploader
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadCSV}
        groupId={group?.id}
      />
    </div>
  );
}
