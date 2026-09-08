interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

const ModalBody = ({ children, className = "" }: ModalBodyProps) => {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
};

export default ModalBody;
