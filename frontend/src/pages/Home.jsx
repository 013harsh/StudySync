import { Link } from "react-router-dom";
import { useState } from "react";

const features = [
  {
    icon: "📅",
    title: "Smart Study Planner",
    desc: "Auto-schedule your tasks so you always know what to focus on next.",
  },
  {
    icon: "👥",
    title: "Real-time Collaboration",
    desc: "Work with classmates on notes, projects, and resources in sync.",
  },
  {
    icon: "📈",
    title: "Progress Analytics",
    desc: "Visual dashboards that show you exactly where you stand academically.",
  },
  {
    icon: "📚",
    title: "Resource Hub",
    desc: "One place for all your PDFs, links, lecture notes, and bookmarks.",
  },
];

const DraggableCard = ({ icon, title, subtitle, initialPosition }) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`absolute p-6 border shadow-2xl card bg-base-100 border-base-300 w-72 cursor-move select-none ${!isDragging ? "animate-float" : ""}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: isDragging ? "none" : "transform 0.3s ease",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
          <span className="text-2xl">{icon}</span>
        </div>
        <div>
          <div className="text-sm font-bold text-base-content">{title}</div>
          <div className="text-xs text-base-content/60">{subtitle}</div>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  return (
    <div className="flex flex-col overflow-x-hidden">
      <section className="relative flex items-center min-h-screen overflow-hidden bg-gradient-to-br from-base-100 via-base-200 to-base-100">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-10 w-64 h-64 bg-accent/5 rounded-full blur-2xl" />
        </div>

        <div className="container relative z-10 px-6 py-20 mx-auto lg:px-12">
          <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Left Content */}
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border rounded-full bg-primary/10 border-primary/20">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold tracking-widest uppercase text-primary">
                  The Future of Studying
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="mb-6 font-black leading-tight tracking-tight text-base-content font-['Inter',sans-serif]">
                <span className="block text-5xl md:text-6xl lg:text-7xl">
                  WELCOME TO
                </span>
                <span className="block mt-2 text-6xl md:text-7xl lg:text-8xl text-primary">
                  STUDYSYNC
                </span>
              </h1>

              {/* Tagline */}
              <div className="flex items-center gap-3 mb-6">
                <div className="h-[2px] w-12 rounded-full bg-primary" />
                <span className="text-sm font-semibold tracking-widest uppercase text-primary/80 font-['Poppins',sans-serif]">
                  Learn · Collaborate · Excel
                </span>
              </div>

              {/* Description */}
              <p className="mb-8 text-lg leading-relaxed md:text-xl text-base-content/70 font-['Inter',sans-serif]">
                Your all-in-one academic companion. Plan smarter, collaborate
                effortlessly, and achieve excellence in your studies.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-4 mb-10 sm:flex-row">
                <Link
                  to="/dashboard"
                  className="shadow-lg btn btn-primary btn-lg hover:scale-105 transition-transform"
                >
                  Get Started
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
                <Link
                  to="/features"
                  className="btn btn-outline btn-lg hover:scale-105 transition-transform"
                >
                  Explore Features
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:flex items-center justify-center h-[600px]">
              <div className="relative w-full h-full">
                <DraggableCard
                  icon="📚"
                  title="Study Groups"
                  subtitle="Join & Collaborate"
                  initialPosition={{ x: 200, y: 120 }}
                />

                <DraggableCard
                  icon="📈"
                  title="Track Progress"
                  subtitle="Real-time Analytics"
                  initialPosition={{ x: 300, y: 280 }}
                />

                <DraggableCard
                  icon="🎯"
                  title="Smart Planning"
                  subtitle="Achieve Your Goals"
                  initialPosition={{ x: 250, y: 450 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute flex flex-col items-center gap-2 -translate-x-1/2 bottom-8 left-1/2 text-base-content/40 animate-bounce">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </section>

      <section className="relative px-6 pb-20 overflow-hidden bg-base-100">
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-primary">
              Core Features
            </span>
            <h2 className="mt-3 text-4xl font-bold md:text-5xl text-base-content">
              Everything you need to excel
            </h2>
            <p className="max-w-md mx-auto mt-4 text-base-content/60">
              One platform — four superpowers for serious students.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 mb-16 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="relative p-6 overflow-hidden transition-all duration-300 border group rounded-2xl bg-base-200 border-base-300 hover:border-primary/50 hover:-translate-y-1"
              >
                <div
                  className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100 rounded-2xl"
                  style={{
                    background:
                      "radial-gradient(circle at top left, oklch(var(--p)/0.07), transparent 70%)",
                  }}
                />
                <div className="mb-4 text-4xl">{f.icon}</div>
                <h3 className="mb-2 text-base font-bold text-base-content">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-base-content/60">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
