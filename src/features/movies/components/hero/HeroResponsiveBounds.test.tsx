import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useHeroCarousel, useMovies } from "@features/movies/hooks";
import { MOCK_MOVIES } from "@features/movies/services/movies.mock";
import { formatDuration } from "@features/movies/utils";

import { Hero } from "./Hero";

vi.mock("@features/movies/hooks", () => ({
  useMovies: vi.fn(),
  useHeroCarousel: vi.fn(),
}));

vi.mock("./HeroProgress", () => ({
  HeroProgress: () => <div data-testid="hero-progress" />,
}));

vi.mock("./TrailerLightbox", () => ({
  TrailerLightbox: () => <div data-testid="trailer-lightbox" />,
}));

describe("Hero Responsive Bounds & Content Visibility Integration", () => {
  const mockNext = vi.fn();
  const mockPrev = vi.fn();
  const mockGoTo = vi.fn();
  const mockTogglePause = vi.fn();
  const mockPause = vi.fn();
  const mockResume = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.mocked(useMovies).mockReturnValue({
      data: MOCK_MOVIES,
      isPending: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof useMovies>);

    vi.mocked(useHeroCarousel).mockReturnValue({
      activeIndex: 0,
      activeItem: MOCK_MOVIES[0]!,
      goTo: mockGoTo,
      next: mockNext,
      prev: mockPrev,
      isPaused: false,
      togglePause: mockTogglePause,
      pause: mockPause,
      resume: mockResume,
      progress: 0.25,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Every fixture movie active-card text & CTA visibility contract", () => {
    MOCK_MOVIES.forEach((movie, activeIndex) => {
      it(`renders complete active card content and both CTAs when "${movie.title}" is active at index ${activeIndex}`, () => {
        vi.mocked(useHeroCarousel).mockReturnValue({
          activeIndex,
          activeItem: movie,
          goTo: mockGoTo,
          next: mockNext,
          prev: mockPrev,
          isPaused: false,
          togglePause: mockTogglePause,
          pause: mockPause,
          resume: mockResume,
          progress: (activeIndex + 1) / MOCK_MOVIES.length,
        });

        const { container } = render(<Hero />);

        const activeHeading = screen.getByRole("heading", { level: 1, name: movie.title });
        expect(activeHeading).toBeInTheDocument();
        expect(activeHeading).toHaveClass("font-primary");

        expect(screen.getByText(movie.synopsis)).toBeInTheDocument();
        expect(screen.getByText(movie.rating)).toBeInTheDocument();
        expect(screen.getByText(movie.genre)).toBeInTheDocument();
        expect(screen.getByText(formatDuration(movie.duration))).toBeInTheDocument();
        expect(screen.getByText(`Dir. ${movie.director}`)).toBeInTheDocument();
        expect(screen.getByText("Cine Flash — 20% OFF")).toBeInTheDocument();
        expect(screen.getByText("Descuento disponible hoy")).toBeInTheDocument();

        const showtimesBtn = screen.getByRole("button", { name: /Ver horarios/i });
        const trailerBtn = screen.getByRole("button", { name: /Ver tráiler/i });

        expect(showtimesBtn).toBeInTheDocument();
        expect(trailerBtn).toBeInTheDocument();
        expect(showtimesBtn).toHaveClass("whitespace-nowrap");
        expect(trailerBtn).toHaveClass("whitespace-nowrap");

        const slides = container.querySelectorAll("[data-state]");
        expect(slides.length).toBe(MOCK_MOVIES.length);

        MOCK_MOVIES.forEach((otherMovie, idx) => {
          if (idx !== activeIndex) {
            const lateralSlide = slides[idx]!;
            expect(lateralSlide).toHaveAttribute("data-state");
            expect(lateralSlide.textContent).toContain(otherMovie.title);
          }
        });
      });
    });
  });

  describe("Mobile Happy Path Layout & Geometry Invariants", () => {
    it("preserves single-card mobile layout, mt-5 section, and min-h-[600px] viewport", () => {
      const { container } = render(<Hero />);

      const section = container.querySelector("section");
      expect(section).toBeInTheDocument();
      expect(section).toHaveClass("w-full");
      expect(section).toHaveClass("overflow-hidden");
      expect(section).toHaveClass("mt-5");
      expect(section).toHaveClass("mt-5");
      expect(section).toHaveClass("bg-background");
      expect(section).not.toHaveClass("rounded-[1.25rem]");

      const viewport = container.querySelector("#hero-carousel");
      expect(viewport).toBeInTheDocument();
      expect(viewport).toHaveClass("w-full");
      expect(viewport).toHaveClass("overflow-hidden");
      expect(viewport).toHaveClass("min-h-[600px]");
      expect(viewport).toHaveClass("md:min-h-0");
      expect(viewport).toHaveClass("lg:min-h-0");

      const track = container.querySelector("#hero-carousel > div") as HTMLElement;
      expect(track).toBeInTheDocument();
      expect(track).toHaveClass("translate-x-[calc(-1*var(--hero-i)*(100%+1rem))]");
      expect(track).toHaveClass("md:translate-x-[calc(7.5%-var(--hero-i)*(85%+1rem))]");
      expect(track.style.getPropertyValue("--hero-i")).toBe("0");

      const slides = container.querySelectorAll("[data-state]");
      slides.forEach((slide) => {
        expect(slide).toHaveClass("w-full");
        expect(slide).toHaveClass("md:w-[85%]");
        expect(slide).toHaveClass("rounded-2xl");
      });
    });
  });

  describe("Constrained Tablet Failure-Path Invariants (768px / 430px Budget)", () => {
    it("pins tablet vertical and horizontal content bounds to prevent slide overflow", () => {
      const { container } = render(<Hero />);

      const viewport = container.querySelector("#hero-carousel");
      expect(viewport).toHaveClass("md:h-[430px]");

      const activeSlide = container.querySelector('[data-state="active"]')!;
      expect(activeSlide).toBeInTheDocument();

      const contentContainer = activeSlide.querySelector(".absolute.bottom-0");
      expect(contentContainer).toBeInTheDocument();
      expect(contentContainer).toHaveClass("md:p-6");
      expect(contentContainer).not.toHaveClass("md:p-10");
      expect(contentContainer).not.toHaveClass("md:p-8");

      const titleEl = screen.getByRole("heading", { level: 1, name: MOCK_MOVIES[0]!.title });
      expect(titleEl).toHaveClass("md:text-2xl");
      expect(titleEl).not.toHaveClass("md:text-5xl");

      const synopsisEl = screen.getByText(MOCK_MOVIES[0]!.synopsis);
      expect(synopsisEl).toHaveClass("md:line-clamp-2");
      expect(synopsisEl).toHaveClass("md:text-xs");

      const showtimesBtn = screen.getByRole("button", { name: /Ver horarios/i });
      const trailerBtn = screen.getByRole("button", { name: /Ver tráiler/i });
      expect(showtimesBtn).toHaveClass("whitespace-nowrap");
      expect(trailerBtn).toHaveClass("whitespace-nowrap");

      const directorEl = screen.getByText(`Dir. ${MOCK_MOVIES[0]!.director}`);
      expect(directorEl).toHaveClass("max-w-[140px]");
      expect(directorEl).toHaveClass("truncate");
    });
  });

  describe("Navigation & Active Item Change Invariants", () => {
    it("clicking next updates track transform property and renders newly active movie content", () => {
      const { rerender } = render(<Hero />);

      expect(
        screen.getByRole("heading", { level: 1, name: MOCK_MOVIES[0]!.title })
      ).toBeInTheDocument();

      const nextButton = screen.getByRole("button", { name: "Siguiente" });
      fireEvent.click(nextButton);
      expect(mockNext).toHaveBeenCalledTimes(1);

      vi.mocked(useHeroCarousel).mockReturnValue({
        activeIndex: 1,
        activeItem: MOCK_MOVIES[1]!,
        goTo: mockGoTo,
        next: mockNext,
        prev: mockPrev,
        isPaused: false,
        togglePause: mockTogglePause,
        pause: mockPause,
        resume: mockResume,
        progress: 0.5,
      });

      rerender(<Hero />);

      expect(
        screen.getByRole("heading", { level: 1, name: MOCK_MOVIES[1]!.title })
      ).toBeInTheDocument();
      const track = document.querySelector("#hero-carousel > div") as HTMLElement;
      expect(track.style.getPropertyValue("--hero-i")).toBe("1");
    });
  });
});
