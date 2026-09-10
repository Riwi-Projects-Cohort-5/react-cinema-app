import { describe, expect, it } from "vitest";

import { getBackdropUrl } from "./index";

describe("getBackdropUrl", () => {
  it("transforms TMDB w500 poster url to w1280 backdrop url", () => {
    expect(
      getBackdropUrl("https://image.tmdb.org/t/p/w500/abc.jpg")
    ).toBe("https://image.tmdb.org/t/p/w1280/abc.jpg");
  });

  it("leaves already-w1280 backdrop url unchanged", () => {
    expect(
      getBackdropUrl("https://image.tmdb.org/t/p/w1280/abc.jpg")
    ).toBe("https://image.tmdb.org/t/p/w1280/abc.jpg");
  });

  it("leaves non-TMDB url unchanged", () => {
    expect(
      getBackdropUrl("https://other.com/img.jpg")
    ).toBe("https://other.com/img.jpg");
  });

  it("leaves empty string unchanged", () => {
    expect(getBackdropUrl("")).toBe("");
  });
});
