import { Outlet } from "react-router";
import { Header, Footer,CentralNav } from "@shared/components/";

export const MainLayout = () => {
  return (
    <>
      <Header />
      <CentralNav />
      <Outlet />
      <Footer />
    </>
  );
};  
 

