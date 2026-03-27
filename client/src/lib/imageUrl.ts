/**
 * Resolves an image path stored in the database to a full URL.
 * Backend stores images as relative paths like `/uploads/filename.jpg`.
 * These must be served from the API server (port 4000), NOT the Vite dev server.
 */
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api')
  .replace(/\/api$/, ''); // strip trailing "/api" → "http://localhost:4000"

export function getImageUrl(path: string | undefined | null, fallback?: string): string {
  if (!path) return fallback || '';
  // Already absolute (http/https) – return as-is (S3 / CDN URLs)
  if (/^https?:\/\//i.test(path)) return path;
  // Relative path – prepend the API server origin
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}
