import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";

export const Home = () => {
  return (
    <main className="min-h-screen bg-black">
      <Header />
       <h1 className="text-white text-5xl font-bold text-center p-20">
        CATALOG
       </h1>

      <p className="text-center text-2xl text-white px-40 pb-10">
        Welcome to our cinema, where every screening brings stories to life on
        the big screen. Enjoy the latest releases with an unforgettable movie
        experience.
      </p>


      <Footer />
    </main>
  );
};