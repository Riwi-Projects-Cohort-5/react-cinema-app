//import { useQueryClient } from "@tanstack/react-query";

import { Flashbar } from "@features/flashbar/components/flashbar/Flashbar";

//import { CINE_FLASH_DEFAULT_CITY_ID } from "@features/flashbar/config";
//import { useCineFlash } from "@features/flashbar/hooks/useCineFlash";

export function CineFlashBanner() {
  /* const queryClient = useQueryClient(); */
  //const { data, isPending, isError } = useCineFlash(CINE_FLASH_DEFAULT_CITY_ID);
  const mockData = {
    active: true,
    terms: "Hasta 20% de descuento en funciones seleccionadas",
    remainingSeconds: 5 * 60 * 60, // 5 horas en segundos = 18000
  };

  /* if (isPending || isError || !data?.active) {
    return null;
  } */

  /*  const handleCountdownExpire = (): void => {
    void queryClient.invalidateQueries({ queryKey: ["cineflash"] });
    void queryClient.invalidateQueries({ queryKey: ["movies", "cineflash"] });
  }; */

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
