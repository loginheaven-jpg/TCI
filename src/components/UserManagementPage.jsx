import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const ROLE_LABELS = {
  admin: { label: '어드민', color: 'bg-purple-100 text-purple-700' },
  counselor: { label: '상담자', color: 'bg-teal-100 text-teal-700' },
  client: { label: '내담자', color: 'bg-slate-100 text-slate-600' }
};

const APP_STATUS_LABELS = {
  pending:   { label: '입금 대기', color: 'bg-yellow-100 text-yellow-700' },
  paid:      { label: '입금 확인', color: 'bg-blue-100 text-blue-700' },
  link_sent: { label: '링크 발송', color: 'bg-purple-100 text-purple-700' },
  completed: { label: '검사 완료', color: 'bg-green-100 text-green-700' },
  cancelled: { label: '취소', color: 'bg-gray-100 text-gray-500' }
};

export default function UserManagementPage({ userProfile, groups }) {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'applications'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [linkModal, setLinkModal] = useState(null); // { userId, userName }
  const [linkMemberId, setLinkMemberId] = useState('');
  const [linkSaving, setLinkSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // 진단 신청 관리
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [savingAppId, setSavingAppId] = useState(null);

  const isAdmin = userProfile?.role === 'admin';

  // 사용자 목록 로드
  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  // 진단 신청 목록 로드
  const loadApplications = async () => {
    setAppsLoading(true);
    const { data, error } = await supabase
      .from('diagnosis_applications')
      .select('*, users(name, email, phone)')
      .order('created_at', { ascending: false });
    if (!error) setApplications(data || []);
    setAppsLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'applications') loadApplications();
  }, [activeTab]);

  // 신청 상태 변경
  const handleAppStatusChange = async (appId, newStatus) => {
    setSavingAppId(appId);
    const { error } = await supabase
      .from('diagnosis_applications')
      .update({ status: newStatus })
      .eq('id', appId);
    if (!error) {
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      setMsg('상태가 변경되었습니다.');
      setTimeout(() => setMsg(''), 3000);
    } else {
      setMsg('상태 변경 실패: ' + error.message);
    }
    setSavingAppId(null);
  };

  // 신청 메모 변경
  const handleAppNoteChange = async (appId, note) => {
    setSavingAppId(appId);
    const { error } = await supabase
      .from('diagnosis_applications')
      .update({ admin_note: note })
      .eq('id', appId);
    if (!error) {
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, admin_note: note } : a));
    }
    setSavingAppId(null);
  };

  // 역할 변경 (어드민 전용)
  const handleRoleChange = async (userId, newRole) => {
    setSavingId(userId);
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId);
    if (error) {
      setMsg('역할 변경 실패: ' + error.message);
    } else {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setMsg('역할이 변경되었습니다.');
      setTimeout(() => setMsg(''), 3000);
    }
    setSavingId(null);
  };

  // 내담자-멤버 연결 팝업 열기
  const openLinkModal = (user) => {
    setLinkModal({ userId: user.id, userName: user.name });
    setLinkMemberId('');
  };

  // 연결 저장
  const handleLinkSave = async () => {
    if (!linkMemberId) return;
    setLinkSaving(true);
    const { error } = await supabase
      .from('members')
      .update({ client_user_id: linkModal.userId })
      .eq('id', linkMemberId);
    if (error) {
      setMsg('연결 실패: ' + error.message);
    } else {
      setMsg(`${linkModal.userName} 님과 검사 데이터가 연결되었습니다.`);
      setTimeout(() => setMsg(''), 4000);
      setLinkModal(null);
    }
    setLinkSaving(false);
  };

  // 연결 해제
  const handleUnlink = async (memberId) => {
    const { error } = await supabase
      .from('members')
      .update({ client_user_id: null })
      .eq('id', memberId);
    if (error) {
      setMsg('연결 해제 실패: ' + error.message);
    } else {
      setMsg('연결이 해제되었습니다.');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  // 모든 멤버 플랫 리스트 (그룹별)
  const allMembers = groups.flatMap(g =>
    (g.members || []).map(m => ({
      ...m,
      groupName: g.name,
      groupId: g.id
    }))
  );

  // 멤버에 연결된 유저 찾기
  const getLinkedUser = (member) => {
    if (!member.client_user_id) return null;
    return users.find(u => u.id === member.client_user_id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h2 className="text-xl font-bold text-slate-800 mb-1">사용자 관리</h2>

      {/* 탭 */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
            activeTab === 'users'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          회원 목록
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
            activeTab === 'applications'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          진단 신청 관리
          {applications.filter(a => a.status === 'pending').length > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[10px] rounded-full">
              {applications.filter(a => a.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {msg && (
        <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-lg text-teal-700 text-sm">
          {msg}
        </div>
      )}

      {/* ── 진단 신청 관리 탭 ── */}
      {activeTab === 'applications' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-700">진단 신청 목록</h3>
            <p className="text-xs text-slate-400 mt-0.5">신청 상태를 변경하고 메모를 남길 수 있습니다.</p>
          </div>
          {appsLoading ? (
            <div className="py-12 text-center text-slate-400 text-sm">로딩 중...</div>
          ) : applications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">신청 내역이 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">신청자</th>
                    <th className="px-4 py-3 text-left">전화</th>
                    <th className="px-4 py-3 text-left">신청일</th>
                    <th className="px-4 py-3 text-left">상태</th>
                    <th className="px-4 py-3 text-left">메모</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map(app => (
                    <tr key={app.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{app.users?.name || app.name || '—'}</p>
                        <p className="text-xs text-slate-400">{app.users?.email || '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {app.users?.phone || app.phone || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {app.created_at?.split('T')[0]}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={app.status}
                          disabled={savingAppId === app.id}
                          onChange={e => handleAppStatusChange(app.id, e.target.value)}
                          className={`text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-50 ${APP_STATUS_LABELS[app.status]?.color}`}
                        >
                          <option value="pending">입금 대기</option>
                          <option value="paid">입금 확인</option>
                          <option value="link_sent">링크 발송</option>
                          <option value="completed">검사 완료</option>
                          <option value="cancelled">취소</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          defaultValue={app.admin_note || ''}
                          onBlur={e => {
                            if (e.target.value !== (app.admin_note || '')) {
                              handleAppNoteChange(app.id, e.target.value);
                            }
                          }}
                          placeholder="메모 입력 후 Tab/클릭 아웃"
                          className="text-xs border border-slate-200 rounded px-2 py-1 w-40 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── 사용자 목록 탭 ── */}
      {activeTab === 'users' && (
      <>{/* ── 사용자 목록 ── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-700">가입 회원 목록</h3>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">로딩 중...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">이름</th>
                  <th className="px-4 py-3 text-left">이메일</th>
                  <th className="px-4 py-3 text-left">성별</th>
                  <th className="px-4 py-3 text-left">생년</th>
                  <th className="px-4 py-3 text-left">전화</th>
                  <th className="px-4 py-3 text-left">가입경로</th>
                  <th className="px-4 py-3 text-left">가입일</th>
                  <th className="px-4 py-3 text-left">역할</th>
                  {isAdmin && <th className="px-4 py-3 text-left">연결</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{user.name || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3 text-slate-600">{user.gender || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{user.birth_year || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{user.phone || '-'}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-[150px] truncate">{user.join_path || '-'}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {user.created_at ? user.created_at.split('T')[0] : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin ? (
                        <select
                          value={user.role || 'client'}
                          disabled={savingId === user.id || user.role === 'admin'}
                          onChange={e => handleRoleChange(user.id, e.target.value)}
                          className="text-xs border border-slate-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-50"
                        >
                          <option value="client">내담자</option>
                          <option value="counselor">상담자</option>
                          <option value="admin">어드민</option>
                        </select>
                      ) : (
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_LABELS[user.role]?.color || ''}`}>
                          {ROLE_LABELS[user.role]?.label || user.role}
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        {user.role === 'client' && (
                          <button
                            onClick={() => openLinkModal(user)}
                            className="text-xs text-teal-600 hover:text-teal-700 font-medium border border-teal-200 rounded px-2 py-1 hover:bg-teal-50"
                          >
                            검사 연결
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-sm">가입된 회원이 없습니다.</div>
            )}
          </div>
        )}
      </div>

      {/* ── 내담자-멤버 연결 현황 ── */}
      {allMembers.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-700">검사 데이터 연결 현황</h3>
            <p className="text-xs text-slate-400 mt-0.5">내담자 계정과 TCI 검사 데이터를 연결합니다.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">그룹</th>
                  <th className="px-4 py-3 text-left">검사자명</th>
                  <th className="px-4 py-3 text-left">연결된 내담자</th>
                  <th className="px-4 py-3 text-left">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allMembers.map((member, idx) => {
                  const linkedUser = getLinkedUser(member);
                  return (
                    <tr key={`${member.groupId}-${idx}`} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-500 text-xs">{member.groupName}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{member.name}</td>
                      <td className="px-4 py-3">
                        {linkedUser ? (
                          <span className="text-teal-700 font-medium">
                            {linkedUser.name} ({linkedUser.email})
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">미연결</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {linkedUser ? (
                          <button
                            onClick={() => handleUnlink(member.dbId || member.id)}
                            className="text-xs text-red-500 hover:text-red-600 border border-red-200 rounded px-2 py-1 hover:bg-red-50"
                          >
                            연결 해제
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      </>)}

      {/* ── 검사 연결 모달 ── */}
      {linkModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-slate-800 mb-1">검사 데이터 연결</h3>
            <p className="text-sm text-slate-500 mb-4">
              <span className="font-semibold text-teal-700">{linkModal.userName}</span> 님과 연결할 검사 데이터를 선택하세요.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">검사자 선택</label>
              <select
                value={linkMemberId}
                onChange={e => setLinkMemberId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">— 검사자 선택 —</option>
                {groups.map(g => (
                  <optgroup key={g.id} label={g.name}>
                    {(g.members || []).map((m, i) => (
                      <option key={`${g.id}-${i}`} value={m.dbId || m.id}>
                        {m.name} {m.gender ? `(${m.gender})` : ''} {m.age ? `${m.age}세` : ''}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setLinkModal(null)}
                className="flex-1 py-2.5 border border-slate-300 text-slate-600 rounded-lg text-sm hover:bg-slate-50"
              >
                취소
              </button>
              <button
                onClick={handleLinkSave}
                disabled={!linkMemberId || linkSaving}
                className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white rounded-lg text-sm font-semibold"
              >
                {linkSaving ? '저장 중...' : '연결하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
