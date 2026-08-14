/** @type {import('tailwindcss').Config} */
export default {
  // ─── 1. Content: archivos donde Tailwind escanea clases ──────────────────
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  // ─── 2. Dark mode: controlado por el atributo [data-theme="dark"] ────────
  //    Así `dark:` funciona cuando tú pones data-theme="dark" en el <html>
  darkMode: ["class", '[data-theme="dark"]'],

  theme: {
    // ─── 3. Extendemos el tema base de Tailwind ────────────────────────────
    //    Usamos `extend` para no pisar las utilidades default de Tailwind
    //    (ej: `w-full`, `flex`, `grid` siguen funcionando igual)
    extend: {
      // ── Colores ───────────────────────────────────────────────────────────
      //   Cada valor apunta a la variable CSS del :root / [data-theme="dark"]
      //   Resultado en JSX: className="bg-surface text-primary"
      colors: {
        // Fondos
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        "surface-variant": "var(--color-surface-variant)",

        // Marca
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",

        // Semánticos
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
        info: "var(--color-info)",

        // Tipografía
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-disabled": "var(--color-text-disabled)",

        // Bordes
        border: "var(--color-border)",
        divider: "var(--color-divider)",
      },

      // ── Tipografía: familias ──────────────────────────────────────────────
      //   Uso: className="font-primary" → Space Grotesk
      //        className="font-secondary" → General Sans
      fontFamily: {
        primary: "var(--font-family-primary)",
        secondary: "var(--font-family-secondary)",
      },

      // ── Tipografía: tamaños ───────────────────────────────────────────────
      //   Uso: className="text-display" / "text-headline" / "text-body" …
      //   Nota: Tailwind tiene su propia escala (text-sm, text-lg…).
      //   Las clases de abajo son ADICIONALES para la escala de diseño.
      fontSize: {
        display: [
          "var(--font-size-display)",
          {
            lineHeight: "var(--line-height-display)",
            letterSpacing: "var(--letter-spacing-display)",
          },
        ],
        headline: [
          "var(--font-size-headline)",
          {
            lineHeight: "var(--line-height-headline)",
            letterSpacing: "var(--letter-spacing-headline)",
          },
        ],
        title: [
          "var(--font-size-title)",
          {
            lineHeight: "var(--line-height-title)",
            letterSpacing: "var(--letter-spacing-title)",
          },
        ],
        subtitle: [
          "var(--font-size-subtitle)",
          {
            lineHeight: "var(--line-height-subtitle)",
            letterSpacing: "var(--letter-spacing-subtitle)",
          },
        ],
        body: [
          "var(--font-size-body)",
          {
            lineHeight: "var(--line-height-body)",
            letterSpacing: "var(--letter-spacing-body)",
          },
        ],
        caption: [
          "var(--font-size-caption)",
          {
            lineHeight: "var(--line-height-caption)",
            letterSpacing: "var(--letter-spacing-caption)",
          },
        ],
        overline: [
          "var(--font-size-overline)",
          {
            lineHeight: "var(--line-height-overline)",
            letterSpacing: "var(--letter-spacing-overline)",
          },
        ],
      },

      // ── Tipografía: pesos ─────────────────────────────────────────────────
      fontWeight: {
        regular: "var(--font-weight-regular)",
        medium: "var(--font-weight-medium)",
        semibold: "var(--font-weight-semibold)",
        bold: "var(--font-weight-bold)",
      },

      // ── Espaciado ─────────────────────────────────────────────────────────
      //   Uso: className="p-spacing-4" / "gap-spacing-6" / "mt-spacing-2" …
      //   Importante: Tailwind requiere el prefijo del token como clave.
      //   Aquí mantenemos "spacing-N" para no colisionar con la escala
      //   numérica de Tailwind (p-4 sigue siendo 16px por defecto en Tailwind).
      spacing: {
        "spacing-1": "var(--spacing-1)",
        "spacing-2": "var(--spacing-2)",
        "spacing-3": "var(--spacing-3)",
        "spacing-4": "var(--spacing-4)",
        "spacing-5": "var(--spacing-5)",
        "spacing-6": "var(--spacing-6)",
        "spacing-7": "var(--spacing-7)",
        "spacing-8": "var(--spacing-8)",
        "spacing-9": "var(--spacing-9)",
        "spacing-10": "var(--spacing-10)",
      },

      // ── Border radius ─────────────────────────────────────────────────────
      //   Uso: className="rounded-sm" / "rounded-md" / "rounded-full"
      //   Tailwind ya tiene rounded-sm, rounded-md… así que aquí los pisamos
      //   con los valores del design system.
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },

      // ── Sombras ───────────────────────────────────────────────────────────
      //   Uso: className="shadow-sm" / "shadow-md" / "shadow-xl"
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },

      // ── Opacidades ────────────────────────────────────────────────────────
      //   Uso: className="opacity-hover" / "opacity-disabled"
      opacity: {
        hover: "var(--opacity-hover)",
        active: "var(--opacity-active)",
        disabled: "var(--opacity-disabled)",
        overlay: "var(--opacity-overlay)",
        scrim: "var(--opacity-scrim)",
      },

      // ── Transiciones / animaciones ────────────────────────────────────────
      //   Uso: className="duration-fast ease-standard"
      transitionDuration: {
        instant: "var(--duration-instant)",
        fast: "var(--duration-fast)",
        base: "var(--duration-base)",
        moderate: "var(--duration-moderate)",
        slow: "var(--duration-slow)",
      },
      transitionTimingFunction: {
        standard: "var(--easing-standard)",
        decelerate: "var(--easing-decelerate)",
        accelerate: "var(--easing-accelerate)",
      },

      // ── Ancho máximo de contenedor ────────────────────────────────────────
      //   Uso: className="max-w-container"
      maxWidth: {
        container: "var(--container-max-width)",
      },
    },
  },

  plugins: [],
};
