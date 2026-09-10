import { Clock, Play, PlayCircle } from "@phosphor-icons/react";
import type { Movie } from "@features/movies/interfaces/movie";
import { formatDuration } from "@features/movies/utils";

export interface HeroSlideContentProps {
  movie: Movie;
  onPlayTrailer: () => void;
  onShowtimes: () => void;
}

export function HeroSlideContent({
  movie,
  onPlayTrailer,
  onShowtimes,
}: HeroSlideContentProps) {
  return (
    <div className="absolute bottom-0 left-0 w-full p-6 pb-16 md:p-10 z-10 flex flex-col items-start gap-2">
      {/* Overline pill */}
      <div className="inline-flex items-center gap-2 mb-2">
        <span className="w-1.5 h-1.5 rounded-sm bg-accent opacity-75" />
        <span className="font-secondary text-[11px] font-bold uppercase tracking-[0.08em] text-accent">
          Cine Flash — 20% OFF
        </span>
      </div>

      {/* Title */}
      <h1 className="font-primary text-[2.25rem] md:text-[3.625rem] font-bold leading-[36px] md:leading-[61px] tracking-tight text-text-primary max-w-[600px]">
        {movie.title}
      </h1>

      {/* Synopsis */}
      <p className="font-secondary text-sm md:text-base leading-relaxed text-text-secondary/85 max-w-[460px] mt-1">
        {movie.synopsis}
      </p>

      {/* Metadata row */}
      <div className="flex items-center gap-2 flex-wrap mt-2">
        <span className="rounded-md border border-text-primary/20 bg-text-primary/10 px-2.5 py-0.5 font-primary text-[11px] font-bold text-text-primary">
          {movie.classification}
        </span>
        <span className="text-white/18 text-xs select-none">·</span>
        <span className="font-secondary text-xs text-text-secondary">
          {movie.genre}
        </span>
        <span className="text-white/18 text-xs select-none">·</span>
        <span className="inline-flex items-center gap-1">
          <Clock size={11} weight="regular" className="text-text-disabled" />
          <span className="font-secondary text-xs text-text-secondary">
            {formatDuration(movie.duration)}
          </span>
        </span>
        <span className="text-white/18 text-xs select-none">·</span>
        <span className="font-secondary text-xs text-text-disabled">
          Dir. {movie.director}
        </span>
      </div>

      {/* CTA row */}
      <div className="flex items-center gap-3 mt-4">
        <button
          type="button"
          onClick={onShowtimes}
          className="flex items-center gap-2 py-3 px-6 rounded-xl bg-accent transition-colors duration-fast hover:bg-accent/90"
        >
          <PlayCircle size={14} className="text-white" />
          <span className="font-primary text-sm font-bold text-white">
            Ver horarios
          </span>
        </button>

        <button
          type="button"
          onClick={onPlayTrailer}
          className="flex items-center gap-2 py-3 px-5 rounded-xl border border-text-primary/15 bg-text-primary/[0.07] transition-colors duration-fast hover:bg-text-primary/[0.12]"
        >
          <Play size={14} className="text-text-primary" />
          <span className="font-primary text-sm font-semibold text-text-primary">
            Ver tráiler
          </span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="w-[5px] h-[5px] rounded-sm bg-warning" />
          <span className="font-secondary text-xs text-warning">
            Descuento disponible hoy
          </span>
        </div>
      </div>
    </div>
  );
}
