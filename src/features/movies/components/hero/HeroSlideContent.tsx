import { Clock, Play, PlayCircle } from "@phosphor-icons/react";
import type { Movie } from "@features/movies/interfaces/movie";
import { formatDuration } from "@features/movies/utils";

export interface HeroSlideContentProps {
  movie: Movie;
  onPlayTrailer: () => void;
  onShowtimes: () => void;
}

export function HeroSlideContent({ movie, onPlayTrailer, onShowtimes }: HeroSlideContentProps) {
  return (
    <div className="absolute bottom-0 left-0 w-full p-6 pb-6 md:p-6 lg:p-8 z-10 flex flex-col items-start gap-1.5 sm:gap-2">
      {/* Overline pill */}
      <div className="inline-flex items-center gap-2 mb-1 sm:mb-1.5">
        <span className="w-1.5 h-1.5 rounded-sm bg-accent opacity-75" />
        <span className="font-secondary text-[11px] font-bold uppercase tracking-[0.08em] text-accent">
          Cine Flash — 20% OFF
        </span>
      </div>

      {/* Title */}
      <h1 className="font-primary text-2xl sm:text-3xl md:text-2xl lg:text-4xl font-bold leading-tight tracking-tight text-text-primary max-w-[600px]">
        {movie.title}
      </h1>

      {/* Synopsis */}
      <p className="font-secondary text-xs sm:text-sm md:text-xs lg:text-sm leading-relaxed text-text-secondary/85 max-w-[460px] mt-0.5 sm:mt-1 line-clamp-2 sm:line-clamp-3 md:line-clamp-2 lg:line-clamp-3">
        {movie.synopsis}
      </p>

      {/* Metadata row */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mt-1 sm:mt-2">
        <span className="rounded-md border border-text-primary/20 bg-text-primary/10 px-2.5 py-0.5 font-primary text-[11px] font-bold text-text-primary">
          {movie.rating}
        </span>
        <span className="text-text-disabled/40 text-xs select-none">·</span>
        <span className="font-secondary text-xs text-text-secondary">{movie.genre}</span>
        <span className="text-text-disabled/40 text-xs select-none">·</span>
        <span className="inline-flex items-center gap-1">
          <Clock size={11} weight="regular" className="text-text-disabled" aria-hidden="true" />
          <span className="font-secondary text-xs text-text-secondary">
            {formatDuration(movie.duration)}
          </span>
        </span>
        {movie.director && (
          <>
            <span className="text-text-disabled/40 text-xs select-none">·</span>
            <span className="font-secondary text-xs text-text-disabled inline-block max-w-[140px] truncate align-bottom">
              Dir. {movie.director}
            </span>
          </>
        )}
      </div>

      {/* CTA row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 mt-2.5 sm:mt-4 w-full sm:w-auto">
        <button
          type="button"
          onClick={onShowtimes}
          className="flex items-center justify-center gap-2 py-2.5 px-5 sm:py-3 sm:px-6 rounded-xl bg-accent transition-colors duration-fast hover:bg-accent/90 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 whitespace-nowrap"
        >
          <PlayCircle size={16} weight="regular" className="text-white" aria-hidden="true" />
          <span className="font-primary text-sm font-bold text-white">Ver horarios</span>
        </button>

        <button
          type="button"
          onClick={onPlayTrailer}
          className="flex items-center justify-center gap-2 py-2.5 px-4 sm:py-3 sm:px-5 rounded-xl border border-text-primary/15 bg-text-primary/[0.07] transition-colors duration-fast hover:bg-text-primary/[0.12] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 whitespace-nowrap"
        >
          <Play size={14} weight="regular" className="text-text-primary" aria-hidden="true" />
          <span className="font-primary text-sm font-semibold text-text-primary">Ver tráiler</span>
        </button>

        <div className="flex items-center gap-1.5 self-start sm:self-center">
          <span className="w-[5px] h-[5px] rounded-sm bg-warning" />
          <span className="font-secondary text-xs text-warning whitespace-nowrap">
            Descuento disponible hoy
          </span>
        </div>
      </div>
    </div>
  );
}
