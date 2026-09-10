import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { TrailerLightbox } from "./TrailerLightbox";

describe("TrailerLightbox", () => {
  const defaultProps = {
    isOpen: true,
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    movieTitle: "Inception",
    onClose: vi.fn(),
  };

  it("renders nothing when isOpen=false", () => {
    const { container } = render(
      <TrailerLightbox {...defaultProps} isOpen={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when trailerUrl=null even if isOpen=true", () => {
    const { container } = render(
      <TrailerLightbox {...defaultProps} isOpen={true} trailerUrl={null} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders iframe with src containing "youtube-nocookie.com/embed/" when open with valid URL', () => {
    render(<TrailerLightbox {...defaultProps} />);
    const iframe = screen.getByTitle("Inception");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      "src",
      expect.stringContaining("youtube-nocookie.com/embed/"),
    );
  });

  it("pressing Escape calls onClose", () => {
    const onClose = vi.fn();
    render(<TrailerLightbox {...defaultProps} onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("clicking the X button calls onClose", () => {
    const onClose = vi.fn();
    render(<TrailerLightbox {...defaultProps} onClose={onClose} />);
    const closeButton = screen.getByRole("button", { name: "Cerrar tráiler" });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("clicking the backdrop calls onClose", () => {
    const onClose = vi.fn();
    const { container } = render(
      <TrailerLightbox {...defaultProps} onClose={onClose} />,
    );
    // Backdrop is the element with absolute inset-0 bg-background/64
    const backdrop = container.querySelector(".bg-background\\/64");
    expect(backdrop).toBeInTheDocument();
    if (backdrop) {
      fireEvent.click(backdrop);
    }
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
