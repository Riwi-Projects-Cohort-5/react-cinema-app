import { createBrowserRouter } from "react-router";
import { Home } from "./features/auth/pages/home/Home";
import { Catalog } from "./features/auth/pages/home/catalog";


export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Home/>
  },
  {    
    path: "/catalog",
    element:<Catalog/>
  }
]);