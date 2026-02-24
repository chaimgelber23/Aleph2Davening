import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string | null;
    const filename = formData.get('filename') as string | null;

    if (!file || !folder || !filename) {
      return NextResponse.json({ error: 'Missing file, folder, or filename' }, { status: 400 });
    }

    // Allow common audio types including WAV from recordings
    const allowed = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-m4a', 'audio/mp3', 'audio/webm', 'audio/ogg', 'audio/x-wav'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(mp3|m4a|wav|webm|ogg)$/i)) {
      return NextResponse.json({ error: 'Audio files only (MP3, WAV, M4A, WebM)' }, { status: 400 });
    }

    const path = `${folder}/${filename}`;
    const buffer = await file.arrayBuffer();

    const { error } = await supabase.storage
      .from('audio-uploads')
      .upload(path, buffer, {
        contentType: file.type || 'audio/wav',
        upsert: true,
      });

    if (error) {
      console.error('[upload] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, path });
  } catch (err) {
    console.error('[upload] Exception:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

// Recursively list files up to 3 levels deep
async function listFilesRecursive(prefix: string, depth = 0): Promise<string[]> {
  if (depth > 3) return [];
  const { data } = await supabase.storage
    .from('audio-uploads')
    .list(prefix, { limit: 500, sortBy: { column: 'name', order: 'asc' } });
  if (!data) return [];

  const files: string[] = [];
  for (const item of data) {
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    const isFile = /\.\w+$/.test(item.name);
    if (isFile) {
      files.push(path);
    } else {
      const subFiles = await listFilesRecursive(path, depth + 1);
      files.push(...subFiles);
    }
  }
  return files;
}

export async function GET() {
  try {
    const allFiles = await listFilesRecursive('');
    return NextResponse.json({ files: allFiles });
  } catch (err) {
    console.error('[upload] List error:', err);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}
