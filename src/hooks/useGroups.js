import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { calculateTemperamentType, calculateCharacterType } from '../utils/typeCalculator';

export function useGroups(userId) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroups = useCallback(async () => {
    if (!userId) {
      setGroups([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('groups')
        .select('*, members (*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setGroups(data || []);
    } catch (err) {
      setError(err.message);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const createGroup = async (name, description = '') => {
    try {
      const { data, error: createError } = await supabase
        .from('groups')
        .insert({
          name,
          description,
          user_id: userId
        })
        .select()
        .single();

      if (createError) throw createError;

      setGroups(prev => [{ ...data, members: [] }, ...prev]);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const updateGroup = async (groupId, updates) => {
    try {
      const { data, error: updateError } = await supabase
        .from('groups')
        .update(updates)
        .eq('id', groupId)
        .select()
        .single();

      if (updateError) throw updateError;

      setGroups(prev => prev.map(g =>
        g.id === groupId ? { ...g, ...data } : g
      ));
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const deleteGroup = async (groupId) => {
    try {
      const { error: deleteError } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (deleteError) throw deleteError;

      setGroups(prev => prev.filter(g => g.id !== groupId));
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  };

  const addMembers = async (groupId, membersData) => {
    try {
      // 유형 코드 자동 계산
      const membersWithTypes = membersData.map(m => ({
        ...m,
        group_id: groupId,
        temperament_type: calculateTemperamentType(m),
        character_type: calculateCharacterType(m)
      }));

      const { data, error: insertError } = await supabase
        .from('members')
        .insert(membersWithTypes)
        .select();

      if (insertError) throw insertError;

      // 로컬 상태 업데이트
      setGroups(prev => prev.map(g =>
        g.id === groupId
          ? { ...g, members: [...(g.members || []), ...data] }
          : g
      ));

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const removeMember = async (groupId, memberId) => {
    try {
      const { error: deleteError } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId);

      if (deleteError) throw deleteError;

      setGroups(prev => prev.map(g =>
        g.id === groupId
          ? { ...g, members: g.members.filter(m => m.id !== memberId) }
          : g
      ));

      return { error: null };
    } catch (err) {
      return { error: err };
    }
  };

  return {
    groups,
    loading,
    error,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    addMembers,
    removeMember
  };
}
