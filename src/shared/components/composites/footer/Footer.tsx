import logo from "../../../../assets/logo.svg";
import { Button } from "@shared/components/";
import {
  InstagramLogoIcon, FacebookLogoIcon, XLogoIcon, YoutubeLogoIcon,
} from "@phosphor-icons/react";

import { NavLink } from "react-router";

export const Footer = () => {
  return (
    <footer className="bg-divider text-text-custom">
      <div className="mx-auto max-w-15xl px-10 py-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Columna 1 - Logo */}
          <div>
            <div className="flex items-center gap-2">
              <img src={logo} />
            </div>

            <p className="mt-4 max-w-xs text-sm leading-5">
              La plataforma moderna para disfrutar del cine. Compra tus
              entradas desde donde estés.
            </p>

            <div className="mt-4 flex items-center gap-2">
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-7 w-7 items-center justify-center rounded-md bg-white/5 transition hover:bg-white/10"
              >
                <InstagramLogoIcon size={20} />
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="flex h-7 w-7 items-center justify-center rounded-md bg-white/5 transition hover:bg-white/10"
              >
                <FacebookLogoIcon size={20} />
              </a>

              <a
                href="#"
                aria-label="X"
                className="flex h-7 w-7 items-center justify-center rounded-md bg-white/5 transition hover:bg-white/10"
              >
                <XLogoIcon size={20} />
              </a>

              <a
                href="#"
                aria-label="Youtube"
                className="flex h-7 w-7 items-center justify-center rounded-md bg-white/5 transition hover:bg-white/10"
              >
                <YoutubeLogoIcon size={20} />
              </a>
            </div>
          </div>

          {/* Columna 2 - Navegación */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/40">
              Navegación
            </h3>

            <ul className="space-y-2">
                <li>
                  <NavLink
                    to="/catalog"
                    className="text-sm transition hover:text-white"
                  >
                    Cartelera
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/premieres"
                    className="text-sm transition hover:text-white"
                  >
                    Próximos estrenos
                  </NavLink>
                </li>

              <li>
                <NavLink
                  to="/cine-flash"
                  className="text-sm transition hover:text-white"
                >
                  Cine Flash
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/confectionery"
                  className="text-sm transition hover:text-white"
                >
                  Confitería
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/promotions"
                  className="text-sm transition hover:text-white"
                >
                  Promociones
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/complexes"
                  className="text-sm transition hover:text-white"
                >
                  Complejos
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Columna 3 - Mi cuenta */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/40">
              Mi cuenta
            </h3>

            <ul className="space-y-2">
              <li>
                <NavLink
                  to="/login"
                  className="text-sm transition hover:text-white"
                >
                  Iniciar sesión
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/register"
                  className="text-sm transition hover:text-white"
                >
                  Registrarse
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/tickets"
                  className="text-sm transition hover:text-white"
                >
                  Mis entradas
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/points"
                  className="text-sm transition hover:text-white"
                >
                  Mis puntos
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/profile"
                  className="text-sm transition hover:text-white"
                >
                  Perfil
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/favorites"
                  className="text-sm transition hover:text-white"
                >
                  Favoritos
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Columna 4 - Cines + Newsletter */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/40">
              Cines destacados
            </h3>

            <ul className="space-y-2">
              <li>
                <NavLink
                  to="/cinemas/arino"
                  className="text-sm transition hover:text-white"
                >
                  RC Arino
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/cinemas/unicentro"
                  className="text-sm transition hover:text-white"
                >
                  RC Unicentro
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/cinemas/gran-estacion"
                  className="text-sm transition hover:text-white"
                >
                  RC Gran Estación
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/cinemas/el-retiro"
                  className="text-sm transition hover:text-white"
                >
                  RC El Retiro
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/cinemas/hayuelos"
                  className="text-sm transition hover:text-white"
                >
                  RC Hayuelos
                </NavLink>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-5">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-widest text-white/40">
                Newsletter
              </h3>

              <form className="flex items-center gap-1">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="h-6 w-150 rounded-md border border-white/5 bg-white/5 px-2 text-sm text-white"
                />

                <Button
                  variant="secondary"
                  size="sm"
                  radius="sm"
                  className="bg-transparent text-sm font-medium text-text-custom transition-all duration-200 hover:bg-secondary/30 focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                >
                  OK
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-10 py-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-white/30">
            © 2026 AbsoluteCinema. Todos los derechos reservados.
          </p>

          <div className="flex items-center gap-4">
            <NavLink
              to="/terms"
              className="text-sm text-white/30 transition hover:text-white/70"
            >
              Términos de uso
            </NavLink>

            <NavLink
              to="/privacy"
              className="text-sm text-white/30 transition hover:text-white/70"
            >
              Privacidad
            </NavLink>

            <NavLink
              to="/cookies"
              className="text-sm text-white/30 transition hover:text-white/70"
            >
              Cookies
            </NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;