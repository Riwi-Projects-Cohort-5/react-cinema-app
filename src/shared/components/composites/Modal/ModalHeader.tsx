interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const ModalHeader = ({ children, className = "" }: ModalHeaderProps) => {
  return (
    <div className={`px-6 py-4 border-b border-divider ${className}`}>
      <h2 className="text-title text-text-primary">{children}</h2>
    </div>
  );
};

export default ModalHeader;
