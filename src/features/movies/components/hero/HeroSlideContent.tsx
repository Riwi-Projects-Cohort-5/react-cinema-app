import { Clock, Play, PlayCircle } from "@phosphor-icons/react";
import type { Movie } from "@features/movies/interfaces/movie";
import { formatDuration } from "@features/movies/utils";
import { Button, GreenIndicator } from "@shared/components/primitives";

export interface HeroSlideContentProps {
  movie: Movie;
  onPlayTrailer: () => void;
  onShowtimes: () => void;
}

export function HeroSlideContent({ movie, onPlayTrailer, onShowtimes }: HeroSlideContentProps) {
  return (
    <div className="absolute bottom-0 left-0 w-full p-6 pb-6 md:p-6 lg:p-8 z-10 flex flex-col items-start gap-1.5 sm:gap-2">
      {/* Overline pill */}
      <GreenIndicator text="Cine Flash — 20% OFF" className="inline-flex mb-1 sm:mb-1.5" />

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
        <Button
          type="button"
          onClick={onShowtimes}
          className="bg-accent hover:bg-accent/90 rounded-xl py-2.5 px-5 sm:py-3 sm:px-6 text-sm whitespace-nowrap duration-fast focus:ring-0 focus:ring-offset-0 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <PlayCircle size={16} weight="regular" className="text-white" aria-hidden="true" />
          <span className="font-primary text-sm font-bold text-white">Ver horarios</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onPlayTrailer}
          className="border border-text-primary/15 bg-text-primary/[0.07] hover:bg-text-primary/[0.12] rounded-xl py-2.5 px-4 sm:py-3 sm:px-5 text-sm text-text-primary whitespace-nowrap duration-fast focus:ring-0 focus:ring-offset-0 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <Play size={14} weight="regular" className="text-text-primary" aria-hidden="true" />
          <span className="font-primary text-sm font-semibold text-text-primary">Ver tráiler</span>
        </Button>

        <GreenIndicator
          text="Descuento disponible hoy"
          tone="warning"
          className="whitespace-nowrap self-start sm:self-center"
        />
      </div>
    </div>
  );
}
