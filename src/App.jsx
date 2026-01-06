import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginForm from './components/auth/LoginForm';
import SignUpForm from './components/auth/SignUpForm';
import GroupList from './components/groups/GroupList';
import GroupAnalysis from './components/analysis/GroupAnalysis';
import IndividualReport from './components/reports/IndividualReport';
import Loading from './components/ui/Loading';
import Button from './components/ui/Button';

export default function App() {
  const { user, loading, signOut } = useAuth();
  const [page, setPage] = useState('list');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [authMode, setAuthMode] = useState('login');

  const handleSignOut = async () => {
    await signOut();
    setPage('list');
    setSelectedGroup(null);
    setSelectedMember(null);
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loading size="large" text="로딩 중..." />
      </div>
    );
  }

  // 비로그인 상태
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {authMode === 'login' ? (
            <LoginForm onSwitch={() => setAuthMode('signup')} />
          ) : (
            <SignUpForm onSwitch={() => setAuthMode('login')} />
          )}
        </div>
      </div>
    );
  }

  // 로그인 상태
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setPage('list');
                setSelectedGroup(null);
                setSelectedMember(null);
              }}
              className="flex items-center gap-3 hover:opacity-80 transition"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <span className="text-xl text-white">📊</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-800">TCI 그룹 분석</h1>
                <p className="text-xs text-gray-500">기질 및 성격검사 분석 서비스</p>
              </div>
            </button>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user.email}
              </span>
              <Button variant="secondary" size="sm" onClick={handleSignOut}>
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {page === 'list' && (
          <GroupList
            onSelectGroup={(group) => {
              setSelectedGroup(group);
              setPage('analysis');
            }}
          />
        )}

        {page === 'analysis' && selectedGroup && (
          <GroupAnalysis
            group={selectedGroup}
            onBack={() => {
              setSelectedGroup(null);
              setPage('list');
            }}
            onSelectMember={(member) => {
              setSelectedMember(member);
              setPage('report');
            }}
          />
        )}

        {page === 'report' && selectedMember && (
          <IndividualReport
            member={selectedMember}
            onBack={() => {
              setSelectedMember(null);
              setPage('analysis');
            }}
          />
        )}
      </main>

      {/* 푸터 */}
      <footer className="border-t border-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <p>TCI 그룹 분석 서비스</p>
            <p>© 2024 All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
