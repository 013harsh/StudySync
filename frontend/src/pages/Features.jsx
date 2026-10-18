import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import CreateGroupModal from "../components/groups/CreateGroupModal";
import JoinGroupModal from "../components/groups/JoinGroupModal";
import YouTubeModal from "../components/groups/YouTubeModal";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { y: 24, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 90, damping: 16 },
  },
};

const CORE_FEATURES = [
  {
    icon: "🎯",
    title: "Focused Collaboration",
    desc: "Dedicated spaces per subject. No more chaotic WhatsApp threads.",
    color: "primary",
  },
  {
    icon: "🤝",
    title: "Instant Access",
    desc: "Join any group in seconds with a unique invite code.",
    color: "secondary",
  },
  {
    icon: "🔒",
    title: "Private & Secure",
    desc: "Only code holders can view your group's notes and chat.",
    color: "accent",
  },
  {
    icon: "⚡",
    title: "Real-time Sync",
    desc: "Everything updates live across every member's device.",
    color: "info",
  },
  {
    icon: "📞",
    title: "Live Video & Audio",
    desc: "Connect seamlessly with peer-to-peer WebRTC calls directly in your room.",
    color: "success",
  },
  {
    icon: "▶️",
    title: "YouTube Study Sync",
    desc: "Stream lectures, tutorials, and focus playlists in sync with your group.",
    color: "error",
  },
  {
    icon: "🧑‍🤝‍🧑",
    title: "Find Friends",
    desc: "Find friends to study with.",
    color: "primary",
  },
];

const WORKFLOW = [
  {
    step: 1,
    title: "Create & Generate",
    desc: "Start a group and receive a unique 6-character invite code instantly.",
  },
  {
    step: 2,
    title: "Share with Peers",
    desc: "Send your code to classmates via any channel — email, text, or chat.",
  },
  {
    step: 3,
    title: "Sync & Study",
    desc: "Collaborate on shared notes and chat in real-time, together.",
  },
];

const HeroSection = () => (
  <section className="relative pt-6 overflow-hidden sm:pt-15 bg-base-100">
    <div className="container relative z-10 px-6 mx-auto text-center">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 mb-7 border rounded-full bg-primary/8 border-primary/20 text-primary"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-[11px] font-bold tracking-[0.15em] uppercase">
          Professional Academic Workspace
        </span>
      </motion.div>
      <motion.h1
        initial={{ y: 22, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-3xl font-black leading-[1.1] tracking-tight md:text-5xl lg:text-6xl text-base-content "
      >
        Your Study Network Simplified
      </motion.h1>

      {/* Subtext */}
      <motion.p
        initial={{ y: 22, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="max-w-xl mx-auto mt-6 text-base leading-relaxed md:text-lg text-base-content/85"
      >
        The premium hub for modern students — create focused study groups,
        collaborate on shared notes, and stay in sync with your academic goals.
      </motion.p>
    </div>
  </section>
);

const Features = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [lastCreated, setLastCreated] = useState(null);
  const [lastJoined, setLastJoined] = useState(null);

  const clearNotification = (type) => {
    if (type === "created") setLastCreated(null);
    if (type === "joined") setLastJoined(null);
  };

  return (
    <div className="min-h-screen bg-base-100">
      <HeroSection />

      {/* ══ Action Cards ══ */}
      <section className="container px-6 pt-6 mx-auto pb-14">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex items-center max-w-2xl gap-3 mx-auto mb-6"
        >
          <div className="flex-1 h-px bg-base-300" />
          <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-base-content/40">
            Get Started
          </span>
          <div className="flex-1 h-px bg-base-300" />
        </motion.div>
        {/* Cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid max-w-6xl grid-cols-1 gap-5 mx-auto sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* ── Create Group Card ── */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 280, damping: 18 }}
            className="relative flex flex-col overflow-hidden transition-all duration-300 border shadow-md group rounded-3xl border-base-300 bg-base-100 hover:shadow-xl hover:border-primary/30"
          >
            {/* Top gradient zone */}
            <div className="relative flex flex-col items-center gap-4 px-6 pt-9 pb-7 bg-gradient-to-b from-primary/10 to-transparent">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <div className="absolute right-0 w-32 h-32 rounded-full pointer-events-none -top-10 bg-primary/10 blur-2xl" />

              {/* Icon */}
              <div className="relative z-10 flex items-center justify-center w-[60px] h-[60px] rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/25 text-[28px] group-hover:scale-110 group-hover:shadow-primary/40 transition-all duration-300">
                🏠
              </div>

              {/* Title */}
              <div className="relative z-10 text-center">
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-primary/70 mb-0.5">
                  Host a Room
                </p>
                <h3 className="text-[15px] font-black text-base-content leading-snug">
                  Create Study Group
                </h3>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-col items-center flex-1 gap-4 px-6 pt-3 pb-6">
              <p className="text-[11px] text-base-content/50 text-center leading-relaxed">
                Start a focused group for your subject and invite your
                classmates with a unique code.
              </p>
              <div className="w-full mt-auto">
                <CreateGroupModal
                  modalId="features_page_create"
                  onSuccess={setLastCreated}
                />
              </div>
            </div>
          </motion.div>

          {/* ── Join / Invite Card ── */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 280, damping: 18 }}
            className="relative flex flex-col overflow-hidden transition-all duration-300 border shadow-md group rounded-3xl border-base-300 bg-base-100 hover:shadow-xl hover:border-secondary/30"
          >
            {/* Top gradient zone */}
            <div className="relative flex flex-col items-center gap-4 px-6 pt-9 pb-7 bg-gradient-to-b from-secondary/10 to-transparent">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />
              <div className="absolute right-0 w-32 h-32 rounded-full pointer-events-none -top-10 bg-secondary/10 blur-2xl" />

              {/* Icon */}
              <div className="relative z-10 flex items-center justify-center w-[60px] h-[60px] rounded-2xl bg-gradient-to-br from-secondary to-accent shadow-lg shadow-secondary/25 text-[28px] group-hover:scale-110 group-hover:shadow-secondary/40 transition-all duration-300">
                🔑
              </div>

              {/* Title */}
              <div className="relative z-10 text-center">
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-secondary/70 mb-0.5">
                  Join a Room
                </p>
                <h3 className="text-[15px] font-black text-base-content leading-snug">
                  Join with Invite Code
                </h3>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-col items-center flex-1 gap-4 px-6 pt-3 pb-6">
              <p className="text-[11px] text-base-content/50 text-center leading-relaxed">
                Have a code? Paste it below and jump into your study group
                conversation instantly.
              </p>
              <div className="w-full mt-auto">
                <JoinGroupModal
                  modalId="features_page_join"
                  onSuccess={setLastJoined}
                />
              </div>
            </div>
          </motion.div>

          {/* ── Call UI Card ── */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 280, damping: 18 }}
            className="relative flex flex-col overflow-hidden transition-all duration-300 border shadow-md group rounded-3xl border-base-300 bg-base-100 hover:shadow-xl hover:border-accent/30"
          >
            {/* Top gradient zone */}
            <div className="relative flex flex-col items-center gap-4 px-6 pt-9 pb-7 bg-gradient-to-b from-accent/10 to-transparent">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
              <div className="absolute right-0 w-32 h-32 rounded-full pointer-events-none -top-10 bg-accent/10 blur-2xl" />

              {/* Icon */}
              <div className="relative z-10 flex items-center justify-center w-[60px] h-[60px] rounded-2xl bg-gradient-to-br from-accent to-info shadow-lg shadow-accent/25 text-[28px] group-hover:scale-110 group-hover:shadow-accent/40 transition-all duration-300">
                📞
              </div>

              {/* Title */}
              <div className="relative z-10 text-center">
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-accent/70 mb-0.5">
                  Connect Live
                </p>
                <h3 className="text-[15px] font-black text-base-content leading-snug">
                  Video & Audio Calls
                </h3>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-col items-center flex-1 gap-4 px-6 pt-3 pb-6">
              <p className="text-[11px] text-base-content/50 text-center leading-relaxed">
                Jump into seamless WebRTC peer-to-peer calls directly from your
                study room.
              </p>
              <div className="w-full mt-auto">
                <button
                  className="w-full h-10 min-h-0 text-sm font-bold btn btn-accent text-accent-content rounded-xl"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate("/login");
                    } else {
                      document.getElementById("features_page_join")?.showModal();
                    }
                  }}
                >
                  → Try It Now
                </button>
              </div>
            </div>
          </motion.div>

          {/* ── YouTube Study Card ── */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 280, damping: 18 }}
            className="relative flex flex-col overflow-hidden transition-all duration-300 border shadow-md group rounded-3xl border-base-300 bg-base-100 hover:shadow-xl hover:border-red-500/30"
          >
            {/* Top gradient zone */}
            <div className="relative flex flex-col items-center gap-4 px-6 pt-9 pb-7 bg-gradient-to-b from-red-500/10 to-transparent">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
              <div className="absolute right-0 w-32 h-32 rounded-full pointer-events-none -top-10 bg-red-500/10 blur-2xl" />

              {/* Icon */}
              <div className="relative z-10 flex items-center justify-center w-[60px] h-[60px] rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/25 group-hover:scale-110 group-hover:shadow-red-500/40 transition-all duration-300">
                <svg
                  className="w-8 h-8 text-white fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </div>

              {/* Title */}
              <div className="relative z-10 text-center">
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-red-500/80 mb-0.5">
                  Watch Together
                </p>
                <h3 className="text-[15px] font-black text-base-content leading-snug">
                  YouTube Study Stream
                </h3>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-col items-center flex-1 gap-4 px-6 pt-3 pb-6">
              <p className="text-[11px] text-base-content/50 text-center leading-relaxed">
                Stream educational lectures, tutorials, or focus lo-fi playlists
                together with your group.
              </p>
              <div className="w-full mt-auto">
                <YouTubeModal modalId="features_page_youtube" />
              </div>
            </div>
          </motion.div>
        </motion.div>
        {/* Toast Notifications */}
        <div className="min-h-[56px] max-w-md mx-auto mt-5">
          <AnimatePresence mode="wait">
            {lastCreated && (
              <motion.div
                key="created"
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-3 px-4 py-3 border shadow-sm bg-success/10 border-success/25 rounded-2xl"
              >
                <span className="text-lg">✅</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-base-content">
                    Group Created!
                  </p>
                  <p className="font-mono text-xs text-base-content/60">
                    Code: {lastCreated.inviteCode}
                  </p>
                </div>
                <button
                  onClick={() => clearNotification("created")}
                  className="btn btn-ghost btn-xs btn-circle opacity-60 hover:opacity-100"
                >
                  ✕
                </button>
              </motion.div>
            )}
            {lastJoined && (
              <motion.div
                key="joined"
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-3 px-4 py-3 border shadow-sm bg-info/10 border-info/25 rounded-2xl"
              >
                <span className="text-lg">🎉</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-base-content">
                    Joined: {lastJoined.name}
                  </p>
                </div>
                <button
                  onClick={() => clearNotification("joined")}
                  className="btn btn-ghost btn-xs btn-circle opacity-60 hover:opacity-100"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ══ Feature Showcase ══ */}
      <section className="px-6 py-20 bg-base-200/40">
        <div className="container mx-auto">
          {/* Heading */}
          <div className="mb-12 text-center">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-primary mb-3">
              Why StudySync
            </p>
            <h2 className="text-3xl font-black md:text-4xl text-base-content">
              Built for Serious Students
            </h2>
            <p className="max-w-sm mx-auto mt-3 text-sm leading-relaxed text-base-content/50">
              Premium tools that keep you organized, focused, and ahead.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {CORE_FEATURES.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="flex flex-col gap-4 p-6 transition-all duration-300 border shadow-sm group rounded-2xl border-base-300 bg-base-100 hover:shadow-md hover:border-primary/20"
              >
                <div className="flex items-center justify-center w-12 h-12 text-2xl transition-transform duration-300 rounded-xl bg-base-200 group-hover:scale-110">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-bold text-base-content">
                    {feature.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-base-content/50">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ Workflow Steps ══ */}
      <section className="container px-6 py-20 mx-auto">
        <div className="max-w-3xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-14">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-primary mb-3">
              How it Works
            </p>
            <h2 className="text-3xl font-black text-base-content">
              Three Steps to Collaboration
            </h2>
          </div>

          {/* Steps */}
          <div className="relative grid grid-cols-1 gap-10 md:grid-cols-3">
            {/* Connector line */}
            <div className="hidden md:block absolute top-[22px] left-[calc(16.5%+1px)] right-[calc(16.5%+1px)] h-px bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 z-0" />

            {WORKFLOW.map((item, idx) => {
              const colors = [
                "from-primary to-secondary",
                "from-secondary to-accent",
                "from-accent to-info",
              ];
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.12 }}
                  className="relative z-10 flex flex-col items-center text-center"
                >
                  {/* Step bubble */}
                  <div
                    className={`flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br ${colors[idx]} text-white text-sm font-black shadow-lg mb-5`}
                  >
                    {item.step}
                  </div>
                  <h3 className="mb-2 text-sm font-bold text-base-content">
                    {item.title}
                  </h3>
                  <p className="text-xs text-base-content/50 leading-relaxed max-w-[170px]">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
