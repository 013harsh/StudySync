import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-center bg-cover bg-base-100 text-base-content">
      {/* Background large text watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-5">
        <span className="text-[18vw] font-black uppercase whitespace-nowrap leading-none w-full text-center">
          StudySync
        </span>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-between px-10 py-8 text-sm font-semibold tracking-widest uppercase md:flex-row">
        {/* Left Side: Logo */}
        <div className="mb-4 md:mb-0">
          <Link
            to="/"
            className="text-2xl font-bold tracking-wide normal-case text-primary"
          >
            StudySync
          </Link>
        </div>

        {/* Right Side: Details */}
        <div className="flex flex-wrap items-center justify-center gap-8">
          <Link
            to="/about"
            className="transition-colors link link-hover hover:text-primary"
          >
            About
          </Link>
          <Link
            to="/terms"
            className="transition-colors link link-hover hover:text-primary"
          >
            Terms
          </Link>
          <Link
            to="/privacy"
            className="transition-colors link link-hover hover:text-primary"
          >
            Privacy
          </Link>
          <Link
            to="/contact"
            className="transition-colors link link-hover hover:text-primary"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
