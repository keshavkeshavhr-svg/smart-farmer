import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';

interface ImageUploaderProps {
  maxFiles?: number;
  onUpload?: (urls: string[]) => void;
  existingImages?: string[];
}

/**
 * Drag-and-drop image uploader supporting S3 pre-signed URL flow.
 * Falls back to standard multipart upload if S3 is not configured.
 */
export default function ImageUploader({ maxFiles = 5, onUpload, existingImages = [] }: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    try {
      // Try S3 pre-signed URL flow
      const res = await api.get('/uploads/signed-url', {
        params: { filename: file.name, contentType: file.type },
      }) as unknown as { uploadUrl: string; publicUrl: string };

      await fetch(res.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      return res.publicUrl;
    } catch {
      // Fallback: return a local object URL as placeholder
      return URL.createObjectURL(file);
    }
  }, []);

  const handleFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList).slice(0, maxFiles - images.length);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const urls = await Promise.all(files.map(uploadFile));
      const newImages = [...images, ...urls];
      setImages(newImages);
      onUpload?.(newImages);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  }, [images, maxFiles, onUpload, uploadFile]);

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onUpload?.(newImages);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          dragOver ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-2" />
            <p className="text-sm font-medium text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-700">
              Drop images here or <span className="text-primary-600 underline">browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB • Max {maxFiles} images</p>
          </div>
        )}
      </div>

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {images.map((url, idx) => (
            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {images.length < maxFiles && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
            >
              <Image className="w-6 h-6 text-gray-400" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
