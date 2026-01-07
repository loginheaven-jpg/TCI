/**
 * LocalStorage 마이그레이션 유틸리티
 * 기존 로컬 데이터를 Supabase로 마이그레이션합니다.
 */

const MIGRATION_KEY = 'tci_migration_completed';
const LOCAL_GROUPS_KEY = 'tci_groups';
const LOCAL_MEMBERS_KEY = 'tci_members';

/**
 * 마이그레이션 완료 여부를 확인합니다.
 * @returns {boolean}
 */
export function isMigrationCompleted() {
  return localStorage.getItem(MIGRATION_KEY) === 'true';
}

/**
 * 마이그레이션 완료 표시를 합니다.
 */
export function markMigrationCompleted() {
  localStorage.setItem(MIGRATION_KEY, 'true');
}

/**
 * 로컬 스토리지에서 기존 그룹 데이터를 가져옵니다.
 * @returns {Array} 그룹 배열
 */
export function getLocalGroups() {
  try {
    const data = localStorage.getItem(LOCAL_GROUPS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('로컬 그룹 데이터 파싱 실패:', error);
    return [];
  }
}

/**
 * 로컬 스토리지에서 기존 멤버 데이터를 가져옵니다.
 * @param {string} groupId - 그룹 ID
 * @returns {Array} 멤버 배열
 */
export function getLocalMembers(groupId) {
  try {
    const key = `${LOCAL_MEMBERS_KEY}_${groupId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('로컬 멤버 데이터 파싱 실패:', error);
    return [];
  }
}

/**
 * 모든 로컬 데이터를 Supabase로 마이그레이션합니다.
 * @param {Object} supabase - Supabase 클라이언트
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Object>} 마이그레이션 결과
 */
export async function migrateToSupabase(supabase, userId) {
  if (isMigrationCompleted()) {
    return { success: true, message: '이미 마이그레이션이 완료되었습니다.' };
  }

  const localGroups = getLocalGroups();
  if (localGroups.length === 0) {
    markMigrationCompleted();
    return { success: true, message: '마이그레이션할 데이터가 없습니다.' };
  }

  const results = {
    groups: { success: 0, failed: 0 },
    members: { success: 0, failed: 0 },
  };

  for (const localGroup of localGroups) {
    try {
      // 그룹 생성
      const { data: newGroup, error: groupError } = await supabase
        .from('groups')
        .insert({
          user_id: userId,
          name: localGroup.name || '마이그레이션된 그룹',
          description: localGroup.description || '',
        })
        .select()
        .single();

      if (groupError) {
        console.error('그룹 마이그레이션 실패:', groupError);
        results.groups.failed++;
        continue;
      }

      results.groups.success++;

      // 멤버 마이그레이션
      const localMembers = getLocalMembers(localGroup.id);
      if (localMembers.length > 0) {
        const membersToInsert = localMembers.map((member) => ({
          group_id: newGroup.id,
          name: member.name,
          ns_t: member.ns_t,
          ns_p: member.ns_p,
          ha_t: member.ha_t,
          ha_p: member.ha_p,
          rd_t: member.rd_t,
          rd_p: member.rd_p,
          ps_t: member.ps_t,
          ps_p: member.ps_p,
          sd_t: member.sd_t,
          sd_p: member.sd_p,
          co_t: member.co_t,
          co_p: member.co_p,
          st_t: member.st_t,
          st_p: member.st_p,
        }));

        const { error: membersError } = await supabase
          .from('members')
          .insert(membersToInsert);

        if (membersError) {
          console.error('멤버 마이그레이션 실패:', membersError);
          results.members.failed += localMembers.length;
        } else {
          results.members.success += localMembers.length;
        }
      }
    } catch (error) {
      console.error('마이그레이션 중 오류:', error);
      results.groups.failed++;
    }
  }

  markMigrationCompleted();

  return {
    success: true,
    message: `마이그레이션 완료: ${results.groups.success}개 그룹, ${results.members.success}명 멤버`,
    results,
  };
}

/**
 * 로컬 스토리지의 TCI 관련 데이터를 정리합니다.
 */
export function clearLocalData() {
  const keysToRemove = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('tci_') || key.startsWith(LOCAL_MEMBERS_KEY))) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => {
    if (key !== MIGRATION_KEY) {
      localStorage.removeItem(key);
    }
  });

  return keysToRemove.length;
}

/**
 * 마이그레이션 상태를 초기화합니다 (테스트용).
 */
export function resetMigrationStatus() {
  localStorage.removeItem(MIGRATION_KEY);
}
