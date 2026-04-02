import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useQueryClient } from '@tanstack/react-query';

export function useFileUpload(claimId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});

  const uploadFiles = async (files: FileList | File[]) => {
    if (!user) return;
    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const filePath = `${user.id}/${claimId}/${Date.now()}_${file.name}`;
        setProgress(prev => ({ ...prev, [file.name]: 0 }));

        const { error: uploadError } = await supabase.storage
          .from('claim-documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        setProgress(prev => ({ ...prev, [file.name]: 100 }));

        const { data: { publicUrl } } = supabase.storage
          .from('claim-documents')
          .getPublicUrl(filePath);

        await supabase.from('documents').insert({
          claim_id: claimId,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          mime_type: file.type,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['documents', claimId] });
    } finally {
      setUploading(false);
      setProgress({});
    }
  };

  return { uploadFiles, uploading, progress };
}
