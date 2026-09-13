import logotipo from "@assets/logotipo.svg";
import {
  InstagramLogoIcon,
  FacebookLogoIcon,
  XLogoIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react";
import { Button } from "@shared/components/";
import { cn } from "@shared/utils/cn";

const Header = () => {
  return (
    <main>
      <header className="flex h-12 w-full items-center justify-between bg-background px-5">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            radius="sm"
            className={cn(
              "bg-transparent px-4 py-1.5 text-xs font-medium text-text-custom transition-all duration-200 hover:bg-secondary/20 focus:ring-2 focus:ring-secondary focus:ring-offset-2"
            )}
          >
            Crear cuenta
          </Button>

          <Button
            variant="primary"
            size="sm"
            radius="sm"
            className="px-4 py-1.5 text-xs font-medium transition-all duration-200 hover:bg-primary-hover focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Iniciar sesión
          </Button>
        </div>

        <div className="flex flex-row-reverse items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-secondary">|</span>

            <InstagramLogoIcon size={18} className="text-secondary" />
            <FacebookLogoIcon size={18} className="text-secondary" />
            <XLogoIcon size={18} className="text-secondary" />
            <YoutubeLogoIcon size={18} className="text-secondary" />
          </div>

          <img src={logotipo} alt="Logo" className="w-32 h-auto object-contain" />
        </div>
      </header>
    </main>
  );
};

export default Header;
