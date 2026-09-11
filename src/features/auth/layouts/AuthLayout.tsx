import type { ReactNode } from "react";
import { FilmSlate, X } from "@phosphor-icons/react";
import { Link, useNavigate } from "react-router";

import { PATHS } from "@routes/paths";

interface AuthStat {
  label: string;
  value: string;
}

interface AuthLayoutProps {
  /** Ruta de la imagen de fondo (opcional). */
  imageSrc?: string;
  /** Imagen que se muestra flotando en el lado derecho (opcional). */
  rightImageSrc?: string;
  eyebrow: string;
  heading: string;
  description?: string;
  stats?: AuthStat[];
  formEyebrow: string;
  formTitle: string;
  formSubtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

function BrandMark() {
  return (
    <Link to={PATHS.home} className="relative z-10 flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
        <FilmSlate size={18} weight="bold" />
      </span>
      <span className="text-lg font-bold text-text-primary">AbsoluteCinema</span>
    </Link>
  );
}

export function AuthLayout({
  imageSrc,
  rightImageSrc,
  eyebrow,
  heading,
  description,
  stats,
  formEyebrow,
  formTitle,
  formSubtitle,
  children,
  footer,
}: AuthLayoutProps) {
  const navigate = useNavigate();

  const backgroundImage = imageSrc
    ? `url(${imageSrc})`
    : "radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--color-primary) 35%, transparent), transparent 60%), linear-gradient(to bottom, var(--color-surface), var(--color-background))";

  const formPanel = (
    <>
      <span className="text-overline font-semibold uppercase tracking-overline text-accent">
        {formEyebrow}
      </span>
      <h2 className="mt-2 text-title font-semibold tracking-title text-text-primary">
        {formTitle}
      </h2>
      {formSubtitle && <p className="mt-1 text-sm text-text-secondary">{formSubtitle}</p>}

      <div className="mt-6">{children}</div>

      {footer && <div className="mt-6 text-center text-sm text-text-secondary">{footer}</div>}
    </>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-3 sm:p-6">
      {/* Desktop: imagen a todo lo ancho de la tarjeta + form flotante a la derecha */}
      <div
        className="relative hidden w-full max-w-[1400px] overflow-hidden rounded-2xl border border-border bg-cover bg-center shadow-xl lg:block"
        style={{ minHeight: 720, backgroundImage }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/30 to-background/85" />
        <div
          className="absolute inset-0 bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/login.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />



        <div className="relative z-10 ml-10 mt-10 w-fit">
          <BrandMark />
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 max-w-lg p-10">
          <span className="text-overline font-semibold uppercase tracking-overline text-accent">
            {eyebrow}
          </span>
          <h1 className="mt-3 text-headline font-semibold tracking-headline text-text-primary">
            {heading}
          </h1>
          {description && (
            <p className="mt-3 max-w-sm text-body text-text-secondary">{description}</p>
          )}

          {stats && stats.length > 0 && (
            <div className="mt-6 flex gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center gap-1 rounded-lg border border-border bg-surface/80 px-3 py-2 text-center"
                >
                  <span className="text-sm font-semibold text-text-primary">{stat.value}</span>
                  <span className="text-xs text-text-secondary">{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>



        <div className="absolute inset-y-0 right-0 z-20 flex items-stretch p-4 lg:p-6">
          <div className="h-full w-full max-w-sm rounded-2xl border border-border bg-surface/95 p-6 shadow-xl backdrop-blur flex items-center justify-center">
            <div className="w-full">{formPanel}</div>
          </div>
        </div>
      </div>

      {/* Mobile: tarjeta simple apilada, sin imagen de fondo */}
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl lg:hidden">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-surface-variant/80 text-text-secondary transition hover:text-text-primary"
        >
          <X size={16} weight="bold" />
        </button>

        <div className="mb-6">
          <BrandMark />
        </div>

        {formPanel}
      </div>
    </div>
  );
}