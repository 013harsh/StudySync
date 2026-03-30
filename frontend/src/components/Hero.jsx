import { useEffect, useState, useMemo, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ── Constants (outside component — never recreated) ───────────────────────────
const LOAD_MS = 1800;

const THEMES = {
  forest: {
    bg: "#0a120a",
    primary: "#4ade80",
    primaryGlow: "#4ade8040",
    primaryDim: "#4ade8020",
    text: "#f0fdf4",
    textDim: "#86efac70",
    trackColor: "#4ade8018",
    barGrad: "linear-gradient(90deg, #16a34a, #4ade80, #86efac)",
  },
  winter: {
    bg: "#f0f6ff",
    primary: "#2563eb",
    primaryGlow: "#2563eb38",
    primaryDim: "#2563eb1a",
    text: "#0f172a",
    textDim: "#2563eb80",
    trackColor: "#2563eb14",
    barGrad: "linear-gradient(90deg, #1d4ed8, #2563eb, #60a5fa)",
  },
  dark: {
    bg: "#0f0f0f",
    primary: "#a78bfa",
    primaryGlow: "#a78bfa40",
    primaryDim: "#a78bfa20",
    text: "#f5f5f5",
    textDim: "#c4b5fd70",
    trackColor: "#a78bfa18",
    barGrad: "linear-gradient(90deg, #7c3aed, #a78bfa, #c4b5fd)",
  },
  cupcake: {
    bg: "#faf7f5",
    primary: "#ec4899",
    primaryGlow: "#ec489938",
    primaryDim: "#ec48991a",
    text: "#291334",
    textDim: "#f472b680",
    trackColor: "#ec489914",
    barGrad: "linear-gradient(90deg, #db2777, #ec4899, #f472b6)",
  },
};

// Thresholds as a plain sorted array — cheap to scan
const STATUS_STEPS = [
  [0, "Initializing workspace..."],
  [25, "Loading study modules..."],
  [50, "Preparing your dashboard..."],
  [80, "Almost ready..."],
  [100, "Welcome to StudySync"],
];

// Precomputed ring geometry — never changes
const RING_R = 88;
const RING_C = 2 * Math.PI * RING_R;

// Framer-motion transition objects — defined once, not inline
const RING_TRANSITION = { duration: 0.1, ease: "linear" };
const REVEAL_TRANSITION = { duration: 0.6, ease: [0.34, 1.2, 0.64, 1] };
const FADE_TRANSITION = { delay: 0.2, duration: 0.5 };
const TITLE_TRANSITION = { delay: 0.3, duration: 0.5 };
const LINE_TRANSITION = { delay: 0.4, duration: 0.5 };
const STATUS_TRANSITION = { duration: 0.2 };
const EXIT_TRANSITION = { duration: 0.4, ease: "easeOut" };

// ── Helpers ───────────────────────────────────────────────────────────────────
function getTheme() {
  const key = document.documentElement.getAttribute("data-theme") || "winter";
  return THEMES[key] ?? THEMES.winter;
}

function getStatus(progress) {
  // Walk backwards — first match wins (avoids .reverse() + .find() each render)
  for (let i = STATUS_STEPS.length - 1; i >= 0; i--) {
    if (progress >= STATUS_STEPS[i][0]) return STATUS_STEPS[i][1];
  }
  return STATUS_STEPS[0][1];
}

// ── useLiveTheme ──────────────────────────────────────────────────────────────
function useLiveTheme() {
  const [t, setT] = useState(getTheme);

  useEffect(() => {
    const obs = new MutationObserver(() => setT(getTheme()));
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => obs.disconnect();
  }, []);

  return t;
}

// ── Ring (memoized — only re-renders when progress or theme changes) ──────────
const Ring = memo(function Ring({ progress, t }) {
  return (
    <svg width="220" height="220" viewBox="-110 -110 220 220">
      <defs>
        <filter id="soft-glow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Track */}
      <circle
        cx="0"
        cy="0"
        r={RING_R}
        fill="none"
        stroke={t.trackColor}
        strokeWidth="3"
      />

      {/* Progress arc */}
      <motion.circle
        cx="0"
        cy="0"
        r={RING_R}
        fill="none"
        stroke={t.primary}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={RING_C}
        animate={{ strokeDashoffset: RING_C * (1 - progress / 100) }}
        transition={RING_TRANSITION}
        transform="rotate(-90)"
        filter="url(#soft-glow)"
      />

      {/* Leading dot */}
      <motion.g
        animate={{ rotate: progress * 3.6 }}
        transition={RING_TRANSITION}
        style={{ transformOrigin: "0 0" }}
      >
        <circle
          cx="0"
          cy={-RING_R}
          r="5"
          fill={t.primary}
          filter="url(#soft-glow)"
        />
      </motion.g>

      {/* Static center decoration */}
      <circle
        cx="0"
        cy="0"
        r="38"
        fill="none"
        stroke={t.primaryDim}
        strokeWidth="1"
      />
      <circle
        cx="0"
        cy="0"
        r="26"
        fill="none"
        stroke={t.trackColor}
        strokeWidth="1"
        strokeDasharray="3 6"
      />
    </svg>
  );
});

// ── GlowBg (memoized — only re-renders when theme changes) ───────────────────
const GlowBg = memo(function GlowBg({ primaryGlow }) {
  return (
    <div
      style={{
        position: "absolute",
        width: 380,
        height: 380,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${primaryGlow} 0%, transparent 70%)`,
        pointerEvents: "none",
      }}
    />
  );
});

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Intro() {
  const navigate = useNavigate();
  const t = useLiveTheme();
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  // Memoized status — only recomputes when progress crosses a threshold
  const statusMsg = useMemo(() => getStatus(progress), [progress]);

  // Counter via rAF — cleanup through ref
  useEffect(() => {
    startRef.current = performance.now();

    const tick = (now) => {
      const elapsed = now - startRef.current;
      const raw = Math.min((elapsed / LOAD_MS) * 100, 100);
      const floored = Math.floor(raw);

      setProgress(floored);

      if (raw < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setTimeout(() => setDone(true), 200);
        setTimeout(() => navigate("/home"), 600);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [navigate]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="intro"
          exit={{ opacity: 0, scale: 0.96 }}
          transition={EXIT_TRANSITION}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: t.bg,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <GlowBg primaryGlow={t.primaryGlow} />

          {/* Ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={REVEAL_TRANSITION}
          >
            <Ring progress={progress} t={t} />
          </motion.div>

          {/* Counter — floats over the ring */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={FADE_TRANSITION}
            style={{
              position: "absolute",
              display: "flex",
              alignItems: "flex-end",
              gap: 3,
            }}
          >
            <span
              style={{
                color: t.primary,
                fontSize: "3.2rem",
                fontWeight: 700,
                fontFamily: "'Courier New', monospace",
                lineHeight: 1,
                letterSpacing: "-0.03em",
                textShadow: `0 0 30px ${t.primaryGlow}`,
              }}
            >
              {String(progress).padStart(3, "0")}
            </span>
            <span
              style={{
                color: t.textDim,
                fontSize: "1rem",
                fontFamily: "monospace",
                marginBottom: 6,
              }}
            >
              %
            </span>
          </motion.div>

          {/* Brand name */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={TITLE_TRANSITION}
            style={{
              color: t.text,
              fontSize: "1.75rem",
              fontWeight: 700,
              fontFamily: "'Georgia', serif",
              letterSpacing: "0.25em",
              margin: "28px 0 8px",
              textAlign: "center",
              textShadow: `0 2px 20px ${t.primaryGlow}`,
            }}
          >
            STUDYSYNC
          </motion.h1>

          {/* Separator */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={LINE_TRANSITION}
            style={{
              width: 60,
              height: 2,
              background: t.primary,
              margin: "0 0 16px",
              borderRadius: 2,
              boxShadow: `0 0 10px ${t.primaryGlow}`,
            }}
          />

          {/* Status */}
          <AnimatePresence mode="wait">
            <motion.p
              key={statusMsg}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={STATUS_TRANSITION}
              style={{
                color: t.textDim,
                fontSize: "0.75rem",
                fontFamily: "'Courier New', monospace",
                letterSpacing: "0.15em",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              {statusMsg}
            </motion.p>
          </AnimatePresence>

          {/* Bottom bar */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              background: t.trackColor,
            }}
          >
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={RING_TRANSITION}
              style={{
                height: "100%",
                background: t.barGrad,
                boxShadow: `0 0 10px ${t.primaryGlow}`,
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
