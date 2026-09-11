import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { Movie } from "@features/movies/interfaces/movie";
import { MOCK_MOVIES } from "@features/movies/services/movies.mock";
import { HeroSlideContent } from "./HeroSlideContent";

const mockMovie: Movie = {
  id: 1,
  title: "Guardianes de la Galaxia",
  synopsis: "La aventura más divertida del universo cinematográfico.",
  genre: "Acción",
  classification: "+7",
  duration: 148,
  director: "James Gunn",
  language: "Español Latino",
  isSubtitled: false,
  posterUrl: "https://image.tmdb.org/t/p/w500/test.jpg",
  trailerUrl: "https://www.youtube.com/watch?v=test",
  releaseDate: "2023-05-05",
  rating: 8.5,
  isActive: true,
};

describe("HeroSlideContent", () => {
  const defaultProps = {
    movie: mockMovie,
    onPlayTrailer: vi.fn(),
    onShowtimes: vi.fn(),
  };

  it("(a) renders movie title in h1", () => {
    render(<HeroSlideContent {...defaultProps} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(mockMovie.title);
  });

  it("(b) renders synopsis text", () => {
    render(<HeroSlideContent {...defaultProps} />);
    expect(screen.getByText(mockMovie.synopsis)).toBeInTheDocument();
  });

  it("(c) renders classification badge containing movie.classification", () => {
    render(<HeroSlideContent {...defaultProps} />);
    const badge = screen.getByText(mockMovie.classification);
    expect(badge).toBeInTheDocument();
  });

  it('(d) "Ver horarios" button calls onShowtimes on click', () => {
    const onShowtimes = vi.fn();
    render(<HeroSlideContent {...defaultProps} onShowtimes={onShowtimes} />);
    const button = screen.getByRole("button", { name: /Ver horarios/i });
    fireEvent.click(button);
    expect(onShowtimes).toHaveBeenCalledTimes(1);
  });

  it('(e) "Ver tráiler" button calls onPlayTrailer on click', () => {
    const onPlayTrailer = vi.fn();
    render(<HeroSlideContent {...defaultProps} onPlayTrailer={onPlayTrailer} />);
    const button = screen.getByRole("button", { name: /Ver tráiler/i });
    fireEvent.click(button);
    expect(onPlayTrailer).toHaveBeenCalledTimes(1);
  });

  it('(f) renders overline "Cine Flash — 20% OFF"', () => {
    render(<HeroSlideContent {...defaultProps} />);
    expect(screen.getByText("Cine Flash — 20% OFF")).toBeInTheDocument();
  });

  it('(g) renders "Dir. James Gunn" in director text with truncate constraints', () => {
    render(<HeroSlideContent {...defaultProps} />);
    const directorElement = screen.getByText(`Dir. ${mockMovie.director}`);
    expect(directorElement).toBeInTheDocument();
    expect(directorElement).toHaveClass("inline-block");
    expect(directorElement).toHaveClass("max-w-[140px]");
    expect(directorElement).toHaveClass("truncate");
  });

  it('(h) renders discount note "Descuento disponible hoy"', () => {
    render(<HeroSlideContent {...defaultProps} />);
    expect(screen.getByText("Descuento disponible hoy")).toBeInTheDocument();
  });

  it("applies responsive padding to content container (pb-6 mobile, md:p-6, lg:p-8)", () => {
    const { container } = render(<HeroSlideContent {...defaultProps} />);
    const root = container.firstElementChild;
    expect(root).toHaveClass("pb-6");
    expect(root).toHaveClass("md:p-6");
    expect(root).toHaveClass("lg:p-8");
  });

  it("handles long synopsis with max-w-[460px] and responsive line clamp constraints", () => {
    const longMovie: Movie = {
      ...mockMovie,
      synopsis:
        "Este es un texto de sinopsis extraordinariamente largo diseñado para verificar que los estilos de layout y contención max-w-[460px] se apliquen correctamente sin desbordar el contenedor del slide activo del carrusel.",
    };
    render(<HeroSlideContent {...defaultProps} movie={longMovie} />);
    const synopsisElement = screen.getByText(longMovie.synopsis);
    expect(synopsisElement).toBeInTheDocument();
    expect(synopsisElement).toHaveClass("max-w-[460px]");
    expect(synopsisElement).toHaveClass("line-clamp-2");
    expect(synopsisElement).toHaveClass("sm:line-clamp-3");
    expect(synopsisElement).toHaveClass("md:line-clamp-2");
    expect(synopsisElement).toHaveClass("lg:line-clamp-3");
  });

  it("handles long title with max-w-[600px] and responsive font size scale", () => {
    const longMovie: Movie = {
      ...mockMovie,
      title: "Guardianes de la Galaxia Volumen Especial de Colección Definitiva Expandida",
    };
    render(<HeroSlideContent {...defaultProps} movie={longMovie} />);
    const titleElement = screen.getByRole("heading", { level: 1 });
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveClass("max-w-[600px]");
    expect(titleElement).toHaveClass("text-2xl");
    expect(titleElement).toHaveClass("sm:text-3xl");
    expect(titleElement).toHaveClass("md:text-2xl");
    expect(titleElement).toHaveClass("lg:text-4xl");
  });

  it("ensures CTA buttons have whitespace-nowrap to prevent text wrapping", () => {
    render(<HeroSlideContent {...defaultProps} />);
    const showtimesButton = screen.getByRole("button", { name: /Ver horarios/i });
    const trailerButton = screen.getByRole("button", { name: /Ver tráiler/i });

    expect(showtimesButton).toHaveClass("whitespace-nowrap");
    expect(trailerButton).toHaveClass("whitespace-nowrap");
  });

  describe("Content contract across all mock fixture movies", () => {
    MOCK_MOVIES.forEach((movie) => {
      it(`renders full content contract for fixture movie: "${movie.title}"`, () => {
        const onShowtimes = vi.fn();
        const onPlayTrailer = vi.fn();
        render(
          <HeroSlideContent
            movie={movie}
            onPlayTrailer={onPlayTrailer}
            onShowtimes={onShowtimes}
          />
        );
        
        expect(screen.getByText("Cine Flash — 20% OFF")).toBeInTheDocument();
        
        const titleEl = screen.getByRole("heading", { level: 1, name: movie.title });
        expect(titleEl).toBeInTheDocument();
        
        expect(screen.getByText(movie.synopsis)).toBeInTheDocument();
        expect(screen.getByText(movie.classification)).toBeInTheDocument();
        expect(screen.getByText(movie.genre)).toBeInTheDocument();
        expect(screen.getByText(`Dir. ${movie.director}`)).toBeInTheDocument();
        
        const showtimesBtn = screen.getByRole("button", { name: /Ver horarios/i });
        const trailerBtn = screen.getByRole("button", { name: /Ver tráiler/i });
        expect(showtimesBtn).toBeInTheDocument();
        expect(trailerBtn).toBeInTheDocument();
        expect(showtimesBtn).toHaveClass("whitespace-nowrap");
        expect(trailerBtn).toHaveClass("whitespace-nowrap");

        fireEvent.click(showtimesBtn);
        expect(onShowtimes).toHaveBeenCalledTimes(1);

        fireEvent.click(trailerBtn);
        expect(onPlayTrailer).toHaveBeenCalledTimes(1);

        expect(screen.getByText("Descuento disponible hoy")).toBeInTheDocument();
      });
    });
  });

  describe("Responsive geometry bounds & failure-path assertions", () => {
    it("mobile happy path: enforces mobile padding, font scales, clamp, and full-width CTA layout", () => {
      const { container } = render(<HeroSlideContent {...defaultProps} />);
      const root = container.firstElementChild;
      expect(root).toHaveClass("p-6");
      expect(root).toHaveClass("pb-6");

      const titleEl = screen.getByRole("heading", { level: 1 });
      expect(titleEl).toHaveClass("text-2xl");
      expect(titleEl).toHaveClass("sm:text-3xl");

      const synopsisEl = screen.getByText(mockMovie.synopsis);
      expect(synopsisEl).toHaveClass("text-xs");
      expect(synopsisEl).toHaveClass("sm:text-sm");
      expect(synopsisEl).toHaveClass("line-clamp-2");
      expect(synopsisEl).toHaveClass("sm:line-clamp-3");

      const ctaRow = container.querySelector(".flex-col.sm\\:flex-row");
      expect(ctaRow).toBeInTheDocument();
      expect(ctaRow).toHaveClass("w-full");
      expect(ctaRow).toHaveClass("sm:w-auto");
      expect(ctaRow).toHaveClass("items-stretch");
      expect(ctaRow).toHaveClass("sm:items-center");
    });

    it("constrained tablet failure-path: pins vertical & horizontal budget constraints to prevent 430px height blowout", () => {
      const { container } = render(<HeroSlideContent {...defaultProps} />);
      const root = container.firstElementChild;
      
      expect(root).toHaveClass("md:p-6");
      expect(root).not.toHaveClass("md:p-10");
      expect(root).not.toHaveClass("md:p-8");

      const titleEl = screen.getByRole("heading", { level: 1 });
      expect(titleEl).toHaveClass("md:text-2xl");
      expect(titleEl).not.toHaveClass("md:text-5xl");

      const synopsisEl = screen.getByText(mockMovie.synopsis);
      expect(synopsisEl).toHaveClass("md:line-clamp-2");
      expect(synopsisEl).toHaveClass("md:text-xs");

      const showtimesBtn = screen.getByRole("button", { name: /Ver horarios/i });
      const trailerBtn = screen.getByRole("button", { name: /Ver tráiler/i });
      expect(showtimesBtn).toHaveClass("whitespace-nowrap");
      expect(trailerBtn).toHaveClass("whitespace-nowrap");

      const directorEl = screen.getByText(`Dir. ${mockMovie.director}`);
      expect(directorEl).toHaveClass("max-w-[140px]");
      expect(directorEl).toHaveClass("truncate");
    });

    it("desktop expansion bounds: verifies lg padding and typography scale", () => {
      const { container } = render(<HeroSlideContent {...defaultProps} />);
      const root = container.firstElementChild;
      expect(root).toHaveClass("lg:p-8");

      const titleEl = screen.getByRole("heading", { level: 1 });
      expect(titleEl).toHaveClass("lg:text-4xl");

      const synopsisEl = screen.getByText(mockMovie.synopsis);
      expect(synopsisEl).toHaveClass("lg:line-clamp-3");
      expect(synopsisEl).toHaveClass("lg:text-sm");
    });
  });
});
