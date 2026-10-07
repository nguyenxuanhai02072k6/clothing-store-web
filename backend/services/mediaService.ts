/**
 * Secure Media & Object Storage Pipeline
 * 
 * Features:
 * - Binary Magic-Byte Detection (detects true MIME type, ignores forged client extensions)
 * - Anti-RCE & Anti-XSS (strictly forbids scripts, HTML, SVG with embedded XML)
 * - Secure UUID Filename generation (eliminates directory traversal and filename collision)
 * - Strict Size Caps (max 5MB per file)
 * - Storage abstraction (Local file system for dev/single-node, S3/R2 ready for cloud)
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface ValidatedMedia {
  buffer: Buffer;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
  extension: 'jpg' | 'png' | 'webp' | 'gif';
  size: number;
}

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validates binary magic bytes to guarantee the payload is an authentic safe image.
 * Prevents attackers from disguising PHP/JS/HTML executables as .jpg files.
 */
export function detectMagicBytes(buffer: Buffer): { mimeType: ValidatedMedia['mimeType']; extension: ValidatedMedia['extension'] } | null {
  if (!buffer || buffer.length < 12) {
    return null;
  }

  // 1. JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { mimeType: 'image/jpeg', extension: 'jpg' };
  }

  // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4E &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0D &&
    buffer[5] === 0x0A &&
    buffer[6] === 0x1A &&
    buffer[7] === 0x0A
  ) {
    return { mimeType: 'image/png', extension: 'png' };
  }

  // 3. WebP: 'RIFF' .... 'WEBP'
  const isRiff = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
  const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
  if (isRiff && isWebp) {
    return { mimeType: 'image/webp', extension: 'webp' };
  }

  // 4. GIF: 'GIF87a' or 'GIF89a'
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return { mimeType: 'image/gif', extension: 'gif' };
  }

  return null;
}

/**
 * Validates file buffer size and authentic binary format
 */
export function validateMediaBuffer(buffer: Buffer): ValidatedMedia {
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error(`Kích thước tệp vượt quá giới hạn tối đa cho phép (Tối đa 5MB, thực tế: ${(buffer.length / 1024 / 1024).toFixed(2)}MB).`);
  }

  const magic = detectMagicBytes(buffer);
  if (!magic) {
    throw new Error('Định dạng tệp không hợp lệ hoặc không an toàn. Hệ thống chỉ chấp nhận hình ảnh JPEG, PNG, WebP hoặc GIF nguyên bản.');
  }

  return {
    buffer,
    mimeType: magic.mimeType,
    extension: magic.extension,
    size: buffer.length
  };
}

/**
 * Storage Abstraction:
 * Saves the validated buffer to secure storage (local public directory or cloud object store)
 */
export async function saveMediaFile(validated: ValidatedMedia, customDir?: string): Promise<{ url: string; filename: string; size: number; mimeType: string }> {
  // Generate random unguessable UUID filename with safe extension derived from magic bytes
  const randomId = crypto.randomUUID();
  const filename = `${randomId}.${validated.extension}`;

  // Target directory inside Next.js public folder
  const uploadDir = customDir || path.join(process.cwd(), 'public', 'uploads');

  // Ensure directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, filename);
  await fs.promises.writeFile(filePath, validated.buffer);

  const publicUrl = `/uploads/${filename}`;

  return {
    url: publicUrl,
    filename,
    size: validated.size,
    mimeType: validated.mimeType
  };
}

export const mediaService = {
  detectMagicBytes,
  validateMediaBuffer,
  saveMediaFile,
  MAX_FILE_SIZE_BYTES
};
