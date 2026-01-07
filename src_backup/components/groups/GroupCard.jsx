import React from 'react';
import Card from '../ui/Card';

export default function GroupCard({ group, onClick, selected = false }) {
  const memberCount = group.members?.length || 0;
  const createdDate = new Date(group.created_at).toLocaleDateString('ko-KR');

  return (
    <Card
      hover
      selected={selected}
      onClick={onClick}
      className="relative overflow-hidden"
    >
      {/* 상단 그라데이션 바 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />

      <div className="pt-2">
        {/* 그룹명 */}
        <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">
          {group.name}
        </h3>

        {/* 메타 정보 */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <span className="text-blue-500">👥</span>
            <span>{memberCount}명</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-400">📅</span>
            <span>{createdDate}</span>
          </div>
        </div>

        {/* 설명 */}
        {group.description && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">
            {group.description}
          </p>
        )}

        {/* 멤버 미리보기 */}
        {memberCount > 0 && (
          <div className="mt-4 flex -space-x-2">
            {group.members?.slice(0, 5).map((member, idx) => (
              <div
                key={member.id || idx}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-500
                          flex items-center justify-center text-white text-xs font-medium
                          border-2 border-white shadow-sm"
                title={member.name}
              >
                {member.name?.charAt(0) || '?'}
              </div>
            ))}
            {memberCount > 5 && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center
                            text-gray-600 text-xs font-medium border-2 border-white">
                +{memberCount - 5}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
