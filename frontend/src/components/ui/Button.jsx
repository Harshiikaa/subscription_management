const base = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
const variants = {
  primary: `${base} bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-600`,
  secondary: `${base} bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus:ring-gray-300`,
  danger: `${base} bg-red-600 text-white hover:bg-red-700 focus:ring-red-600`,
};

const Button = ({ children, variant = "primary", className = "", ...props }) => {
  return (
    <button className={`${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
