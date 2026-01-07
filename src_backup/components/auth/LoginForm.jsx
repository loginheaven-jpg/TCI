import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

export default function LoginForm({ onSwitch }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message || '로그인에 실패했습니다.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
          <span className="text-3xl text-white">📊</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">TCI 그룹 분석</h1>
        <p className="text-gray-500 mt-2">기질 및 성격검사 그룹 분석 서비스</p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <Alert variant="error" className="mb-6" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            이메일
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="example@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            비밀번호
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="••••••••"
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={loading}
          disabled={!email || !password}
        >
          로그인
        </Button>
      </form>

      {/* 회원가입 링크 */}
      <div className="mt-6 text-center">
        <p className="text-gray-500 text-sm">
          계정이 없으신가요?{' '}
          <button
            onClick={onSwitch}
            className="text-blue-600 font-medium hover:text-blue-700 transition"
          >
            회원가입
          </button>
        </p>
      </div>
    </div>
  );
}
