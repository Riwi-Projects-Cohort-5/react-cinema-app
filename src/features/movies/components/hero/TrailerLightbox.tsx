import { X } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import { getYouTubeEmbedUrl } from "@features/movies/utils";

export interface TrailerLightboxProps {
  isOpen: boolean;
  trailerUrl: string | null;
  onClose: () => void;
  movieTitle: string;
}

export function TrailerLightbox({ isOpen, trailerUrl, onClose, movieTitle }: TrailerLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !trailerUrl) {
    return null;
  }

  const embedUrl = getYouTubeEmbedUrl(trailerUrl);
  if (!embedUrl) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/64 [animation:fadeIn_200ms_cubic-bezier(0,0,0.2,1)]"
        onClick={onClose}
      />
      <div className="relative max-w-[900px] w-full bg-surface rounded-lg border border-border shadow-xl overflow-hidden max-h-[85vh] flex flex-col [animation:slideUp_300ms_cubic-bezier(0,0,0.2,1)]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-primary text-sm font-semibold text-text-primary truncate">
            {movieTitle}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="w-8 h-8 rounded-md flex items-center justify-center text-text-secondary hover:bg-surface-variant transition-colors duration-fast"
            aria-label="Cerrar tráiler"
            onClick={onClose}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 relative">
          <div className="pb-[56.25%]">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={embedUrl}
              title={movieTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
}
