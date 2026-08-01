import { Cards, movies } from "../../components/cards";
import { Header } from "../../components/Header";

export const Home = () => {
  return (
    <main className="min-h-screen bg-black">
      <Header />
       <h1 className="text-white text-5xl font-bold text-center p-20">
        CARTELERA
       </h1>
      <section className="grid grid-cols-4 gap-5 mt-2">
        
        {movies.map((movie) => (
          <Cards 
            key={movie.id}
            {...movie}
          />
        ))}
      </section>

    </main>
  );
};