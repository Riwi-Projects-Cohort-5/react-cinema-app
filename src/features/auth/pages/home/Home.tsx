import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";


export const Home = () => {
  return (
    <main className="min-h-screen bg-black flex flex-col">
      <Header />
      <div className="flex-1"></div>
      <Footer />
    </main>
  );
};