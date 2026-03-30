import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="relative overflow-hidden bg-center bg-cover bg-base-100 text-base-content">
      <div className="relative z-10 flex flex-col items-center justify-between px-10 py-12 text-sm font-semibold tracking-widest uppercase md:flex-row">
        {/* Left Side: Logo */}
        <div className="mb-4 md:mb-0">
          <button
            onClick={() => navigate("/")}
            className="text-2xl font-bold tracking-wide normal-case text-primary"
          >
            StudySync
          </button>
        </div>

        {/* Right Side: Details */}
        <div className="flex flex-wrap items-center justify-center gap-8">
          <button
            onClick={() => navigate("/about")}
            className="transition-colors link link-hover hover:text-primary"
          >
            About
          </button>
          <button
            onClick={() => navigate("/terms")}
            className="transition-colors link link-hover hover:text-primary"
          >
            Terms
          </button>
          <button
            onClick={() => navigate("/privacy")}
            className="transition-colors link link-hover hover:text-primary"
          >
            Privacy
          </button>
          <button
            onClick={() => navigate("/contact")}
            className="transition-colors link link-hover hover:text-primary"
          >
            Contact
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
