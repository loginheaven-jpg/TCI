import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const CURRENT_YEAR = new Date().getFullYear();

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 로그인 폼
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // 회원가입 폼
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    gender: '',
    birth_year: '',
    phone: '',
    join_path: ''
  });

  // ── 로그인 ──
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password
    });
    if (error) setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    setLoading(false);
  };

  // ── 회원가입 ──
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (registerForm.password !== registerForm.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (registerForm.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (!registerForm.name || !registerForm.gender || !registerForm.birth_year || !registerForm.phone) {
      setError('필수 항목을 모두 입력해 주세요.');
      return;
    }
    const birthYear = parseInt(registerForm.birth_year, 10);
    if (isNaN(birthYear) || birthYear < 1920 || birthYear > CURRENT_YEAR - 10) {
      setError('올바른 생년을 입력해 주세요.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: registerForm.email,
      password: registerForm.password,
      options: {
        data: {
          name: registerForm.name,
          gender: registerForm.gender,
          birth_year: birthYear,
          phone: registerForm.phone,
          join_path: registerForm.join_path || null
        }
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        setError('이미 가입된 이메일입니다. 로그인 해 주세요.');
      } else {
        setError('가입 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    } else {
      setSuccess('가입이 완료되었습니다. 이메일 인증 후 로그인해 주세요.');
      setMode('login');
      setLoginForm({ email: registerForm.email, password: '' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">TCI</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">기질 및 성격 검사</h1>
          <p className="text-slate-500 text-sm mt-1">진단기반 코칭 서비스</p>
        </div>

        {/* 카드 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* 탭 */}
          <div className="flex">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                mode === 'login'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                mode === 'register'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              회원가입
            </button>
          </div>

          <div className="p-6">
            {/* 에러/성공 메시지 */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-lg text-teal-700 text-sm">
                {success}
              </div>
            )}

            {/* ── 로그인 폼 ── */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    구글 계정 이메일
                  </label>
                  <input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="your@gmail.com"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="비밀번호 입력"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold rounded-lg text-sm transition-colors"
                >
                  {loading ? '로그인 중...' : '로그인'}
                </button>
              </form>
            )}

            {/* ── 회원가입 폼 ── */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                {/* 이메일 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    구글 계정 이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={registerForm.email}
                    onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="your@gmail.com"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-400 mt-1">가급적 Gmail 주소를 사용해 주세요.</p>
                </div>

                {/* 비밀번호 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      비밀번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={registerForm.password}
                      onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="6자 이상"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      비밀번호 확인 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={registerForm.passwordConfirm}
                      onChange={e => setRegisterForm(f => ({ ...f, passwordConfirm: e.target.value }))}
                      placeholder="동일하게 입력"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* 이름 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={registerForm.name}
                    onChange={e => setRegisterForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="실명 입력"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                {/* 성별 + 생년 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      성별 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      {['남', '여'].map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setRegisterForm(f => ({ ...f, gender: g }))}
                          className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                            registerForm.gender === g
                              ? 'bg-teal-600 text-white border-teal-600'
                              : 'bg-white text-slate-600 border-slate-300 hover:border-teal-400'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      생년 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={registerForm.birth_year}
                      onChange={e => setRegisterForm(f => ({ ...f, birth_year: e.target.value }))}
                      placeholder="예: 1985"
                      min="1920"
                      max={CURRENT_YEAR - 10}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* 전화번호 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    전화번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={registerForm.phone}
                    onChange={e => setRegisterForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="010-0000-0000"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                {/* 가입경로 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    가입경로
                    <span className="text-slate-400 font-normal ml-1">(선택)</span>
                  </label>
                  <input
                    type="text"
                    value={registerForm.join_path}
                    onChange={e => setRegisterForm(f => ({ ...f, join_path: e.target.value }))}
                    placeholder="진단기반 코칭세미나 2026 1기"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold rounded-lg text-sm transition-colors"
                >
                  {loading ? '처리 중...' : '가입하기'}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          © 2026 TCI 진단기반 코칭 서비스
        </p>
      </div>
    </div>
  );
}
