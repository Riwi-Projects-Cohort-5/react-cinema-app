import logo from "../../../assets/logo.svg";
import { InstagramLogoIcon, FacebookLogoIcon, XLogoIcon, YoutubeLogoIcon } from "@phosphor-icons/react";

export const Footer = () => {
  return (
    <footer className="bg-(--nav)">
      <div className="mx-auto max-w-5xl px-10 py-10">
        <div>
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="w-40" />
          </div>
          <p className="mt-4 max-w-xs text-xs leading-5 text-(--text)">
            La plataforma moderna para disfrutar el cine.
            Compra tus entradas desde donde estés.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <InstagramLogoIcon size={24} className="text-(--logo)" />
            <FacebookLogoIcon size={24} className="text-(--logo)" />
            <XLogoIcon size={24} className="text-(--logo)" />
            <YoutubeLogoIcon size={24} className="text-(--logo)" />
          </div>
        </div>

      </div>
      <div className="border-t border-white/5">
      
        <div className="mx-auto max-w-5xl px-10 py-4">

        </div>
      </div>
    </footer>
  );
};
