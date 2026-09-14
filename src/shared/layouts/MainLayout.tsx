import { Outlet, useLocation } from "react-router";
import { Header, Footer, CentralNav } from "@shared/components/";
import { PATHS } from "@routes/paths";

export const MainLayout = () => {
  const { pathname } = useLocation();

  // Hide header/footer for auth routes (login, register, forgot-password)
  const isAuthRoute =
    pathname === PATHS.auth.login ||
    pathname === PATHS.auth.register ||
    pathname === PATHS.auth.forgotPassword;

  return (
    <>
      {!isAuthRoute && <Header />}
      {!isAuthRoute && <CentralNav />}
      <Outlet />
      {!isAuthRoute && <Footer />}
    </>
  );
};
 

