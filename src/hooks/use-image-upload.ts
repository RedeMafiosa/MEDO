import { useState } from 'react';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';

type Bucket = 'avatars' | 'banners' | 'backgrounds' | 'store-images';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function toSnakeCase(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_.]/g, '');
}

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (
    file: File,
    bucket: Bucket,
    userId: string,
    prefix?: string
  ): Promise<string | null> => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Formato não suportado. Use JPG, PNG, GIF ou WebP.');
      return null;
    }
    if (file.size > MAX_SIZE) {
      toast.error('Arquivo muito grande. Máximo 10MB.');
      return null;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const baseName = toSnakeCase(prefix || 'upload');
      const path = `${userId}/${baseName}_${Date.now()}.${ext}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { contentType: file.type, upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
      return urlData.publicUrl;
    } catch (err: unknown) {
      toast.error(`Erro no upload: ${(err as Error).message}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading };
}
