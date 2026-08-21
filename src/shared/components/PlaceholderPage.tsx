interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold text-primary">{title}</h1>

      <button className="border border-primary px-4 py-2 transition-colors duration-slow hover:bg-primary">
        Test
      </button>
      <p className="text-white dark:text-accent">Test dark variant</p>
    </main>
  );
}
