import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Claim, ClaimTimeline, ClaimDocument } from '@/types';

export function useClaimDetail(claimId: string) {
  return useQuery({
    queryKey: ['claim', claimId],
    queryFn: async () => {
      const { data, error } = await supabase.from('claims').select('*').eq('id', claimId).single();
      if (error) throw error;
      return data as Claim;
    },
    enabled: !!claimId,
  });
}

export function useClaimTimeline(claimId: string) {
  return useQuery({
    queryKey: ['timeline', claimId],
    queryFn: async () => {
      const { data, error } = await supabase.from('claim_timeline').select('*').eq('claim_id', claimId).order('created_at', { ascending: true });
      if (error) throw error;
      return data as ClaimTimeline[];
    },
    enabled: !!claimId,
  });
}

export function useClaimDocuments(claimId: string) {
  return useQuery({
    queryKey: ['documents', claimId],
    queryFn: async () => {
      const { data, error } = await supabase.from('documents').select('*').eq('claim_id', claimId).order('created_at', { ascending: false });
      if (error) throw error;
      return data as ClaimDocument[];
    },
    enabled: !!claimId,
  });
}

export function useAddTimelineEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ claimId, eventType, note }: { claimId: string; eventType: string; note?: string }) => {
      const { error } = await supabase.from('claim_timeline').insert({
        claim_id: claimId,
        event_type: eventType,
        note,
      });
      if (error) throw error;
    },
    onSuccess: (_, { claimId }) => {
      queryClient.invalidateQueries({ queryKey: ['timeline', claimId] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ docId, fileUrl }: { docId: string; fileUrl: string }) => {
      // Extract path from URL for storage deletion
      const path = fileUrl.split('/claim-documents/')[1];
      if (path) await supabase.storage.from('claim-documents').remove([path]);
      const { error } = await supabase.from('documents').delete().eq('id', docId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}
