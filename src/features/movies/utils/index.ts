export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  const rounded = Math.round(rem / 5) * 5;
  const remMinutes = rem >= 5 && rounded < 60 ? rounded : rem;

  return `${hours}h ${remMinutes}min`;
}

export function getBackdropUrl(posterUrl: string): string {
  return posterUrl.replace(/\/t\/p\/w\d{2,4}\//, "/t/p/w1280/");
}

export function getYouTubeEmbedUrl(url: string | null): string | null {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "");
    let videoId: string | null = null;

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        videoId = parsed.searchParams.get("v");
      } else if (parsed.pathname.startsWith("/embed/")) {
        videoId = parsed.pathname.slice("/embed/".length).split("/")[0] ?? null;
      }
    } else if (hostname === "youtu.be") {
      videoId = parsed.pathname.slice(1).split("/")[0] ?? null;
    }

    if (!videoId) {
      return null;
    }

    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0`;
  } catch {
    return null;
  }
}
