import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { calculateTemperamentType, calculateCharacterType } from '../utils/typeCalculator';

export function useMembers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getMembersByGroup = useCallback(async (groupId) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('members')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const getMember = useCallback(async (memberId) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('members')
        .select('*')
        .eq('id', memberId)
        .single();

      if (fetchError) throw fetchError;
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMember = useCallback(async (memberId, updates) => {
    try {
      setLoading(true);
      setError(null);

      // 유형 코드 재계산 (T점수가 변경된 경우)
      const memberUpdates = { ...updates };
      if (updates.ns_t || updates.ha_t || updates.rd_t) {
        memberUpdates.temperament_type = calculateTemperamentType(updates);
      }
      if (updates.sd_t || updates.co_t || updates.st_t) {
        memberUpdates.character_type = calculateCharacterType(updates);
      }

      const { data, error: updateError } = await supabase
        .from('members')
        .update(memberUpdates)
        .eq('id', memberId)
        .select()
        .single();

      if (updateError) throw updateError;
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMember = useCallback(async (memberId) => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId);

      if (deleteError) throw deleteError;
      return { error: null };
    } catch (err) {
      setError(err.message);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getMembersByGroup,
    getMember,
    updateMember,
    deleteMember
  };
}
