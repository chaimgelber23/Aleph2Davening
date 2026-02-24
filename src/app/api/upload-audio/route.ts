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

    // Only allow mp3/m4a/wav
    const allowed = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-m4a', 'audio/mp3'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(mp3|m4a|wav)$/i)) {
      return NextResponse.json({ error: 'Only MP3, M4A, or WAV files allowed' }, { status: 400 });
    }

    const path = `${folder}/${filename}`;
    const buffer = await file.arrayBuffer();

    const { error } = await supabase.storage
      .from('audio-uploads')
      .upload(path, buffer, {
        contentType: file.type || 'audio/mpeg',
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

export async function GET() {
  try {
    // List all uploaded files
    const { data, error } = await supabase.storage
      .from('audio-uploads')
      .list('', { limit: 500, sortBy: { column: 'name', order: 'asc' } });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get files from each folder
    const folders = data?.filter(item => !item.name.includes('.')) || [];
    const allFiles: string[] = [];

    for (const folder of folders) {
      const { data: files } = await supabase.storage
        .from('audio-uploads')
        .list(folder.name, { limit: 100 });
      if (files) {
        for (const f of files) {
          allFiles.push(`${folder.name}/${f.name}`);
        }
      }
    }

    return NextResponse.json({ files: allFiles });
  } catch (err) {
    console.error('[upload] List error:', err);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}
