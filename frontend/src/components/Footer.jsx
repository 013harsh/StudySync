import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="w-full border-t bg-base-200 text-base-content border-base-300">
      <div className="container px-6 py-10 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/")}
              className="text-2xl font-black tracking-tight text-left normal-case text-primary"
            >
              StudySync
            </button>
            <p className="text-sm opacity-70">
              Your all-in-one academic companion. Plan smarter, collaborate
              effortlessly.
            </p>
          </div>

          <div className="flex flex-col gap-4 md:items-end">
            <span className="text-xs font-bold tracking-widest uppercase opacity-50">
              Legal & Contact
            </span>
            <div className="flex flex-col gap-2 md:flex-row md:gap-6">
              <button
                onClick={() => navigate("/about")}
                className="text-sm text-left transition-colors link link-hover opacity-80 hover:opacity-100 hover:text-primary md:text-right"
              >
                About Us
              </button>
              <button
                onClick={() => navigate("/privacy")}
                className="text-sm text-left transition-colors link link-hover opacity-80 hover:opacity-100 hover:text-primary md:text-right"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => navigate("/terms")}
                className="text-sm text-left transition-colors link link-hover opacity-80 hover:opacity-100 hover:text-primary md:text-right"
              >
                Terms of Service
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="text-sm text-left transition-colors link link-hover opacity-80 hover:opacity-100 hover:text-primary md:text-right"
              >
                Contact
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between pt-6 mt-10 border-t border-base-300 sm:flex-row">
          <p className="text-xs opacity-60">
            © {new Date().getFullYear()} StudySync. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
