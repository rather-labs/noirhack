export interface ModalContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
}

export const ModalContainer: React.FC<ModalContainerProps> = ({
  isOpen,
  onClose,
  className = '',
  children,
  ...props
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={onClose}>
      <div
        className={`bg-white rounded-lg shadow-lg p-6 max-w-lg w-full mx-4 ${className}`}
        onClick={(e) => e.stopPropagation()}
        {...props}>
        {children}
      </div>
    </div>
  );
};
