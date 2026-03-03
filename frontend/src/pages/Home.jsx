import { Link } from "react-router-dom";

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

const Home = () => {
  return (
    <div className="flex flex-col overflow-x-hidden">
      {/* ══════════════════════════════════════
          HERO  — screen 1
      ══════════════════════════════════════ */}
      <section className="relative flex items-stretch min-h-screen overflow-hidden bg-base-100">
        {/* ── Background removed for a clean, professional look ── */}

        {/* ── Top-left badge ── */}
        <div className="absolute z-10 top-6 left-8">
          <span className="text-xs font-semibold tracking-[0.25em] uppercase text-base-content/40">
            The Future of Studying
          </span>
        </div>

        {/* ── Left column — text + CTA ── */}
        <div className="z-10 flex flex-col justify-center w-full px-8 pt-24 pb-16 md:px-16 lg:px-24 md:w-1/2">
          {/* Headline */}
          <h1
            className="font-black leading-none tracking-tight uppercase text-base-content"
            style={{ fontSize: "clamp(3rem, 8vw, 6.5rem)" }}
          >
            WELCOME TO
            <br />
            <span
              className="text-primary"
              style={{
                WebkitTextStroke: "2px oklch(var(--p))",
                textShadow: "0 0 40px oklch(var(--p)/0.35)",
              }}
            >
              STUDY
            </span>
            <span className="text-base-content">SYNC</span>
          </h1>

          {/* Animated accent bar */}
          <div className="flex items-center gap-3 my-7">
            <div className="h-[3px] w-14 rounded-full bg-primary" />
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-primary/80">
              Learn · Collaborate · Excel
            </span>
          </div>

          {/* Tagline */}
          <p className="max-w-sm text-base leading-relaxed md:text-lg text-base-content/65">
            Your all-in-one academic companion — plan smarter, collaborate
            effortlessly, and watch your grades rise.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col gap-4 mt-10 sm:flex-row">
            <Link
              // to="/login?redirect=/features"
              to="/features"
              className="transition-transform duration-300 shadow-lg btn btn-primary btn-lg hover:scale-105"
            >
              Get Started your study
            </Link>
            <Link
              to="/login"
              className="transition-all duration-300 border btn btn-ghost btn-lg border-base-content/20 hover:border-primary hover:scale-105"
            >
              Login
            </Link>
          </div>

          {/* Scroll hint */}
          <div className="flex items-center gap-2 mt-14 text-base-content/35 animate-bounce">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            <span className="text-[11px] tracking-[0.3em] uppercase">
              Scroll to explore
            </span>
          </div>
        </div>

        {/* ── Right column — illustration + decorative boxes ── */}
        <div className="relative items-center justify-center hidden overflow-hidden border-l md:flex md:w-1/2 border-base-300">
          {/* Decorations removed for a cleaner look */}

          {/* Illustration */}
          <img
            src="/study_illustration.png"
            alt="Student studying illustration"
            className="relative z-10 w-[82%] max-w-lg object-contain drop-shadow-2xl"
            style={{ filter: "drop-shadow(0 20px 40px oklch(var(--p)/0.18))" }}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES + CTA  — screen 2
      ══════════════════════════════════════ */}
      <section className="relative px-6 py-20 overflow-hidden bg-base-100">
        {/* Background grid removed for a clean, solid look */}

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Section header */}
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

          {/* Feature cards */}
          <div className="grid grid-cols-1 gap-5 mb-16 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="relative p-6 overflow-hidden transition-all duration-300 border group rounded-2xl bg-base-200 border-base-300 hover:border-primary/50 hover:-translate-y-1"
              >
                {/* card inner glow on hover */}
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
