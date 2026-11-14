import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const ImageLightbox = ({ src, alt, isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !src) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close image preview"
        className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div
        className="relative max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt || 'Full size media'}
          className="w-full h-auto max-h-[85vh] object-contain rounded-2xl"
        />
      </div>
    </div>
  );
};

export default ImageLightbox;
