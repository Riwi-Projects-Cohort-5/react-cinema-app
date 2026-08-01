
interface card{
    id:number,
    image:string,
    title: string,
    score: string,
    year: number,
    gender:string,
    director:string
    duration:number,
    description:string,
}

export const movies: card[] = [
  {
    id:1,
    image: "https://picsum.photos/seed/shawshank/400/600",
    title: "Spiderman",
    score: "3.5",
    year: 2025,
    gender: "Adventure",
    director: "Ronaldo Rodriguez",
    duration: 20,
    description: "No sé qué poner",
  },
  {
    id:2,
    image: "https://picsum.photos/seed/shawshank/400/600",
    title: "Batman",
    score: "4.5",
    year: 2024,
    gender: "Action",
    director: "Christopher Nolan",
    duration: 150,
    description: "Una gran película",
  },
  {
    id:3,
    image: "https://picsum.photos/seed/shawshank/400/600",
    title: "Superman",
    score: "5.0",
    year: 2026,
    gender: "Adventure",
    director: "James Gunn",
    duration: 130,
    description: "Nueva película de Superman",
  },
    {
    id:4,
    image: "https://picsum.photos/seed/shawshank/400/600",
    title: "Superman",
    score: "5.0",
    year: 2026,
    gender: "Adventure",
    director: "James Gunn",
    duration: 130,
    description: "Nueva película de Superman",
  },
    {
    id:5,  
    image: "https://picsum.photos/seed/shawshank/400/600",
    title: "Superman",
    score: "5.0",
    year: 2026,
    gender: "Adventure",
    director: "James Gunn",
    duration: 130,
    description: "Nueva película de Superman",
  },
    {
    id:6,  
    image: "https://picsum.photos/seed/shawshank/400/600",
    title: "Superman",
    score: "5.0",
    year: 2026,
    gender: "Adventure",
    director: "James Gunn",
    duration: 130,
    description: "Nueva película de Superman",
  },
    {
    id:7,  
    image: "https://picsum.photos/seed/shawshank/400/600",
    title: "Superman",
    score: "5.0",
    year: 2026,
    gender: "Adventure",
    director: "James Gunn",
    duration: 130,
    description: "Nueva película de Superman",
  },
  {
    id:8,
    image: "https://picsum.photos/seed/shawshank/400/600",
    title: "Superman",
    score: "5.0",
    year: 2026,
    gender: "Adventure",
    director: "James Gunn",
    duration: 130,
    description: "Nueva película de Superman",
  },

];
export const Cards = ({image,title,score,year,gender,director,duration,description}: card)  => {
  return (
    <article className="rounded-2xl bg-zinc-900 p-4">
      <div className= "relative">
        <img
          src={image}
          alt={title}
          className="h-50 w-full object-cover rounded-lg"
        />

        <span className="absolute top-2 right-2 rounded-md bg-orange-700 px-2 py-1 text-sm font-bold text-white">
          ⭐ {score}
        </span>
      </div>

      <div className="mt-4 space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white">{title}</h2>
          <span className="text-lg text-white">{year}</span>
        </header>

        <div className="space-y-2 text-white">
          <p>
            <strong className="text-white">Gender:</strong> {gender}
          </p>

          <p>
            <strong className="text-white">Director:</strong> {director}
          </p>

          <p>
            <strong className="text-white">Duración:</strong> {duration} minutos
          </p>
        </div>

        <p className="text-white">
          {description}
        </p>
      </div>
    </article>
    
  );
}
