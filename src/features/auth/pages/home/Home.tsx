import { Cards, movies } from "../../components/cards";
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

      <section className="grid grid-cols-5 gap-5 mt-2 p-15 ">
        
        {movies.map((movie) => (
          <Cards 
            key={movie.id}
            {...movie}
          />
        ))}
      </section>

      <Footer />
    </main>
  );
};