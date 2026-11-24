'use client';

import { useState, useRef } from 'react';
import { Upload, X, Link as LinkIcon } from 'lucide-react';

interface MultiImageUploaderProps {
  images: string[];
  value?: undefined;
  onChange: (images: string[]) => void;
  maxImages?: number;
  type?: string;
  single?: boolean;
  label?: string;
}

interface SingleImageUploaderProps {
  value?: string;
  images?: undefined;
  onChange: (image: string) => void;
  maxImages?: number;
  type?: string;
  single?: boolean;
  label?: string;
}

export type ImageUploaderProps = MultiImageUploaderProps | SingleImageUploaderProps;

export default function ImageUploader(props: ImageUploaderProps) {
  const { maxImages = 10, type = 'equipment', label } = props;
  const isSingle = props.value !== undefined || props.single === true;

  const currentImages: string[] = props.images !== undefined
    ? props.images
    : props.value
    ? [props.value]
    : [];

  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlModal, setShowUrlModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerChange = (newImages: string[]) => {
    if (props.value !== undefined || props.single) {
      (props.onChange as (url: string) => void)(newImages[0] || '');
    } else {
      (props.onChange as (urls: string[]) => void)(newImages);
    }
  };

  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.url) {
          newUrls.push(data.url);
        }
      } catch (err) {
        console.error('Failed to upload image:', err);
      }
    }

    if (newUrls.length > 0) {
      if (isSingle) {
        triggerChange([newUrls[0]]);
      } else {
        triggerChange([...currentImages, ...newUrls].slice(0, maxImages));
      }
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    if (isSingle) {
      triggerChange([urlInput.trim()]);
    } else {
      triggerChange([...currentImages, urlInput.trim()].slice(0, maxImages));
    }
    setUrlInput('');
    setShowUrlModal(false);
  };

  const handleRemove = (index: number) => {
    const updated = currentImages.filter((_, i) => i !== index);
    triggerChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const selected = currentImages[index];
    const filtered = currentImages.filter((_, i) => i !== index);
    triggerChange([selected, ...filtered]);
  };

  const effectiveMax = isSingle ? 1 : maxImages;

  return (
    <div className="space-y-4">
      {label && <p className="text-xs font-semibold text-gray-400 mb-1">{label}</p>}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={!isSingle}
        onChange={(e) => handleUploadFiles(e.target.files)}
        className="hidden"
      />

      {/* Grid of current images */}
      {currentImages.length > 0 && (
        <div className={`grid gap-3 ${isSingle ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
          {currentImages.map((url, index) => (
            <div
              key={index}
              className={`relative group rounded-xl overflow-hidden aspect-[4/3] bg-[#0D0D0D] border-2 transition-all ${
                index === 0 && !isSingle ? 'border-[#F5C400]' : 'border-[#262626]'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Uploaded ${index}`}
                className="w-full h-full object-cover"
              />

              {index === 0 && !isSingle && (
                <span className="absolute top-1.5 left-1.5 bg-[#F5C400] text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                  COVER
                </span>
              )}

              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {index !== 0 && !isSingle && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(index)}
                    className="p-1.5 bg-[#222] hover:bg-[#F5C400] hover:text-black text-white rounded-lg text-xs transition-colors"
                    title="Set as Cover"
                  >
                    Cover
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button area */}
      {currentImages.length < effectiveMax && (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 border-2 border-dashed border-[#333] hover:border-[#F5C400] bg-[#0D0D0D] hover:bg-[#151515] rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-[#F5C400] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Upload className="w-5 h-5 text-[#F5C400]" />
            )}
            <span className="text-xs font-medium">
              {uploading ? 'جاري الرفع / Uploading...' : 'رفع من الجهاز / Upload'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowUrlModal(!showUrlModal)}
            className="border-2 border-dashed border-[#333] hover:border-[#F5C400] bg-[#0D0D0D] hover:bg-[#151515] rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-white transition-all"
            title="Paste Image URL"
          >
            <LinkIcon className="w-5 h-5 text-gray-400" />
            <span className="text-xs font-medium">رابط / URL</span>
          </button>
        </div>
      )}

      {/* URL input modal / inline bar */}
      {showUrlModal && (
        <div className="p-3 bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 bg-[#1A1A1A] border border-[#333] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#F5C400]"
            />
            <button
              type="button"
              onClick={handleAddUrl}
              className="bg-[#F5C400] text-black font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-[#FFD429]"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowUrlModal(false)}
              className="text-gray-400 hover:text-white text-xs px-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
