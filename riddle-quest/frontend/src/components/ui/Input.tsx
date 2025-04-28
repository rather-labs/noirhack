export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder = '',
  className = '',
  ...props
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${className}`}
      {...props}
    />
  );
};
