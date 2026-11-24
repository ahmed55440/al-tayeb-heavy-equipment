'use client';

import { useState, useRef } from 'react';
import {
  Upload,
  X,
  Link as LinkIcon,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
  Star,
} from 'lucide-react';
import { useAdminLocale } from '@/lib/admin-i18n';

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
  const { isRtl } = useAdminLocale();

  const currentImages: string[] = props.images !== undefined
    ? props.images
    : props.value
    ? [props.value]
    : [];

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const triggerChange = (newImages: string[]) => {
    if (props.value !== undefined || props.single) {
      (props.onChange as (url: string) => void)(newImages[0] || '');
    } else {
      (props.onChange as (urls: string[]) => void)(newImages);
    }
  };

  const uploadSingleFile = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) {
      throw new Error(isRtl ? 'الملف المحدد ليس صورة' : 'Selected file is not an image');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error(isRtl ? 'حجم الصورة يتجاوز 10 ميجابايت' : 'Image exceeds 10MB limit');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || (isRtl ? 'فشل رفع الصورة' : 'Failed to upload image'));
    }

    return data.url;
  };

  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));

    if (validFiles.length === 0) {
      showToast('error', isRtl ? 'يرجى اختيار ملفات صور فقط' : 'Please select image files only');
      setUploading(false);
      return;
    }

    setUploadProgress({ current: 0, total: validFiles.length });
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < validFiles.length; i++) {
        setUploadProgress({ current: i + 1, total: validFiles.length });
        const url = await uploadSingleFile(validFiles[i]);
        if (url) uploadedUrls.push(url);
      }

      if (uploadedUrls.length > 0) {
        if (isSingle) {
          triggerChange([uploadedUrls[0]]);
        } else {
          triggerChange([...currentImages, ...uploadedUrls].slice(0, maxImages));
        }
        showToast(
          'success',
          isRtl
            ? `تم رفع ${uploadedUrls.length} صورة وحفظها بنجاح`
            : `Successfully uploaded ${uploadedUrls.length} image(s)`
        );
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      showToast('error', err.message || (isRtl ? 'حدث خطأ أثناء الرفع' : 'Error occurred during upload'));
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReplaceFile = async (files: FileList | null) => {
    if (!files || files.length === 0 || replaceIndex === null) return;
    const file = files[0];

    setUploading(true);
    try {
      const url = await uploadSingleFile(file);
      if (url) {
        const next = [...currentImages];
        next[replaceIndex] = url;
        triggerChange(next);
        showToast('success', isRtl ? 'تم استبدال الصورة بنجاح' : 'Image replaced successfully');
      }
    } catch (err: any) {
      showToast('error', err.message || (isRtl ? 'فشل استبدال الصورة' : 'Failed to replace image'));
    } finally {
      setUploading(false);
      setReplaceIndex(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    if (isSingle) {
      triggerChange([trimmed]);
    } else {
      triggerChange([...currentImages, trimmed].slice(0, maxImages));
    }
    setUrlInput('');
    setShowUrlModal(false);
    showToast('success', isRtl ? 'تمت إضافة الرابط بنجاح' : 'URL added successfully');
  };

  const handleRemove = async (index: number) => {
    const targetUrl = currentImages[index];
    const updated = currentImages.filter((_, i) => i !== index);
    triggerChange(updated);

    // Optional delete from cloud storage if it was uploaded via /api/media/
    if (targetUrl && targetUrl.startsWith('/api/media/')) {
      try {
        await fetch(`/api/upload?url=${encodeURIComponent(targetUrl)}`, { method: 'DELETE' });
      } catch {
        // Non-blocking cleanup
      }
    }
    showToast('success', isRtl ? 'تم حذف الصورة' : 'Image removed');
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const selected = currentImages[index];
    const filtered = currentImages.filter((_, i) => i !== index);
    triggerChange([selected, ...filtered]);
    showToast('success', isRtl ? 'تم تعيينها كصورة رئيسية' : 'Set as primary cover');
  };

  const handleMove = (index: number, direction: 'prev' | 'next') => {
    const targetIdx = direction === 'prev' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= currentImages.length) return;

    const copy = [...currentImages];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    triggerChange(copy);
  };

  const effectiveMax = isSingle ? 1 : maxImages;

  return (
    <div className="space-y-4">
      {label && <p className="text-xs font-bold tracking-wide uppercase text-gray-400 mb-1">{label}</p>}

      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={!isSingle}
        onChange={(e) => handleUploadFiles(e.target.files)}
        className="hidden"
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleReplaceFile(e.target.files)}
        className="hidden"
      />

      {/* Notification Toast */}
      {feedback && (
        <div
          className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium border transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Uploading progress bar */}
      {uploading && uploadProgress && (
        <div className="p-3 bg-[#F5C400]/10 border border-[#F5C400]/30 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-[#F5C400] font-semibold">
            <span>
              {isRtl
                ? `جاري رفع الصورة ${uploadProgress.current} من ${uploadProgress.total}...`
                : `Uploading image ${uploadProgress.current} of ${uploadProgress.total}...`}
            </span>
            <span>{Math.round((uploadProgress.current / uploadProgress.total) * 100)}%</span>
          </div>
          <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#F5C400] h-full transition-all duration-300"
              style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Grid of uploaded images */}
      {currentImages.length > 0 && (
        <div className={`grid gap-3 ${isSingle ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'}`}>
          {currentImages.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className={`relative group rounded-xl overflow-hidden aspect-[4/3] bg-neutral-900 border-2 transition-all shadow-md ${
                index === 0 && !isSingle ? 'border-[#F5C400] ring-1 ring-[#F5C400]/50' : 'border-neutral-800 hover:border-neutral-600'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Uploaded ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* Cover badge */}
              {index === 0 && !isSingle && (
                <div className="absolute top-2 left-2 bg-[#F5C400] text-black text-[10px] font-black px-2 py-0.5 rounded shadow-lg flex items-center gap-1 z-10">
                  <Star className="w-3 h-3 fill-black" />
                  {isRtl ? 'الرئيسية' : 'COVER'}
                </div>
              )}

              {/* Action buttons overlay */}
              <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 z-20">
                <div className="flex items-center justify-between">
                  {/* Left / Right reordering */}
                  {!isSingle && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMove(index, 'prev')}
                        className="p-1 bg-black/60 hover:bg-[#F5C400] hover:text-black text-white rounded transition disabled:opacity-20"
                        title={isRtl ? 'تحريك للأمام' : 'Move left'}
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === currentImages.length - 1}
                        onClick={() => handleMove(index, 'next')}
                        className="p-1 bg-black/60 hover:bg-[#F5C400] hover:text-black text-white rounded transition disabled:opacity-20"
                        title={isRtl ? 'تحريك للخلف' : 'Move right'}
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Preview button */}
                  <button
                    type="button"
                    onClick={() => setPreviewImage(url)}
                    className="p-1.5 bg-black/60 hover:bg-neutral-700 text-white rounded transition"
                    title={isRtl ? 'معاينة بالحجم الكامل' : 'Preview full size'}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1.5">
                  {/* Set cover button */}
                  {index !== 0 && !isSingle && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(index)}
                      className="px-2 py-1 bg-[#F5C400] text-black font-bold text-[11px] rounded hover:bg-[#FFD429] transition shadow"
                    >
                      {isRtl ? 'تعيين كرئيسية' : 'Cover'}
                    </button>
                  )}

                  {/* Replace button */}
                  <button
                    type="button"
                    onClick={() => {
                      setReplaceIndex(index);
                      replaceInputRef.current?.click();
                    }}
                    className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded transition"
                    title={isRtl ? 'استبدال الصورة' : 'Replace Image'}
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                  </button>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded transition"
                    title={isRtl ? 'حذف' : 'Remove'}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
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
            className="flex-1 border-2 border-dashed border-neutral-700 hover:border-[#F5C400] bg-neutral-900/60 hover:bg-neutral-800/80 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 text-neutral-300 hover:text-white transition cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-[#F5C400] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Upload className="w-5 h-5 text-[#F5C400]" />
            )}
            <span className="text-xs font-semibold">
              {uploading
                ? isRtl
                  ? 'جاري الرفع السحابي...'
                  : 'Uploading to cloud...'
                : isRtl
                ? isSingle
                  ? 'رفع صورة من جهازك (سحابي)'
                  : 'رفع صور من جهازك (سحابي)'
                : 'Upload from Device'}
            </span>
            <span className="text-[10px] text-neutral-500">
              {isRtl ? 'تخزين دائم وموثوق في قاعدة البيانات' : 'Persistent, reliable cloud storage'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowUrlModal(!showUrlModal)}
            className="border-2 border-dashed border-neutral-700 hover:border-[#F5C400] bg-neutral-900/60 hover:bg-neutral-800/80 rounded-xl px-4 flex flex-col items-center justify-center gap-1 text-neutral-300 hover:text-white transition cursor-pointer"
            title="Paste Image URL"
          >
            <LinkIcon className="w-5 h-5 text-[#F5C400]" />
            <span className="text-xs font-semibold">{isRtl ? 'رابط' : 'URL'}</span>
          </button>
        </div>
      )}

      {/* URL input modal / inline bar */}
      {showUrlModal && (
        <div className="p-3 bg-neutral-900 border border-neutral-700 rounded-xl space-y-2">
          <p className="text-xs text-neutral-400 font-medium">
            {isRtl ? 'أدخل رابط الصورة المباشر:' : 'Enter direct image URL:'}
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/equipment-photo.jpg"
              className="flex-1 bg-black/60 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F5C400]"
            />
            <button
              type="button"
              onClick={handleAddUrl}
              className="bg-[#F5C400] text-black font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#FFD429] transition"
            >
              {isRtl ? 'إضافة' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => setShowUrlModal(false)}
              className="text-neutral-400 hover:text-white text-xs px-2"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* Full preview modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[85vh] bg-neutral-900 border border-neutral-700 rounded-2xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 bg-black/80 hover:bg-red-600 text-white p-2 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
