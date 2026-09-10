import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Movie } from "@features/movies/interfaces/movie";
import { useHeroCarousel, useMovies } from "@features/movies/hooks";
import { MOCK_MOVIES } from "@features/movies/services/movies.mock";
import { getBackdropUrl } from "@features/movies/utils";

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

vi.mock("./HeroSlideContent", () => ({
  HeroSlideContent: ({ movie }: { movie: Movie }) => (
    <div data-testid="hero-slide-content">{movie.title}</div>
  ),
}));

const testMovies: Movie[] = MOCK_MOVIES.slice(0, 3);

describe("Hero component", () => {
  const mockNext = vi.fn();
  const mockPrev = vi.fn();
  const mockGoTo = vi.fn();
  const mockTogglePause = vi.fn();
  const mockPause = vi.fn();
  const mockResume = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.mocked(useMovies).mockReturnValue({
      data: testMovies,
      isPending: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    } as any);

    vi.mocked(useHeroCarousel).mockReturnValue({
      activeIndex: 0,
      activeItem: testMovies[0]!,
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

  it("renders skeleton while isPending=true without outer card border radius and with section geometry", () => {
    vi.mocked(useMovies).mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      error: null,
      refetch: mockRefetch,
    } as any);

    const { container } = render(<Hero />);
    const skeleton =
      container.querySelector('[aria-label="Cargando películas"]') ||
      container.querySelector('[data-testid="hero-skeleton"]');

    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("role", "status");
    expect(skeleton).toHaveAttribute("aria-label", "Cargando películas");
    expect(skeleton).toHaveClass("w-full");
    expect(skeleton).toHaveClass("h-[520px]");
    expect(skeleton).toHaveClass("md:h-[430px]");
    expect(skeleton).toHaveClass("lg:h-[520px]");
    expect(skeleton).toHaveClass("min-h-[600px]");
    expect(skeleton).toHaveClass("md:min-h-0");
    expect(skeleton).toHaveClass("lg:min-h-0");
    expect(window.getComputedStyle(skeleton!).borderRadius).not.toMatch(/1\.25rem/);
  });

  it("renders error message and retry button on error, clicking retry calls refetch", () => {
    vi.mocked(useMovies).mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error("Network error"),
      refetch: mockRefetch,
    } as any);

    const { container } = render(<Hero />);

    expect(screen.getByText(/No pudimos cargar las películas/i)).toBeInTheDocument();
    const retryButton = screen.getByRole("button", { name: /reintentar/i });
    expect(retryButton).toBeInTheDocument();

    const errorContainer = container.querySelector(".bg-surface-variant");
    expect(errorContainer).toBeInTheDocument();
    expect(errorContainer).toHaveClass("w-full");
    expect(errorContainer).toHaveClass("h-[520px]");
    expect(errorContainer).toHaveClass("md:h-[430px]");
    expect(errorContainer).toHaveClass("lg:h-[520px]");
    expect(errorContainer).toHaveClass("min-h-[600px]");
    expect(errorContainer).toHaveClass("md:min-h-0");
    expect(errorContainer).toHaveClass("lg:min-h-0");
    expect(window.getComputedStyle(errorContainer!).borderRadius).not.toMatch(/1\.25rem/);

    fireEvent.click(retryButton);
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("renders empty state message when movies list is empty", () => {
    vi.mocked(useMovies).mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    } as any);

    const { container } = render(<Hero />);

    expect(screen.getByText(/No hay películas disponibles/i)).toBeInTheDocument();
    const emptyContainer = container.querySelector(".bg-surface-variant");
    expect(emptyContainer).toBeInTheDocument();
    expect(emptyContainer).toHaveClass("w-full");
    expect(emptyContainer).toHaveClass("h-[520px]");
    expect(emptyContainer).toHaveClass("md:h-[430px]");
    expect(emptyContainer).toHaveClass("lg:h-[520px]");
    expect(emptyContainer).toHaveClass("min-h-[600px]");
    expect(emptyContainer).toHaveClass("md:min-h-0");
    expect(emptyContainer).toHaveClass("lg:min-h-0");
    expect(window.getComputedStyle(emptyContainer!).borderRadius).not.toMatch(/1\.25rem/);
  });

  it("renders 3 slides in correct order and accessible region container", () => {
    const { container } = render(<Hero />);

    const region = screen.getByRole("region", {
      name: "Carrusel de películas destacadas",
    });
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute("aria-roledescription", "carrusel");

    const slides = container.querySelectorAll("[data-state]");
    expect(slides.length).toBe(3);

    // Verify all titles are present
    expect(screen.getByText(testMovies[0]!.title)).toBeInTheDocument();
    expect(screen.getByText(testMovies[1]!.title)).toBeInTheDocument();
    expect(screen.getByText(testMovies[2]!.title)).toBeInTheDocument();
  });

  it("supports wraparound navigation when clicking next and prev buttons", () => {
    render(<Hero />);

    const prevButton = screen.getByRole("button", { name: "Anterior" });
    const nextButton = screen.getByRole("button", { name: "Siguiente" });

    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    expect(prevButton).toHaveAttribute("aria-controls", "hero-carousel");
    expect(nextButton).toHaveAttribute("aria-controls", "hero-carousel");

    fireEvent.click(nextButton);
    expect(mockNext).toHaveBeenCalledTimes(1);

    fireEvent.click(prevButton);
    expect(mockPrev).toHaveBeenCalledTimes(1);
  });

  it("applies active background URL using getBackdropUrl()", () => {
    const { container } = render(<Hero />);

    const activeBackdrop = container.querySelector('[data-testid="hero-backdrop-0"]');
    expect(activeBackdrop).toBeInTheDocument();

    const expectedBackdropUrl = getBackdropUrl(testMovies[0]!.posterUrl);
    expect(activeBackdrop?.getAttribute("style")).toContain(expectedBackdropUrl);
  });

  it("does not render any floating poster <img> element", () => {
    const { container } = render(<Hero />);

    const posterImgs = container.querySelectorAll("img");
    // Progress is mocked, so Hero itself must have zero <img> tags (no floating poster artwork)
    expect(posterImgs.length).toBe(0);

    const posterAlt = screen.queryByAltText(/póster/i);
    expect(posterAlt).not.toBeInTheDocument();
  });

  it("ensures section and viewport containers do not overflow", () => {
    const { container } = render(<Hero />);

    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass("overflow-hidden");
    expect(section).toHaveClass("w-full");
    expect(window.getComputedStyle(section!).borderRadius).not.toMatch(/1\.25rem/);

    const viewport = container.querySelector("#hero-carousel");
    expect(viewport).toBeInTheDocument();
    expect(viewport).toHaveClass("overflow-hidden");
    expect(viewport).toHaveClass("w-full");
    expect(viewport).toHaveClass("h-[520px]");
    expect(viewport).toHaveClass("md:h-[430px]");
    expect(viewport).toHaveClass("lg:h-[520px]");
    expect(viewport).toHaveClass("min-h-[600px]");
    expect(viewport).toHaveClass("md:min-h-0");
    expect(viewport).toHaveClass("lg:min-h-0");
    expect(viewport).toHaveAttribute("data-active-index", "0");
  });

  it("exposes data-carousel-state and updates when isPaused changes", () => {
    const { container, rerender } = render(<Hero />);
    const section = container.querySelector("section");
    expect(section).toHaveAttribute("data-carousel-state", "playing");

    vi.mocked(useHeroCarousel).mockReturnValue({
      activeIndex: 1,
      activeItem: testMovies[1]!,
      goTo: mockGoTo,
      next: mockNext,
      prev: mockPrev,
      isPaused: true,
      togglePause: mockTogglePause,
      pause: mockPause,
      resume: mockResume,
      progress: 0.5,
    });

    rerender(<Hero />);
    expect(section).toHaveAttribute("data-carousel-state", "paused");
    const viewport = container.querySelector("#hero-carousel");
    expect(viewport).toHaveAttribute("data-active-index", "1");
  });

  it("marks active slide with data-state='active' and aria-current='true' with rounded-2xl corners", () => {
    const { container } = render(<Hero />);

    const activeSlide = container.querySelector('[data-state="active"]');
    expect(activeSlide).toBeInTheDocument();
    expect(activeSlide).toHaveAttribute("aria-current", "true");
    expect(activeSlide).toHaveClass("rounded-2xl");

    const slides = container.querySelectorAll("[data-state]");
    slides.forEach((slide) => {
      expect(slide).toHaveClass("rounded-2xl");
    });
  });

  it("clicking a lateral slide calls goTo with the slide index", () => {
    const { container } = render(<Hero />);

    const slides = container.querySelectorAll("[data-state]");
    const lateralSlide = slides[1];
    expect(lateralSlide).toBeInTheDocument();

    if (lateralSlide) {
      fireEvent.click(lateralSlide);
      expect(mockGoTo).toHaveBeenCalledWith(1);
    }
  });
});
