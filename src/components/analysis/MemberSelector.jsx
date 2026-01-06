import React, { useState } from 'react';
import Button from '../ui/Button';

export default function MemberSelector({
  members = [],
  selectedIds = [],
  onChange,
  maxSelect = 7,
  showSearch = true,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = (memberId) => {
    if (selectedIds.includes(memberId)) {
      onChange(selectedIds.filter((id) => id !== memberId));
    } else if (selectedIds.length < maxSelect) {
      onChange([...selectedIds, memberId]);
    }
  };

  const handleSelectAll = () => {
    const allIds = filteredMembers.slice(0, maxSelect).map((m) => m.id);
    onChange(allIds);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-4">
      {/* 검색 및 액션 */}
      <div className="flex items-center gap-3">
        {showSearch && (
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="멤버 검색..."
              className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-xl
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        )}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSelectAll}
            disabled={filteredMembers.length === 0}
          >
            전체 선택
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClearAll}
            disabled={selectedIds.length === 0}
          >
            선택 해제
          </Button>
        </div>
      </div>

      {/* 선택 상태 */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">
          {selectedIds.length}명 선택됨 (최대 {maxSelect}명)
        </span>
        {selectedIds.length >= maxSelect && (
          <span className="text-amber-600">최대 선택 수에 도달했습니다</span>
        )}
      </div>

      {/* 멤버 목록 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-1">
        {filteredMembers.map((member) => {
          const isSelected = selectedIds.includes(member.id);
          const isDisabled = !isSelected && selectedIds.length >= maxSelect;

          return (
            <button
              key={member.id}
              onClick={() => !isDisabled && handleToggle(member.id)}
              disabled={isDisabled}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                transition-all duration-200 text-left
                ${
                  isSelected
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : isDisabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
                          ${isSelected ? 'bg-white/20' : 'bg-gray-200'}`}
              >
                {isSelected ? '✓' : member.name.charAt(0)}
              </span>
              <span className="truncate">{member.name}</span>
            </button>
          );
        })}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? '검색 결과가 없습니다' : '멤버가 없습니다'}
        </div>
      )}
    </div>
  );
}
