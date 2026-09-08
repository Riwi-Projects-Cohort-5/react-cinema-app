type Variant = "primary" | "secondary" | "outline";
type State = "default" | "loading" | "disabled";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl" | "icon";
type ButtonRadius = "none" | "sm" | "md" | "lg" | "xl" | "full";
type ButtonShadow = "none" | "sm" | "md" | "lg" | "xl";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  state?: State;
  size?: ButtonSize;
  radius?: ButtonRadius;
  shadow?: ButtonShadow;
  children: React.ReactNode;
  className?: string;
}

const Button = ({
  variant = "primary",
  state = "default",
  children,
  className = "",
  size = "md",
  radius = "md",
  shadow = "none",
}: ButtonProps) => {
  const variantClasses = {
    primary:
      "bg-primary text-white hover:bg-primary-hover focus:ring-2 focus:ring-primary focus:ring-offset-2",
    secondary:
      "bg-secondary text-white hover:bg-secondary/80 focus:ring-2 focus:ring-secondary focus:ring-offset-2",
    outline:
      "border-2 border-primary text-primary bg-transparent hover:bg-primary/10 focus:ring-2 focus:ring-primary focus:ring-offset-2",
  };

  const sizeClasses = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl",
    icon: "w-8 h-8 p-0 flex items-center justify-center",
  };

  const radiusClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  };

  const shadowClasses = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  };

  const stateClasses = {
    default: "",
    loading: "opacity-40 cursor-wait",
    disabled: "opacity-40 cursor-not-allowed",
  };

  const isDisabled = state === "loading" || state === "disabled";

  return (
    <button
      className={`
        font-secondary font-medium transition-colors duration-base
        flex items-center justify-center gap-2
        ${variantClasses[variant]}
        ${stateClasses[state]}
        ${sizeClasses[size]}
        ${radiusClasses[radius]}
        ${shadowClasses[shadow]}
        ${className}
      `}
      disabled={isDisabled}
    >
      {state === "loading" ? "Cargando..." : children}
    </button>
  );
};

export default Button;
