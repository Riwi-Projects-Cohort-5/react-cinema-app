interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

const ModalFooter = ({ children, className = "" }: ModalFooterProps) => {
  return (
    <div className={`px-6 py-4 border-t border-divider flex gap-3 justify-end ${className}`}>
      {children}
    </div>
  );
};

export default ModalFooter;
