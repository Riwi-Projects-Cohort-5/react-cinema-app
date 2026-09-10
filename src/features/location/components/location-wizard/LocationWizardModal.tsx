import { useState } from "react";
import { ArrowRight, MapPin, Warning } from "@phosphor-icons/react";

import logo from "@assets/logo.svg";
import Modal from "@shared/components/composites/Modal";
import Button from "@shared/components/primitives/Button";
import { cn } from "@shared/utils/cn";
import type { SavedLocation } from "@shared/interfaces";

import { useCities } from "@features/location/hooks/useCities";
import { useCountries } from "@features/location/hooks/useCountries";
import { useDepartments } from "@features/location/hooks/useDepartments";

import { LocationSelect, type LocationSelectStatus } from "./LocationSelect";

const STEPS = ["País", "Departamento", "Ciudad"];

interface QueryLikeState {
  isEnabled: boolean;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
}

function resolveStatus({
  isEnabled,
  isLoading,
  isError,
  isEmpty,
}: QueryLikeState): LocationSelectStatus {
  if (!isEnabled) return "idle";
  if (isLoading) return "loading";
  if (isError) return "error";
  if (isEmpty) return "empty";
  return "ready";
}

interface LocationWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (location: SavedLocation) => void;
  initialLocation?: SavedLocation | null;
}

export function LocationWizardModal({
  isOpen,
  onClose,
  onConfirm,
  initialLocation = null,
}: LocationWizardModalProps) {
  // El asistente arranca en la ubicación ya guardada. LocationGate lo remonta al abrirlo
  // (prop `key`), así cada apertura vuelve a partir de la preferencia vigente.
  const [countryId, setCountryId] = useState<number | null>(initialLocation?.country.id ?? null);
  const [departmentId, setDepartmentId] = useState<number | null>(
    initialLocation?.department.id ?? null,
  );
  const [cityId, setCityId] = useState<number | null>(initialLocation?.city.id ?? null);

  const countriesQuery = useCountries();
  const departmentsQuery = useDepartments(countryId);
  const citiesQuery = useCities(departmentId);

  const countries = countriesQuery.data ?? [];
  const departments = departmentsQuery.data ?? [];
  const cities = citiesQuery.data ?? [];

  const selectedCountry = countries.find((country) => country.id === countryId) ?? null;
  const selectedDepartment = departments.find((department) => department.id === departmentId) ?? null;
  const selectedCity = cities.find((city) => city.id === cityId) ?? null;

  const hasInactiveCity = selectedCity != null && !selectedCity.isActive;
  const canConfirm =
    selectedCountry != null && selectedDepartment != null && selectedCity != null && !hasInactiveCity;

  const completedSteps = [countryId, departmentId, cityId].filter((value) => value != null).length;

  const handleCountryChange = (value: number | null) => {
    setCountryId(value);
    setDepartmentId(null);
    setCityId(null);
  };

  const handleDepartmentChange = (value: number | null) => {
    setDepartmentId(value);
    setCityId(null);
  };

  const handleConfirm = () => {
    if (!canConfirm || !selectedCountry || !selectedDepartment || !selectedCity) return;

    onConfirm({
      country: { id: selectedCountry.id, name: selectedCountry.name },
      department: { id: selectedDepartment.id, name: selectedDepartment.name },
      city: { id: selectedCity.id, name: selectedCity.name },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="!max-w-3xl">
      <div className="flex flex-col overflow-hidden rounded-xl md:flex-row">
        <div className="hidden flex-col justify-end gap-6 bg-background p-8 md:flex md:w-[300px]">
          <img src={logo} alt="AbsoluteCinema" className="h-5 w-auto" />

          <div
            aria-hidden="true"
            className="relative flex-1 rounded-lg bg-gradient-to-b from-primary/20 via-transparent to-background"
          />

          <div>
            <p className="text-overline font-semibold uppercase tracking-overline text-primary">
              La mejor experiencia
            </p>
            <h3 className="mt-2 font-primary text-subtitle font-bold text-text-primary">
              Cine cerca de ti
            </h3>
            <p className="mt-2 text-caption text-text-secondary">
              Funciones, horarios y cartelera de tu ciudad en tiempo real.
            </p>

            <div className="mt-5 flex gap-1.5">
              {STEPS.map((step, index) => (
                <div key={step} className="flex flex-1 flex-col gap-1">
                  <div
                    className={cn(
                      "h-[3px] rounded-full transition-colors duration-base",
                      index < completedSteps ? "bg-primary" : "bg-border",
                    )}
                  />
                  <span
                    className={cn(
                      "text-overline font-semibold uppercase tracking-overline",
                      index < completedSteps ? "text-primary-hover" : "text-text-disabled",
                    )}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col bg-surface p-8">
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-overline font-semibold uppercase tracking-overline text-primary">
              <MapPin size={12} weight="fill" aria-hidden="true" />
              Seleccionar ubicación
            </span>
            <h2 className="mt-4 font-primary text-title font-bold text-text-primary">
              ¿Desde dónde nos visitas?
            </h2>
            <p className="mt-1.5 text-caption text-text-secondary">
              Cuéntanos tu ciudad y te mostraremos la cartelera y los horarios más cercanos.
            </p>
          </div>

          <div className="flex flex-col gap-3.5">
            <LocationSelect
              label="País"
              placeholder="Selecciona un país"
              status={resolveStatus({
                isEnabled: true,
                isLoading: countriesQuery.isLoading,
                isError: countriesQuery.isError,
                isEmpty: countries.length === 0,
              })}
              options={countries.map((country) => ({ value: country.id, label: country.name }))}
              value={countryId}
              onChange={handleCountryChange}
              onRetry={() => void countriesQuery.refetch()}
              emptyMessage="No hay países disponibles."
              errorMessage="No pudimos cargar los países."
            />

            <LocationSelect
              label="Departamento / Estado"
              placeholder="Selecciona departamento"
              status={resolveStatus({
                isEnabled: countryId != null,
                isLoading: departmentsQuery.isLoading,
                isError: departmentsQuery.isError,
                isEmpty: departments.length === 0,
              })}
              options={departments.map((department) => ({
                value: department.id,
                label: department.name,
              }))}
              value={departmentId}
              onChange={handleDepartmentChange}
              onRetry={() => void departmentsQuery.refetch()}
              emptyMessage="No hay departamentos disponibles para este país."
              errorMessage="No pudimos cargar los departamentos."
            />

            <LocationSelect
              label="Ciudad"
              placeholder="Selecciona ciudad"
              status={resolveStatus({
                isEnabled: departmentId != null,
                isLoading: citiesQuery.isLoading,
                isError: citiesQuery.isError,
                isEmpty: cities.length === 0,
              })}
              options={cities.map((city) => ({
                value: city.id,
                label: city.isActive ? city.name : `${city.name} · Sin cines activos`,
              }))}
              value={cityId}
              onChange={setCityId}
              onRetry={() => void citiesQuery.refetch()}
              emptyMessage="No hay ciudades disponibles para este departamento."
              errorMessage="No pudimos cargar las ciudades."
            />
          </div>

          {hasInactiveCity && (
            <div
              role="status"
              className="mt-4 flex items-start gap-2 rounded-md border border-warning/20 bg-warning/10 px-3 py-2 text-caption text-warning"
            >
              <Warning size={14} weight="fill" aria-hidden="true" className="mt-0.5 shrink-0" />
              <span>
                Aún no hay cines activos en {selectedCity?.name}. Elige otra ciudad para ver la
                cartelera.
              </span>
            </div>
          )}

          <Button
            type="button"
            variant="primary"
            state={canConfirm ? "default" : "disabled"}
            className="mt-6 w-full"
            onClick={handleConfirm}
          >
            Confirmar ubicación
            <ArrowRight size={16} weight="bold" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
