import { useQueryClient } from "@tanstack/react-query";

import { Flashbar } from "@features/flashbar/components/flashbar/Flashbar";

import { CINE_FLASH_DEFAULT_CITY_ID } from "@features/flashbar/config";
import { useCineFlash } from "@features/flashbar/hooks/useCineFlash";

export function CineFlashBanner() {
  const queryClient = useQueryClient();
  const { data, isPending, isError } = useCineFlash(CINE_FLASH_DEFAULT_CITY_ID);

  if (isPending || isError || !data?.active) {
    return null;
  }

  const handleCountdownExpire = (): void => {
    void queryClient.invalidateQueries({ queryKey: ["cineflash"] });
  };

  return (
    <Flashbar
      title="Cine Flash"
      message={data.terms}
      countdownSeconds={data.remainingSeconds}
      onCountdownExpire={handleCountdownExpire}
    />
  );
}
import { useQueryClient } from "@tanstack/react-query";

import { Flashbar } from "@features/flashbar/components/flashbar/Flashbar";

import { CINE_FLASH_DEFAULT_CITY_ID } from "@features/flashbar/config";
import { useCineFlash } from "@features/flashbar/hooks/useCineFlash";

export function CineFlashBanner() {
  const queryClient = useQueryClient();
  const { data, isPending, isError } = useCineFlash(CINE_FLASH_DEFAULT_CITY_ID);

  if (isPending || isError || !data?.active) {
    return null;
  }

  const handleCountdownExpire = (): void => {
    void queryClient.invalidateQueries({ queryKey: ["cineflash"] });
  };

  return (
    <Flashbar
      title="Cine Flash"
      message={data.terms}
      countdownSeconds={data.remainingSeconds}
      onCountdownExpire={handleCountdownExpire}
    />
  );
}
