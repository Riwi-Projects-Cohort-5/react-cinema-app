type Variant = "primary" | "secondary" | "outline";
type State = "default" | "loading" | "disabled";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  state?: State;
  children: React.ReactNode;
  className?: string;
}

const Button = ({
  variant = "primary",
  state = "default",
  children,
  className = "",
}: ButtonProps) => {
  const variantClasses = {
    primary:
      "bg-primary text-white hover:bg-primary-hover focus:ring-2 focus:ring-primary focus:ring-offset-2",
    secondary:
      "bg-secondary text-white hover:bg-secondary/80 focus:ring-2 focus:ring-secondary focus:ring-offset-2",
    outline:
      "border-2 border-primary text-primary bg-transparent hover:bg-primary/10 focus:ring-2 focus:ring-primary focus:ring-offset-2",
  };

  const stateClasses = {
    default: "",
    loading: "opacity-40 cursor-wait",
    disabled: "opacity-40 cursor-not-allowed",
  };

  const isDisabled = state === "loading" || state === "disabled";

  return (
    <button
      className={`px-3 py-1 rounded-sm font-secondary font-medium transition-colors duration-base ${variantClasses[variant]} ${stateClasses[state]} ${className}`}
      disabled={isDisabled}
    >
      {state === "loading" ? "Cargando..." : children}
    </button>
  );
};

export default Button;
