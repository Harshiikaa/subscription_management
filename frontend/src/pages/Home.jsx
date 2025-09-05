import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Button from "../components/ui/Button";
import { Link } from "react-router-dom";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useMeta from "../hooks/useMeta";

const Home = () => {
  useDocumentTitle("SaaS - Home");
  useMeta({ description: "SaaS subscription management for Nepal with eSewa and IME Pay." });
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Manage subscriptions with ease</h1>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">Simple, role-based SaaS subscription management for Nepal with eSewa and IME Pay.</p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/pricing"><Button>View Pricing</Button></Link>
            <Link to="/signup"><Button variant="secondary">Get Started</Button></Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
