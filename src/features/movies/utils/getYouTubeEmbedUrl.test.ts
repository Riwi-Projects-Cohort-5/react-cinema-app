import { describe, expect, it } from "vitest";

import { getYouTubeEmbedUrl } from "./index";

describe("getYouTubeEmbedUrl", () => {
  it("converts standard watch URL to embed URL", () => {
    expect(
      getYouTubeEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    ).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0"
    );
  });

  it("converts short youtu.be URL to embed URL", () => {
    expect(
      getYouTubeEmbedUrl("https://youtu.be/dQw4w9WgXcQ")
    ).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0"
    );
  });

  it("converts embed URL to privacy-enhanced embed URL", () => {
    expect(
      getYouTubeEmbedUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")
    ).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0"
    );
  });

  it("returns null for null input", () => {
    expect(getYouTubeEmbedUrl(null)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getYouTubeEmbedUrl("")).toBeNull();
  });

  it("returns null for invalid string", () => {
    expect(getYouTubeEmbedUrl("not-a-url")).toBeNull();
  });

  it("returns null for non-YouTube URL", () => {
    expect(getYouTubeEmbedUrl("https://example.com/watch?v=123")).toBeNull();
  });
});
