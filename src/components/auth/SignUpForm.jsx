import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

export default function SignUpForm({ onSwitch }) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 길이 확인
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    const { error: signUpError } = await signUp(email, password, name);

    if (signUpError) {
      setError(signUpError.message || '회원가입에 실패했습니다.');
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
            <span className="text-3xl text-white">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">가입 완료!</h2>
          <p className="text-gray-500 mb-6">
            이메일로 전송된 확인 링크를 클릭하여<br />
            이메일 인증을 완료해주세요.
          </p>
          <Button onClick={onSwitch} variant="primary">
            로그인으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
          <span className="text-3xl text-white">📊</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">회원가입</h1>
        <p className="text-gray-500 mt-2">TCI 그룹 분석 서비스 가입</p>
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
            이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="홍길동"
            required
          />
        </div>

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
            placeholder="6자 이상"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            비밀번호 확인
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="비밀번호 재입력"
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={loading}
          disabled={!name || !email || !password || !confirmPassword}
        >
          가입하기
        </Button>
      </form>

      {/* 로그인 링크 */}
      <div className="mt-6 text-center">
        <p className="text-gray-500 text-sm">
          이미 계정이 있으신가요?{' '}
          <button
            onClick={onSwitch}
            className="text-blue-600 font-medium hover:text-blue-700 transition"
          >
            로그인
          </button>
        </p>
      </div>
    </div>
  );
}
