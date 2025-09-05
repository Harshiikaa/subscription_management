import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
    <h1 className="text-3xl font-bold">404 - Page not found</h1>
    <p className="mt-3 text-gray-600">The page you are looking for does not exist.</p>
    <Link className="mt-6 text-indigo-600 hover:underline" to="/">Go home</Link>
  </div>
);

export default NotFound;
