import { PATHS } from "@/routes/paths";
import logo from "../../../../assets/logo.svg";
import { InstagramLogoIcon, FacebookLogoIcon, XLogoIcon, YoutubeLogoIcon } from "@phosphor-icons/react";
import { Button } from "@shared/components/";
import { cn } from "@shared/utils/cn";
import { useNavigate } from "react-router";

const Header = () => {
  const navigate = useNavigate();

  return (
    <main>
      <header className="relative h-17 w-full overflow-hidden bg-background">
        <div className="absolute top-0 left-0  flex gap-2 p-3">
          <Button
            variant="secondary"
            size="sm"
            radius="sm"
            className={cn("bg-transparent px-4 py-2 text-sm font-medium text-text-custom transition-all duration-200 hover:bg-secondary/30 focus:ring-2 focus:ring-secondary focus:ring-offset-2")} 
            onClick={() => navigate(PATHS.auth.register)}
          >
            Register
          </Button>
          <Button
            variant="primary"
            size="sm"
            radius="sm"
            className="px-6 py-2 text-sm font-medium transition-all duration-200 hover:bg-primary-hover focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Login
          </Button>

        </div>

        <div className="absolute right-2 p-5 flex items-center gap-4 ">


          <div className="flex items-center gap-1  ">
            <span className="text-secondary  ">|</span>
            <InstagramLogoIcon size={24} className="text-secondary" />
            <FacebookLogoIcon size={24} className="text-secondary" />
            <XLogoIcon size={24} className="text-secondary" />
            <YoutubeLogoIcon size={24} className="text-secondary" />
          </div>
          <img src={logo} alt="Logo" className="w-40" />
        </div>


      </header>
    </main>

  );
};

export default Header;