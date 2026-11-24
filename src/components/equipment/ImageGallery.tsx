'use client';

import { useState } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight, Truck } from 'lucide-react';

interface ImageGalleryProps {
  images: Array<{ id?: number; image_path: string }>;
  title: string;
}

export default function ImageGallery({ images = [], title }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const photos = images.length > 0 ? images.map((i) => i.image_path) : [];

  if (photos.length === 0) {
    return (
      <div className="aspect-[16/10] bg-[#151515] border border-[#262626] rounded-3xl flex flex-col items-center justify-center text-gray-600">
        <Truck className="w-16 h-16 opacity-30 mb-2" />
        <span className="text-xs text-gray-500">No photos uploaded for this equipment</span>
      </div>
    );
  }

  const currentPhoto = photos[activeIndex] || photos[0];

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % photos.length);
  };

  return (
    <div className="space-y-4">
      {/* Main Large Display Image */}
      <div
        onClick={() => setLightboxOpen(true)}
        className="group relative aspect-[16/10] bg-[#0D0D0D] border border-[#262626] rounded-3xl overflow-hidden cursor-zoom-in shadow-2xl"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentPhoto}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Dark subtle gradient for controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxOpen(true);
          }}
          className="absolute top-4 right-4 p-2.5 rounded-xl bg-black/60 hover:bg-[#F5C400] text-white hover:text-black backdrop-blur-md transition-all shadow-lg"
          title="Full Screen View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Left / Right overlay arrows */}
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-[#F5C400] text-white hover:text-black backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-[#F5C400] text-white hover:text-black backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Counter Badge */}
        <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-mono backdrop-blur-md border border-white/10">
          {activeIndex + 1} / {photos.length}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {photos.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {photos.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                idx === activeIndex
                  ? 'border-[#F5C400] scale-95 shadow-md shadow-[#F5C400]/20'
                  : 'border-[#262626] opacity-60 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${title} thumb ${idx}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-lg flex items-center justify-center p-4"
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Lightbox Image */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentPhoto}
              alt={title}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />

            {/* Arrows */}
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-[#F5C400] text-white hover:text-black transition-colors"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-[#F5C400] text-white hover:text-black transition-colors"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
