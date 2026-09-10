import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { CaretDown, Check, MagnifyingGlass } from "@phosphor-icons/react";
import { Input } from "@shared/components/primitives";
import { cn } from "@shared/utils/cn";

export interface DropdownOption<V = string> {
  value: V;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
}

export interface DropdownProps<V = string> {
  options: DropdownOption<V>[];
  label?: string;
  optionalHint?: string;
  placeholder?: string;
  value?: V | null;
  onChange?: (value: V | null) => void;
  defaultValue?: V | null;
  filterable?: boolean;
  filter?: (option: DropdownOption<V>, query: string) => boolean;
  filterPlaceholder?: string;
  disabled?: boolean;
  triggerIcon?: ReactNode;
  id?: string;
  className?: string;
  listClassName?: string;
  triggerClassName?: string;
}

const defaultFilter = (option: DropdownOption<unknown>, query: string): boolean =>
  option.label.toLowerCase().includes(query.toLowerCase());

const valuesEqual = (a: unknown, b: unknown): boolean => Object.is(a, b);

export function Dropdown<V = string>({
  options,
  label,
  optionalHint,
  placeholder,
  value: valueProp,
  onChange,
  defaultValue = null,
  filterable = false,
  filter,
  filterPlaceholder = "Buscar…",
  disabled = false,
  id,
  className = "",
  listClassName = "",
  triggerIcon,
  triggerClassName = "",
}: DropdownProps<V>) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<V | null>(defaultValue);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [query, setQuery] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const highlightedOptionRef = useRef<HTMLLIElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const listboxId = useId();
  const labelId = useId();

  const isControlled = valueProp !== undefined;
  const selectedValue = isControlled ? valueProp : internalValue;
  const selectedOption =
    selectedValue == null
      ? null
      : options.find((option) => valuesEqual(option.value, selectedValue)) ?? null;

  const filterFn = filter ?? defaultFilter;

  const filteredOptions = useMemo(
    () => (query ? options.filter((option) => filterFn(option, query)) : options),
    [options, query, filterFn],
  );

  const highlightedOption = filteredOptions[highlightedIndex] ?? null;

  const closeList = () => {
    setOpen(false);
    setQuery("");
  };

  const openList = () => {
    if (disabled) return;
    const selectedIndex = filteredOptions.findIndex(
      (option) => selectedValue != null && valuesEqual(option.value, selectedValue),
    );
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  const selectOption = (option: DropdownOption<V>) => {
    if (option.disabled) return;
    onChange?.(option.value);
    if (!isControlled) setInternalValue(option.value);
    closeList();
  };

  const moveHighlight = (delta: number) => {
    const length = filteredOptions.length;
    if (length === 0) return;
    let index = highlightedIndex;
    for (let step = 0; step < length; step++) {
      index = (index + delta + length) % length;
      if (!filteredOptions[index]?.disabled) break;
    }
    setHighlightedIndex(index);
  };

  const moveTo = (targetIndex: number) => {
    const length = filteredOptions.length;
    if (length === 0) return;
    const step = targetIndex === 0 ? 1 : -1;
    let index = targetIndex;
    for (let attempt = 0; attempt < length; attempt++) {
      if (!filteredOptions[index]?.disabled) break;
      index = (index + step + length) % length;
    }
    setHighlightedIndex(index);
  };

  const selectHighlighted = () => {
    if (highlightedOption) selectOption(highlightedOption);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (disabled) return;

    if (!open) {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openList();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveHighlight(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveHighlight(-1);
        break;
      case "Home":
        event.preventDefault();
        moveTo(0);
        break;
      case "End":
        event.preventDefault();
        moveTo(filteredOptions.length - 1);
        break;
      case "Enter":
        event.preventDefault();
        selectHighlighted();
        break;
      case "Escape":
        event.preventDefault();
        closeList();
        break;
      case "Tab":
        closeList();
        break;
    }
  };

  const handleKeyDownRef = useRef(handleKeyDown);

  useEffect(() => {
    if (open && filterable) searchInputRef.current?.focus();
  }, [open, filterable]);

  useEffect(() => {
    if (open) highlightedOptionRef.current?.scrollIntoView?.({ block: "nearest" });
  }, [highlightedIndex, open, filteredOptions]);

  const inputIsCombobox = filterable && open;
  const activeDescendant =
    open && highlightedOption ? `${listboxId}-option-${highlightedIndex}` : undefined;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) closeList();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

useEffect(() => {
    handleKeyDownRef.current = handleKeyDown;
  });

  useEffect(() => {
    if (!(open && filterable)) return;
    const input = searchInputRef.current;
    if (!input) return;
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-expanded", "true");
    input.setAttribute("aria-controls", listboxId);
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-label", filterPlaceholder);
    const onKeyDown = (event: globalThis.KeyboardEvent) =>
      handleKeyDownRef.current(event as unknown as KeyboardEvent<HTMLElement>);
    input.addEventListener("keydown", onKeyDown);
    return () => {
      input.removeEventListener("keydown", onKeyDown);
      input.removeAttribute("role");
      input.removeAttribute("aria-expanded");
      input.removeAttribute("aria-controls");
      input.removeAttribute("aria-autocomplete");
      input.removeAttribute("aria-label");
      input.removeAttribute("aria-activedescendant");
    };
  }, [open, filterable, listboxId, filterPlaceholder]);

  useEffect(() => {
    if (!(open && filterable)) return;
    const input = searchInputRef.current;
    if (!input) return;
    if (activeDescendant) input.setAttribute("aria-activedescendant", activeDescendant);
    else input.removeAttribute("aria-activedescendant");
  }, [open, filterable, activeDescendant]);

  return (
    <div ref={containerRef} id={id} className={cn("relative", className)}>
      {label && (
        <div className="mb-2 flex items-baseline gap-1">
          <span id={labelId} className="text-overline font-semibold uppercase tracking-overline text-text-secondary">
            {label}
          </span>
          {optionalHint && (
            <span className="text-overline font-regular text-text-secondary">({optionalHint})</span>
          )}
        </div>
      )}

      <button
        type="button"
        disabled={disabled}
        role={inputIsCombobox ? undefined : "combobox"}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : placeholder ?? undefined}
        aria-activedescendant={inputIsCombobox ? undefined : activeDescendant}
        onClick={() => (open ? closeList() : openList())}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex h-12 w-full items-center justify-between gap-3 rounded-md border bg-background px-4 text-body transition-colors duration-fast",
          open ? "border-primary" : "border-border",
          disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
          triggerClassName,
        )}
      >
        <span className={cn("flex min-w-0 items-center gap-2", selectedOption ? "text-text-primary" : "text-text-secondary")}>
          {triggerIcon && (
            <span aria-hidden="true" className="shrink-0">
              {triggerIcon}
            </span>
          )}
          <span className="truncate text-left">
            {selectedOption ? selectedOption.label : placeholder ?? "Seleccionar…"}
          </span>
        </span>
        <CaretDown
          size={16}
          aria-hidden="true"
          className={cn("shrink-0 text-text-secondary transition-transform duration-fast", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-10 mt-2 overflow-hidden rounded-md border border-border bg-surface shadow-md">
          {filterable && (
            <div
              className={cn(
                "flex items-center gap-2 border-b border-divider px-3",
                "[&_input]:border-0",
                "[&_input]:bg-transparent",
                "[&_input]:outline-none",
                "[&_input]:focus:outline-hidden",
                "[&_input]:focus:ring-0",
                "[&_input]:placeholder:text-text-secondary",
              )}
            >
              <MagnifyingGlass size={16} aria-hidden="true" className="shrink-0 text-text-secondary" />
              <Input
                ref={searchInputRef}
                type="search"
                state="idle"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setHighlightedIndex(0);
                }}
                placeholder={filterPlaceholder}
              />
            </div>
          )}

          <ul
            role="listbox"
            id={listboxId}
            aria-label={label ?? placeholder}
            className={cn("max-h-60 overflow-y-auto p-1", listClassName)}
          >
            {filteredOptions.length === 0 && (
              <li role="status" className="px-3 py-2 text-body text-text-secondary">
                Sin resultados
              </li>
            )}

            {filteredOptions.map((option, index) => {
              const isHighlighted = index === highlightedIndex;
              const isSelected = selectedValue != null && valuesEqual(option.value, selectedValue);
              return (
                <li
                  key={`${String(option.value)}-${index}`}
                  id={`${listboxId}-option-${index}`}
                  ref={isHighlighted ? highlightedOptionRef : undefined}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled || undefined}
                  onClick={() => selectOption(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-2 rounded-xs px-3 py-2 text-body transition-colors duration-fast",
                    isHighlighted && "bg-surface-variant",
                    option.disabled && "cursor-not-allowed opacity-40",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {option.icon && (
                      <span aria-hidden="true" className="shrink-0">
                        {option.icon}
                      </span>
                    )}
                    <span className="truncate text-text-primary">{option.label}</span>
                  </span>
                  {isSelected && (
                    <Check size={16} weight="bold" aria-hidden="true" className="shrink-0 text-primary" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}