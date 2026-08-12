import { Cards, movies } from "../../components/cards";


export const catalog = () => {
  return (
 <section className="grid grid-cols-5 gap-5 mt-2 p-15 ">
        
        {movies.map((movie) => (
          <Cards 
            key={movie.id}
            {...movie}
          />
        ))}
      </section>
  )
}
