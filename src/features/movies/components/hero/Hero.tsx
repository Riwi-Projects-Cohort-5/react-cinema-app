import { useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

import { useHeroCarousel, useMovies } from "@features/movies/hooks";
import { getBackdropUrl } from "@features/movies/utils";
import { notifyInfo } from "@services/notify";
import { cn } from "@shared/utils/cn";

import { HeroProgress, HeroSlideContent, TrailerLightbox } from "@features/movies/components";

export function Hero() {
  const { data: movies, isPending, isError, refetch } = useMovies();
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);

  const carousel = useHeroCarousel(movies ?? []);

  if (isPending) {
    return (
      <div
        data-testid="hero-skeleton"
        aria-label="Cargando películas"
        role="status"
        className="w-full h-[520px] md:h-[430px] lg:h-[520px] min-h-[600px] md:min-h-0 lg:min-h-0 pt-8 bg-surface-variant animate-[shimmer_1.5s_linear_infinite] bg-[linear-gradient(90deg,var(--color-surface-variant)_25%,var(--color-surface)_50%,var(--color-surface-variant)_75%)] bg-[length:200%_100%]"
      />
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 w-full h-[520px] md:h-[430px] lg:h-[520px] min-h-[600px] md:min-h-0 lg:min-h-0 pt-8 bg-surface-variant p-6 text-center">
        <p className="text-text-secondary">No pudimos cargar las películas</p>
        <button
          type="button"
          onClick={() => {
            void refetch();
          }}
          className="border border-text-primary/20 px-4 py-2 rounded-lg text-sm text-text-primary hover:bg-surface-variant transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-[520px] md:h-[430px] lg:h-[520px] min-h-[600px] md:min-h-0 lg:min-h-0 pt-8 bg-surface-variant p-6 text-center">
        <p className="text-text-secondary">No hay películas disponibles</p>
      </div>
    );
  }

  const {
    activeIndex,
    goTo,
    next,
    prev,
    isPaused,
    togglePause,
    progress,
  } = carousel;

  const activeMovie = movies[activeIndex] ?? movies[0]!;

  return (
    <section
      role="region"
      aria-label="Carrusel de películas destacadas"
      aria-roledescription="carrusel"
      data-carousel-state={isPaused ? "paused" : "playing"}
      className="relative w-full overflow-hidden bg-background pt-8"
    >
      {/* Visual viewport */}
      <div
        id="hero-carousel"
        data-active-index={activeIndex}
        className="relative w-full overflow-hidden h-[520px] md:h-[430px] lg:h-[520px] min-h-[600px] md:min-h-0 lg:min-h-0"
      >
        {/* Continuous track */}
        <div
          className="flex gap-4 h-full transition-transform duration-500 ease-in-out motion-reduce:transition-none"
          style={{
            transform: `translateX(calc(16.1% - ${activeIndex} * (67.8% + 1rem)))`,
          }}
        >
          {movies.map((movie, index) => {
            const isActive = index === activeIndex;
            const isPrev = index === (activeIndex - 1 + movies.length) % movies.length;
            const isNext = index === (activeIndex + 1) % movies.length;
            const slideState = isActive
              ? "active"
              : isPrev
                ? "prev"
                : isNext
                  ? "next"
                  : "other";

            return (
              <div
                key={movie.id}
                data-state={slideState}
                aria-current={isActive ? "true" : undefined}
                onClick={() => {
                  if (!isActive) {
                    goTo(index);
                  }
                }}
                className={cn(
                  "flex-shrink-0 w-[67.8%] h-full relative overflow-hidden rounded-2xl transition-all duration-300",
                  isActive
                    ? "border border-accent/20 bg-background"
                    : "border border-transparent cursor-pointer"
                )}
              >
                {/* Backdrop image */}
                <div
                  data-testid={`hero-backdrop-${index}`}
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${getBackdropUrl(movie.posterUrl)})`,
                  }}
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-background/88 via-background/52 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/52" />

                {/* Active content vs lateral label */}
                {isActive ? (
                  <HeroSlideContent
                    movie={activeMovie}
                    onPlayTrailer={() => setLightboxOpen(true)}
                    onShowtimes={() => notifyInfo("Próximamente")}
                  />
                ) : (
                  <div className="absolute bottom-6 left-6 right-6 z-10">
                    <p className="font-primary text-sm font-semibold text-text-primary truncate">
                      {movie.title}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation arrows */}
        <button
          type="button"
          onClick={prev}
          aria-label="Anterior"
          aria-controls="hero-carousel"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center bg-background/65 border border-white/10 rounded-full backdrop-blur-sm z-20 text-text-primary shadow-xl hover:bg-background/80 transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <CaretLeft size={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Siguiente"
          aria-controls="hero-carousel"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center bg-background/65 border border-white/10 rounded-full backdrop-blur-sm z-20 text-text-primary shadow-xl hover:bg-background/80 transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <CaretRight size={20} aria-hidden="true" />
        </button>
      </div>

      {/* Progress indicators and controls */}
      <HeroProgress
        movies={movies}
        activeIndex={activeIndex}
        progress={progress}
        isPaused={isPaused}
        onGoTo={goTo}
        onTogglePause={togglePause}
      />

      {/* Trailer lightbox modal */}
      <TrailerLightbox
        isOpen={lightboxOpen}
        trailerUrl={activeMovie.trailerUrl}
        onClose={() => setLightboxOpen(false)}
        movieTitle={activeMovie.title}
      />
    </section>
  );
}
