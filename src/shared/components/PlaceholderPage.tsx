interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl text-primary font-semibold ">{title}</h1>
    </main>
  );
}
