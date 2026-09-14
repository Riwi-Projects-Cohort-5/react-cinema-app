import { CineFlashBanner } from "@/features/flashbar/components";
import { Hero } from "@features/movies/components/hero/Hero";

export function HomePage() {
  return (
    <>
      <Hero />
      <CineFlashBanner />
    </>
  );
}
