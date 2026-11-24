import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import path from 'path';
import fs from 'fs';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    if (!filename) {
      return new NextResponse('Filename required', { status: 400 });
    }

    // Sanitize filename to prevent directory traversal
    const safeFilename = path.basename(filename);

    // 1. Fetch from persistent Turso cloud database (Primary storage)
    const media = await queryOne<{
      mime_type: string;
      data: string;
      size: number;
    }>('SELECT mime_type, data, size FROM uploaded_media WHERE filename = ?', [safeFilename]);

    if (media && media.data) {
      const buffer = Buffer.from(media.data, 'base64');
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': media.mime_type || 'image/jpeg',
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // 2. Local fallback during development if needed
    if (process.env.NODE_ENV === 'development') {
      const devUploadDir = path.join(process.cwd(), 'public', 'uploads');
      const directPath = path.join(devUploadDir, safeFilename);
      if (fs.existsSync(directPath)) {
        const fileBuffer = await fs.promises.readFile(directPath);
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }
    }

    return new NextResponse('Media not found', { status: 404 });
  } catch (error) {
    console.error('Error serving media:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
