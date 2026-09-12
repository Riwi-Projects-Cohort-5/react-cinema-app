import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Flashbar } from "@features/flashbar/components/flashbar/Flashbar";
import { CINE_FLASH_DEFAULT_CITY_ID } from "@features/flashbar/config";
import { useCineFlash } from "@features/flashbar/hooks/useCineFlash";

export function CineFlashBanner() {
  const queryClient = useQueryClient();
  const { data, isPending, isError } = useCineFlash(CINE_FLASH_DEFAULT_CITY_ID);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(Boolean(data?.active));
  }, [data?.active]);

  const handleCountdownExpire = (): void => {
    setIsVisible(false);
    void queryClient.invalidateQueries({ queryKey: ["cineflash"] });
    void queryClient.invalidateQueries({ queryKey: ["movies", "cineflash"] });
  };

  if (isPending || isError || !data?.active || !isVisible) {
    return null;
  }

  return (
    <Flashbar
      title="Cine Flash"
      message={data.terms}
      countdownSeconds={data.remainingSeconds}
      onCountdownExpire={handleCountdownExpire}
      actionLabel="Ver funciones"
      onAction={() => console.log("Ver funciones")}
      fixed={false}
      className="mt-8 mb-8"
    />
  );
}
