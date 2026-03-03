import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CreateGroupModal from "../components/groups/CreateGroupModal";
import JoinGroupModal from "../components/groups/JoinGroupModal";

/* ─── Shared Animation Variants ─── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

/* ─── Professional Content Config ─── */
const CORE_FEATURES = [
  {
    icon: "🎯",
    title: "Focused Collaboration",
    desc: "Create dedicated spaces for specific subjects or projects. No more scattered WhatsApp groups.",
    color: "primary",
  },
  {
    icon: "🤝",
    title: "Instant Access",
    desc: "Join any group immediately with a unique invite code. No waiting for admin approval.",
    color: "secondary",
  },
  {
    icon: "🔒",
    title: "Private & Secure",
    desc: "Only members with the code can access your group's notes and chat history.",
    color: "accent",
  },
  {
    icon: "⚡",
    title: "Real-time Sync",
    desc: "Everything updates instantly across all members' devices as you collaborate.",
    color: "info",
  },
];

const WORKFLOW = [
  {
    title: "Generate Code",
    desc: "Create a group and get a unique 6-character invite code.",
    step: 1,
  },
  {
    title: "Share with Peers",
    desc: "Distribute the code to your classmates via email or text.",
    step: 2,
  },
  {
    title: "Sync & Study",
    desc: "Start chatting and editing shared notes in real-time.",
    step: 3,
  },
];

/* ─── Modular Components ─── */

const HeroSection = () => (
  <section className="relative pt-16 pb-6 overflow-hidden sm:pt-24 sm:pb-8 bg-base-100">
    <div className="container relative z-10 px-6 mx-auto text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-2 mb-8 border rounded-full bg-primary/10 border-primary/20 text-primary"
      >
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs font-bold tracking-widest uppercase">
          Professional Workspace
        </span>
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-4xl font-black leading-tight tracking-tight md:text-6xl lg:text-7xl text-base-content"
      >
        Simplify Your Study <br />
        <span className="relative inline-block text-primary">
          Network
          <svg
            className="absolute left-0 w-full -bottom-2"
            viewBox="0 0 100 20"
            preserveAspectRatio="none"
          >
            <path
              d="M0 10 Q25 0 50 10 T100 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-primary/30"
            />
          </svg>
        </span>
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="max-w-2xl mx-auto mt-8 text-lg font-medium md:text-xl text-base-content/60"
      >
        The premium hub for modern students. Create focused study groups,
        collaborate on shared notes, and sync your academic goals.
      </motion.p>
    </div>
  </section>
);

const Features = () => {
  const [lastCreated, setLastCreated] = useState(null);
  const [lastJoined, setLastJoined] = useState(null);

  const clearNotification = (type) => {
    if (type === "created") setLastCreated(null);
    if (type === "joined") setLastJoined(null);
  };

  return (
    <div className="min-h-screen bg-base-100">
      <HeroSection />

      {/* ── Main Actions Section ── */}
      <section className="container px-6 pt-4 pb-12 mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-4xl gap-8 mx-auto md:flex-row"
        >
          <motion.div
            variants={itemVariants}
            className="w-full p-1 transition-all shadow-xl md:w-1/2 rounded-3xl bg-gradient-to-br from-primary to-secondary hover:shadow-2xl"
          >
            <div className="bg-base-100 p-8 rounded-[22px] h-full flex flex-col items-center text-center">
              <span className="mb-4 text-5xl">🏠</span>
              <h3 className="mb-3 text-2xl font-black">Found a Subject?</h3>
              <p className="max-w-xs mb-8 text-sm text-base-content/60">
                Start a new group and lead your classmates to academic success.
              </p>
              <CreateGroupModal
                modalId="features_page_create"
                onSuccess={setLastCreated}
              />
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="w-full p-px shadow-md md:w-1/2 rounded-3xl bg-base-300"
          >
            <div className="bg-base-100 p-8 rounded-[23px] h-full flex flex-col items-center text-center">
              <span className="mb-4 text-5xl">🔑</span>
              <h3 className="mb-3 text-2xl font-black">Got an Invite?</h3>
              <p className="max-w-xs mb-8 text-sm text-base-content/60">
                Paste your unique code to join the conversation instantly.
              </p>
              <JoinGroupModal
                modalId="features_page_join"
                onSuccess={setLastJoined}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Notifications Area */}
        <div className="h-20 max-w-md mx-auto mt-8">
          <AnimatePresence mode="wait">
            {lastCreated && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="shadow-lg alert alert-success rounded-2xl"
              >
                <div className="flex-1">
                  <span className="font-bold">Group Created!</span>
                  <div className="mt-1 font-mono text-xs opacity-80">
                    Code: {lastCreated.inviteCode}
                  </div>
                </div>
                <button
                  onClick={() => clearNotification("created")}
                  className="btn btn-ghost btn-xs btn-circle"
                >
                  ✕
                </button>
              </motion.div>
            )}
            {lastJoined && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="shadow-lg alert alert-info rounded-2xl"
              >
                <div className="flex-1">
                  <span className="font-bold">
                    Joined Group: {lastJoined.name}
                  </span>
                </div>
                <button
                  onClick={() => clearNotification("joined")}
                  className="btn btn-ghost btn-xs btn-circle"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Feature Showcase Grid ── */}
      <section className="px-6 py-24 bg-base-100">
        <div className="container mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-black md:text-5xl">
              Powered for Professional Study
            </h2>
            <p className="max-w-md mx-auto text-base-content/60">
              Premium tools designed to help you organize and excel in your
              academic journey.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {CORE_FEATURES.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className={`card bg-base-100 border border-base-300 shadow-sm transition-all hover:shadow-md group`}
              >
                <div className="p-8 card-body">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-${feature.color}/10 flex items-center justify-center text-3xl mb-6 transition-transform group-hover:scale-110`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="mb-3 text-base font-bold card-title">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-base-content/60">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Process Timeline ── */}
      <section className="container px-6 py-24 mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="mb-16 text-3xl font-black">
            Three Simple Steps to Success
          </h2>
          <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3">
            <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-px bg-base-300 z-0" />
            {WORKFLOW.map((item) => (
              <div
                key={item.step}
                className="relative z-10 flex flex-col items-center"
              >
                <div className="flex items-center justify-center mb-6 text-xl font-black rounded-full shadow-lg w-14 h-14 bg-primary text-primary-content shadow-primary/20">
                  {item.step}
                </div>
                <h3 className="mb-3 text-lg font-bold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-base-content/50">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="px-6 py-20">
        <div className="container mx-auto">
          <div className="bg-primary rounded-[3rem] p-12 md:p-20 text-center text-primary-content relative overflow-hidden shadow-2xl shadow-primary/30">
            <h2 className="relative z-10 mb-8 text-3xl font-black md:text-5xl lg:text-6xl">
              Ready to sync your squad?
            </h2>
            <p className="relative z-10 max-w-xl mx-auto mb-10 text-xl opacity-80">
              Join thousands of students across 500+ universities simplifying
              their collaboration.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative z-10 px-12 font-black bg-white border-none rounded-full shadow-xl btn btn-lg text-primary hover:bg-white/90"
              onClick={() => window.scrollTo({ top: 400, behavior: "smooth" })}
            >
              Get Started Now
            </motion.button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
