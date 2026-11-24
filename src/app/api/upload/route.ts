import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { execute } from '@/lib/db';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export const maxDuration = 60; // Allow sufficient time for larger uploads

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('file') as File[];
    const type = (formData.get('type') as string) || 'equipment';

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const uploadedResults: Array<{ url: string; filename: string; size: number }> = [];

    for (const file of files) {
      // Validate file is an image
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { success: false, error: `Invalid file type: ${file.type}. Only images are allowed.` },
          { status: 400 }
        );
      }

      // Max size limit: 10MB
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: `File ${file.name} is too large. Maximum size is 10MB.` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Data = buffer.toString('base64');

      // Generate unique persistent filename
      const ext = path.extname(file.name) || '.jpg';
      const cleanExt = ext.toLowerCase();
      const id = uuidv4();
      const filename = `${type}_${Date.now()}_${id.slice(0, 8)}${cleanExt}`;

      // Insert into persistent Turso cloud database
      await execute(
        `INSERT INTO uploaded_media (id, filename, original_name, mime_type, data, size)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, filename, file.name, file.type, base64Data, file.size]
      );

      // Best effort optional cache to local disk (won't throw on Vercel EROFS)
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', type);
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        await fs.promises.writeFile(path.join(uploadDir, filename), buffer);
      } catch {
        // Silently skip if disk is read-only (e.g. Vercel)
      }

      const publicUrl = `/api/media/${filename}`;
      uploadedResults.push({
        url: publicUrl,
        filename,
        size: file.size,
      });
    }

    // Return single result or array based on input
    if (uploadedResults.length === 1) {
      return NextResponse.json({
        success: true,
        url: uploadedResults[0].url,
        filename: uploadedResults[0].filename,
        size: uploadedResults[0].size,
      });
    }

    return NextResponse.json({
      success: true,
      files: uploadedResults,
      urls: uploadedResults.map((r) => r.url),
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload file to cloud storage' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url') || '';
    const filename = searchParams.get('filename') || targetUrl.split('/').pop();

    if (!filename) {
      return NextResponse.json({ success: false, error: 'Filename or URL required' }, { status: 400 });
    }

    // Delete from Turso database
    await execute('DELETE FROM uploaded_media WHERE filename = ?', [filename]);

    return NextResponse.json({ success: true, message: 'Image deleted from storage' });
  } catch (error: any) {
    console.error('File delete error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete file' }, { status: 500 });
  }
}
