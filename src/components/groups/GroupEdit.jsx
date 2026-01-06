import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

export default function GroupEdit({ isOpen, onClose, group, onSubmit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePassword, setChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (group) {
      setName(group.name || '');
      setDescription(group.description || '');
      setPassword('');
      setConfirmPassword('');
      setChangePassword(false);
    }
  }, [group]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('그룹 이름을 입력해주세요.');
      return;
    }

    if (changePassword) {
      if (!password.trim()) {
        setError('새 암호를 입력해주세요.');
        return;
      }

      if (password !== confirmPassword) {
        setError('암호가 일치하지 않습니다.');
        return;
      }

      if (password.length < 4) {
        setError('암호는 4자 이상이어야 합니다.');
        return;
      }
    }

    setLoading(true);
    try {
      const updates = {
        name: name.trim(),
        description: description.trim()
      };

      if (changePassword && password.trim()) {
        updates.password = password.trim();
      }

      await onSubmit(group.id, updates);
      handleClose();
    } catch (err) {
      setError(err.message || '그룹 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setPassword('');
    setConfirmPassword('');
    setChangePassword(false);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="그룹 수정">
      {error && (
        <Alert variant="error" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            그룹 이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="예: 2024년 1분기 리더십 과정"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            설명 (선택)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
            placeholder="그룹에 대한 간단한 설명을 입력하세요"
          />
        </div>

        {/* 암호 변경 토글 */}
        <div className="border-t border-gray-100 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={changePassword}
              onChange={(e) => setChangePassword(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">그룹 암호 변경</span>
          </label>
        </div>

        {changePassword && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                새 암호 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="4자 이상"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                암호 확인 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="암호 재입력"
              />
            </div>
          </>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={handleClose}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            loading={loading}
            disabled={!name.trim()}
          >
            저장하기
          </Button>
        </div>
      </form>
    </Modal>
  );
}
