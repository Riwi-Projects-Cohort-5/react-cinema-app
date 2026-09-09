import logo from "../../../assets/logo.svg";
import { InstagramLogoIcon, FacebookLogoIcon, XLogoIcon, YoutubeLogoIcon } from "@phosphor-icons/react";


export const Header = () => {
  return (
    <main>
      <header className="relative h-17 w-full overflow-hidden bg-background">
        <div className="absolute top-0 left-0  flex gap-2 p-3">
          <button className="w-30 h-8 text-sm  text-text-custom font-bold rounded-1xl mt-1">
            Register
          </button>
          <button className="w-30 h-8 text-sm text-white bg-primary font-bold rounded-lg mt-1">
            Login
          </button>

        </div>
        <div className="absolute right-8 p-5 flex items-center gap-7 ">
          

          <div className="flex items-center gap-3 ">
            <span className="text-logo  ">|</span>
            <InstagramLogoIcon size={24} className="text-logo" />
            <FacebookLogoIcon size={24} className="text-logo" />
            <XLogoIcon size={24} className="text-logo" />
            <YoutubeLogoIcon size={24} className="text-logo" />
          </div>
          <img src={logo} alt="Logo" className="w-40" />
        </div>
        

      </header>
    </main>

  );
};