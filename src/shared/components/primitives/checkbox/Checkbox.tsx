import { useState } from "react";
import type { KeyboardEvent } from "react";
import { Check as CheckIcon } from "@phosphor-icons/react";

interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  defaultChecked?: boolean;
  disabled?: boolean;
  className?: string;
}

export const Checkbox = ({
  checked: checkedProp,
  onChange,
  defaultChecked = false,
  disabled = false,
  className = "",
}: CheckboxProps) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = checkedProp !== undefined;
  const checked = isControlled ? checkedProp : internalChecked;

  const toggle = () => {
    if (disabled) return;
    const next = !checked;
    if (!isControlled) setInternalChecked(next);
    onChange?.(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      toggle();
    }
  };

  return (
    <div
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={toggle}
      onKeyDown={handleKeyDown}
      className={`flex cursor-pointer select-none items-start p-px ${
        disabled ? "cursor-not-allowed opacity-40" : ""
      } ${className}`}
    >
      <div
        aria-hidden="true"
        className={`flex justify-center items-center w-[1.125rem] h-[1.125rem] rounded-xs border transition-colors duration-fast ${
          checked
            ? "border-primary bg-primary text-text-primary"
            : "border-border bg-transparent text-text-disabled"
        }`}
      >
        {checked && <CheckIcon size={16} weight="bold" aria-hidden="true" />}
      </div>
    </div>
  );
};

interface CheckboxRobotProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  defaultChecked?: boolean;
  disabled?: boolean;
  className?: string;
}

export const CheckboxRobot = ({
  checked: checkedProp,
  onChange,
  defaultChecked = false,
  disabled = false,
  className = "",
}: CheckboxRobotProps) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = checkedProp !== undefined;
  const checked = isControlled ? checkedProp : internalChecked;

  const toggle = () => {
    if (disabled) return;
    const next = !checked;
    if (!isControlled) setInternalChecked(next);
    onChange?.(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      toggle();
    }
  };

  return (
    <div
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={toggle}
      onKeyDown={handleKeyDown}
      className={`flex cursor-pointer select-none items-center justify-center ${
        disabled ? "cursor-not-allowed opacity-40" : ""
      } ${className}`}
    >
      <div
        aria-hidden="true"
        className={`flex justify-center items-center w-[1.375rem] h-[1.375rem] rounded-xs border-2 transition-colors duration-fast ${
          checked
            ? "border-success bg-success text-text-primary"
            : "border-border bg-background text-text-disabled"
        }`}
      >
        {checked && <CheckIcon size={16} weight="bold" aria-hidden="true" />}
      </div>
    </div>
  );
};