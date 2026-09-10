import { Pause, Play } from "@phosphor-icons/react";

import type { Movie } from "@features/movies/interfaces/movie";
import { cn } from "@shared/utils/cn";

export interface HeroProgressProps {
  movies: Movie[];
  activeIndex: number;
  progress: number;
  isPaused: boolean;
  onGoTo: (index: number) => void;
  onTogglePause: () => void;
}

export function HeroProgress({
  movies,
  activeIndex,
  progress,
  isPaused,
  onGoTo,
  onTogglePause,
}: HeroProgressProps) {
  return (
    <div className="flex justify-center items-center gap-3 pt-3 pb-5 px-10">
      {/* Play/pause toggle button */}
      <button
        type="button"
        onClick={onTogglePause}
        aria-label={isPaused ? "Reanudar autoplay" : "Pausar autoplay"}
        className="w-7 h-7 rounded-full border border-white/14 bg-surface/80 flex items-center justify-center hover:bg-surface transition-colors duration-fast"
      >
        {isPaused ? (
          <Play size={14} className="text-text-secondary" aria-hidden="true" />
        ) : (
          <Pause size={9} className="text-text-secondary" aria-hidden="true" />
        )}
      </button>

      {/* Per-slide thumbnail pills */}
      {movies.map((movie, index) => {
        const isActive = index === activeIndex;
        const fillPercent = Math.round(progress * 100);

        return (
          <button
            key={movie.id}
            type="button"
            onClick={() => onGoTo(index)}
            aria-label={movie.title}
            data-active={isActive ? "true" : undefined}
            className={cn(
              "relative rounded-[0.625rem] overflow-hidden transition-all duration-fast",
              isActive
                ? "w-40 h-[3.25rem] border-2 border-accent bg-surface-variant"
                : "w-24 h-[3.25rem] border-2 border-transparent bg-surface-variant hover:border-white/10"
            )}
          >
            {/* Poster thumbnail */}
            <img
              src={movie.posterUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Inactive overlay */}
            <div className="absolute inset-0 bg-background/30" />

            {/* Active-only elements */}
            {isActive && (
              <>
                {/* Title bar */}
                <div className="absolute top-0.5 left-0.5 px-2 w-[calc(100%-4px)] bg-accent/25 rounded-sm">
                  <p className="font-primary text-[10px] font-bold text-text-primary truncate text-center">
                    {movie.title}
                  </p>
                </div>

                {/* Progress track & fill */}
                <div className="absolute bottom-0.5 left-0.5 w-[calc(100%-4px)] h-[3px] bg-white/12 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
