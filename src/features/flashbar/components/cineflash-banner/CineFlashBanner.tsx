import { Flashbar } from "@features/flashbar/components/flashbar/Flashbar";

export function CineFlashBanner() {
  const mockData = {
    active: true,
    terms: "Hasta 20% de descuento en funciones seleccionadas",
    remainingSeconds: 5 * 60 * 60,
  };

  return (
    <Flashbar
      title="Cine Flash"
      message={mockData.terms}
      countdownSeconds={mockData.remainingSeconds}
      onCountdownExpire={() => console.log("Countdown expired")}
      actionLabel="Ver funciones"
      onAction={() => console.log("Ver funciones")}
      fixed={false}
      className="mt-8 mb-8"
    />
  );
}
