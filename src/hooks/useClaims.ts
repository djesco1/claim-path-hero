import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Claim, ClaimStatus } from '@/types';
import { useAuth } from './useAuth';

export function useClaims(statusFilter?: ClaimStatus | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['claims', user?.id, statusFilter],
    queryFn: async () => {
      let query = supabase.from('claims').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
      if (statusFilter) query = query.eq('status', statusFilter);
      const { data, error } = await query;
      if (error) throw error;
      return data as Claim[];
    },
    enabled: !!user,
  });
}

export function useDeleteClaim() {
  const queryClient = useQueryClient();
  const { user, refreshProfile } = useAuth();

  return useMutation({
    mutationFn: async (claimId: string) => {
      // Delete storage files
      const { data: files } = await supabase.storage.from('claim-documents').list(`${user!.id}/${claimId}`);
      if (files?.length) {
        const paths = files.map(f => `${user!.id}/${claimId}/${f.name}`);
        await supabase.storage.from('claim-documents').remove(paths);
      }
      const { error } = await supabase.from('claims').delete().eq('id', claimId);
      if (error) throw error;
      // Decrement claims_used
      await supabase.rpc('decrement_claims_used', { uid: user!.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      refreshProfile();
    },
  });
}

export function useUpdateClaimStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ claimId, status }: { claimId: string; status: ClaimStatus }) => {
      const { error } = await supabase.from('claims').update({ status }).eq('id', claimId);
      if (error) throw error;
      // Add timeline event
      if (status === 'sent' || status === 'resolved') {
        await supabase.from('claim_timeline').insert({
          claim_id: claimId,
          event_type: status === 'sent' ? 'sent' : 'resolved',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['claim'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}
