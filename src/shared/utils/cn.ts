import { extendTailwindMerge } from "tailwind-merge";

// Los tokens tipográficos del proyecto (text-display … text-overline, definidos en
// src/styles/main.css) son tamaños de fuente, no colores. Sin declararlos, tailwind-merge los
// confunde con `text-<color>` y los descarta al fusionar: `cn("text-caption", "text-error")`
// devolvía solo `text-error`, rompiendo la tipografía de AppToaster, Countdown, Dropdown,
// IconLink y el asistente de ubicación.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["display", "headline", "title", "subtitle", "body", "caption", "overline"] },
      ],
    },
  },
});

export function cn(...classes: Array<string | false | null | undefined>): string {
  return twMerge(classes.filter(Boolean).join(" "));
}
