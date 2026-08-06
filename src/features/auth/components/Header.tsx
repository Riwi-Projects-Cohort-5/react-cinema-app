import video from "../../../assets/video3.mp4";

export const Header = () => {
  return (
    <main className=" bg-black">
      <header className="relative h-100 w-full overflow-hidden">

        {/* Video de fondo */}
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={video}
          autoPlay
          muted
          loop
          playsInline
        />

        {/* Capa oscura */}
        <div className="absolute inset-0 bg-black/70"></div>

        {/* Barra superior */}
        <div className="absolute top-0 right-0 z-20 flex gap-4 p-8">
          <button className="rounded-full border border-white px-6 py-2 text-white transition hover:bg-white hover:text-black">
            Login
          </button>

          <button className="rounded-full border border-white px-6 py-2 text-white transition hover:bg-white hover:text-black">
            Register
          </button>
        </div>

        {/* Contenido centrado */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <h1 className="text-5xl font-bold text-white md:text-7xl">
          For the name
          </h1>
        </div>
      </header>

    </main>
  );
};