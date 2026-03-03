import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="hero min-h-[80vh] bg-base-200">
      <div className="text-center hero-content">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold text-base-content">
            Master Your Studies with StudySync
          </h1>
          <p className="py-6 text-base-content/80">
            Organize, collaborate, and excel in your academic journey. StudySync
            provides the tools you need to stay on top of your coursework and
            achieve your goals.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-outline btn-primary">
              Login
            </Link>
            <Link to="/dashboard" className="btn btn-secondary">
              Bypass to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
