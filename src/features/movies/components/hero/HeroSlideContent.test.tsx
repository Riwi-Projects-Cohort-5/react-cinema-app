import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { Movie } from "@features/movies/interfaces/movie";
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

  it('(g) renders "Dir. James Gunn" in director text', () => {
    render(<HeroSlideContent {...defaultProps} />);
    expect(screen.getByText(`Dir. ${mockMovie.director}`)).toBeInTheDocument();
  });

  it("handles long synopsis with max-w-[460px] container constraint", () => {
    const longMovie: Movie = {
      ...mockMovie,
      synopsis:
        "Este es un texto de sinopsis extraordinariamente largo diseñado para verificar que los estilos de layout y contención max-w-[460px] se apliquen correctamente sin desbordar el contenedor del slide activo del carrusel.",
    };
    render(<HeroSlideContent {...defaultProps} movie={longMovie} />);
    const synopsisElement = screen.getByText(longMovie.synopsis);
    expect(synopsisElement).toBeInTheDocument();
    expect(synopsisElement).toHaveClass("max-w-[460px]");
  });
});
