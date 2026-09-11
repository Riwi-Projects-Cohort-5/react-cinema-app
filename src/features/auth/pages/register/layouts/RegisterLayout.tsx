import type { ReactNode } from "react";

type RegisterLayoutProps = { children: ReactNode };

export const RegisterLayout = ({ children }: RegisterLayoutProps) => (
  <div className="min-h-screen bg-background font-secondary text-text-primary">
    <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
      <section className="relative flex min-h-[42vh] flex-1 overflow-hidden px-6 pb-8 pt-8 sm:px-10 lg:min-h-screen lg:px-12 xl:px-16">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(4,9,18,0.95) 0%, rgba(9,13,23,0.82) 25%, rgba(12,16,27,0.52) 55%, rgba(12,16,27,0.30) 100%), url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(124,140,255,0.18),transparent_18%),linear-gradient(180deg,rgba(5,11,22,0.10),rgba(5,11,22,0.42))]" />
        <div className="relative z-10 flex w-full flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface shadow-sm ring-1 ring-border">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-text-primary" />
            </div>
            <span className="font-primary text-lg font-semibold tracking-tight text-text-primary">AbsoluteCinema</span>
          </div>
          <div className="flex w-full flex-col justify-end pb-2">
            <div className="mb-4 flex items-center gap-3 text-overline font-semibold uppercase text-text-secondary">
              <span className="inline-block h-2 w-2 rounded-full bg-success shadow-xs" />
              Únete hoy
            </div>
            <h1 className="max-w-115 font-primary text-headline font-bold leading-tight text-text-primary">
              Tu membresía<span className="block text-text-primary">empieza aquí.</span>
            </h1>
            <p className="mt-4 max-w-md text-body text-text-secondary">
              Cada función, mejor con beneficios exclusivos, acceso anticipado y promociones
              pensadas para ti.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { label: "Gratis", value: "Registro" },
                { label: "2x1", value: "Miércoles" },
                { label: "4k", value: "Salas premium" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="min-w-27.5 rounded-lg border border-border bg-surface/80 px-4 py-3 shadow-xs"
                >
                  <div className="font-primary text-subtitle font-bold text-text-primary">{label}</div>
                  <div className="text-overline uppercase text-text-secondary">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <main className="flex min-w-0 flex-1">{children}</main>
    </div>
  </div>
);