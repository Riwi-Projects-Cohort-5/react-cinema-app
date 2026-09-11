import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Movie } from "@features/movies/interfaces/movie";

import { HeroProgress } from "./HeroProgress";

const mockMovies: Movie[] = [
  {
    id: 1,
    title: "Spider-Man: No Way Home",
    synopsis: "Peter Parker busca ayuda del Doctor Strange.",
    genre: "Accion",
    rating: "PG-13",
    duration: 148,
    director: "Jon Watts",
    imageUrl: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800",
    bannerUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200",
    trailerUrl: "https://www.youtube.com/watch?v=JfVOs4VSpmA",
    releaseDate: "2021-12-17",
    isActive: true,
  },
  {
    id: 2,
    title: "The Batman",
    synopsis: "Batman investiga la corrupción en Gotham.",
    genre: "Accion",
    rating: "PG-13",
    duration: 176,
    director: "Matt Reeves",
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800",
    bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200",
    trailerUrl: null,
    releaseDate: "2022-03-04",
    isActive: true,
  },
  {
    id: 3,
    title: "Dune: Part Two",
    synopsis: "Paul Atreides se une a Chani y a los Fremen.",
    genre: "Ciencia Ficcion",
    rating: "PG-13",
    duration: 166,
    director: "Denis Villeneuve",
    imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800",
    bannerUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200",
    trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
    releaseDate: "2024-03-01",
    isActive: true,
  },
];

describe("HeroProgress component", () => {
  it("play/pause button renders with aria-label='Pausar reproducción automática' when isPaused=false and 'Reanudar reproducción automática' when isPaused=true", () => {
    const { rerender } = render(
      <HeroProgress
        movies={mockMovies}
        activeIndex={0}
        progress={0.25}
        isPaused={false}
        onGoTo={vi.fn()}
        onTogglePause={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Pausar reproducción automática" })).toBeInTheDocument();

    rerender(
      <HeroProgress
        movies={mockMovies}
        activeIndex={0}
        progress={0.25}
        isPaused={true}
        onGoTo={vi.fn()}
        onTogglePause={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Reanudar reproducción automática" })).toBeInTheDocument();
  });

  it("clicking play/pause calls onTogglePause", () => {
    const handleTogglePause = vi.fn();
    render(
      <HeroProgress
        movies={mockMovies}
        activeIndex={0}
        progress={0.25}
        isPaused={false}
        onGoTo={vi.fn()}
        onTogglePause={handleTogglePause}
      />
    );

    const toggleButton = screen.getByRole("button", { name: "Pausar reproducción automática" });
    fireEvent.click(toggleButton);

    expect(handleTogglePause).toHaveBeenCalledTimes(1);
  });

  it("progress=0.5 sets progress fill div width to 50%", () => {
    const { container } = render(
      <HeroProgress
        movies={mockMovies}
        activeIndex={0}
        progress={0.5}
        isPaused={false}
        onGoTo={vi.fn()}
        onTogglePause={vi.fn()}
      />
    );

    const activePill = container.querySelector('[data-active="true"]');
    expect(activePill).toBeInTheDocument();

    const progressFill = activePill?.querySelector(".bg-accent.rounded-full") as HTMLElement;
    expect(progressFill).toBeInTheDocument();
    expect(progressFill.style.width).toBe("50%");
  });

  it("clicking the second pill calls onGoTo(1)", () => {
    const handleGoTo = vi.fn();
    render(
      <HeroProgress
        movies={mockMovies}
        activeIndex={0}
        progress={0.25}
        isPaused={false}
        onGoTo={handleGoTo}
        onTogglePause={vi.fn()}
      />
    );

    const secondPill = screen.getByRole("tab", { name: mockMovies[1]!.title });
    fireEvent.click(secondPill);

    expect(handleGoTo).toHaveBeenCalledWith(1);
  });

  it("active pill has data-active='true' and contains border-accent styling", () => {
    const { container } = render(
      <HeroProgress
        movies={mockMovies}
        activeIndex={0}
        progress={0.25}
        isPaused={false}
        onGoTo={vi.fn()}
        onTogglePause={vi.fn()}
      />
    );

    const activePill = container.querySelector('[data-active="true"]');
    expect(activePill).toBeInTheDocument();
    expect(activePill?.className).toContain("border-accent");
    expect(activePill?.className).toContain("w-40");
    expect(activePill).toHaveAttribute("aria-selected", "true");
    expect(activePill).toHaveAttribute("role", "tab");
  });

  it("inactive pill does not have data-active attribute", () => {
    render(
      <HeroProgress
        movies={mockMovies}
        activeIndex={0}
        progress={0.25}
        isPaused={false}
        onGoTo={vi.fn()}
        onTogglePause={vi.fn()}
      />
    );

    const tabs = screen.getAllByRole("tab");
    const inactivePill1 = tabs[1];
    const inactivePill2 = tabs[2];

    expect(inactivePill1).not.toHaveAttribute("data-active");
    expect(inactivePill2).not.toHaveAttribute("data-active");
    expect(inactivePill1).toHaveAttribute("aria-selected", "false");
    expect(inactivePill2).toHaveAttribute("aria-selected", "false");
    expect(inactivePill1?.className).toContain("w-24");
    expect(inactivePill1?.className).toContain("border-transparent");
  });

  it("handles edge cases: progress=0 renders width 0% and single movie renders without crashing", () => {
    const { container, rerender } = render(
      <HeroProgress
        movies={mockMovies}
        activeIndex={0}
        progress={0}
        isPaused={false}
        onGoTo={vi.fn()}
        onTogglePause={vi.fn()}
      />
    );

    const activePill = container.querySelector('[data-active="true"]');
    const progressFill = activePill?.querySelector(".bg-accent.rounded-full") as HTMLElement;
    expect(progressFill.style.width).toBe("0%");

    // Single movie edge case
    rerender(
      <HeroProgress
        movies={[mockMovies[0]!]}
        activeIndex={0}
        progress={0.75}
        isPaused={false}
        onGoTo={vi.fn()}
        onTogglePause={vi.fn()}
      />
    );

    expect(screen.getByRole("tab", { name: mockMovies[0]!.title })).toBeInTheDocument();
  });
});
