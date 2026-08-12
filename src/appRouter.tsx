import { createBrowserRouter } from "react-router";
import { Home } from "./features/auth/pages/home/Home";

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Home/>
  },
  {    
    path: "/catalog",
    element: 'Renderizar aqui tus rutas de auth'
  }
]);