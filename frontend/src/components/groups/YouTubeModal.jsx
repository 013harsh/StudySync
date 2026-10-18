import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const STUDY_PRESETS = [
  {
    id: "jfKfPfyJRdk",
    title: "Lofi Study Beats",
    tag: "Relax & Focus",
    icon: "🎧",
  },
  {
    id: "4xDzrJKXOOY",
    title: "Deep Focus Ambient",
    tag: "Alpha Waves",
    icon: "🌲",
  },
  {
    id: "WPni755-Krg",
    title: "Pomodoro Session (50/10)",
    tag: "Productivity",
    icon: "⏱️",
  },
  {
    id: "zJSY8tbf_ys",
    title: "Web Dev Full Course",
    tag: "Coding Tutorial",
    icon: "💻",
  },
];

// Helper to extract video ID from common YouTube URL formats
const extractYouTubeId = (url) => {
  if (!url) return null;
  const trimmed = url.trim();
  // If user pasted just an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const YouTubeModal = ({ modalId = "youtube_study_modal" }) => {
  const dialogRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [urlInput, setUrlInput] = useState("");
  const [currentVideoId, setCurrentVideoId] = useState("jfKfPfyJRdk");
  const [activePreset, setActivePreset] = useState("jfKfPfyJRdk");
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const open = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setError(null);
    dialogRef.current?.showModal();
  };

  const close = () => {
    dialogRef.current?.close();
  };

  const handleLoadUrl = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const id = extractYouTubeId(urlInput);
    if (id) {
      setCurrentVideoId(id);
      setActivePreset(id);
      setError(null);
      setUrlInput("");
    } else {
      setError("Please enter a valid YouTube video URL or ID");
    }
  };

  const handleSelectPreset = (preset) => {
    setCurrentVideoId(preset.id);
    setActivePreset(preset.id);
    setError(null);
  };

  const handleCopyLink = () => {
    const url = `https://www.youtube.com/watch?v=${currentVideoId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Trigger Button inside Action Card */}
      <button
        onClick={open}
        className="w-full h-10 min-h-0 text-sm font-bold text-white transition-all bg-red-600 border-none shadow-md btn hover:bg-red-700 shadow-red-500/20 rounded-xl"
      >
        → Watch Together
      </button>

      {/* Dialog Modal */}
      <dialog
        ref={dialogRef}
        id={modalId}
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="w-full max-w-2xl p-0 overflow-hidden border shadow-2xl modal-box rounded-2xl bg-base-100 border-base-300">
          {/* Header */}
          <div className="relative px-6 pt-6 pb-5 text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700">
            <button
              onClick={close}
              className="absolute top-4 right-4 btn btn-circle btn-xs btn-ghost text-white/80 hover:text-white"
            >
              ✕
            </button>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 text-white shadow-inner rounded-xl bg-white/20">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-black">YouTube Study Stream</h3>
                <p className="text-xs text-white/80">
                  Play tutorials, lectures, or focus beats for your study
                  session
                </p>
              </div>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-5">
            {/* Embedded Player */}
            <div className="overflow-hidden bg-black border shadow-lg rounded-xl aspect-video border-base-300">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${currentVideoId}?autoplay=0&rel=0`}
                title="YouTube study stream"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* URL Input Form */}
            <form onSubmit={handleLoadUrl} className="flex gap-2">
              <input
                type="text"
                placeholder="Paste YouTube video or live URL (e.g., https://youtu.be/...)"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 text-xs input input-bordered input-sm sm:input-md rounded-xl sm:text-sm"
              />
              <button
                type="submit"
                className="font-semibold text-white bg-red-600 border-none btn btn-sm sm:btn-md hover:bg-red-700 rounded-xl"
              >
                Load Video
              </button>
            </form>

            {error && (
              <p className="text-xs font-semibold text-error">{error}</p>
            )}

            {/* Quick Presets */}
            <div>
              <p className="mb-2 text-xs font-bold tracking-wider uppercase text-base-content/50">
                Curated Study Streams
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {STUDY_PRESETS.map((preset) => {
                  const isActive = activePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`flex flex-col items-start p-2.5 text-left transition-all border rounded-xl text-xs ${
                        isActive
                          ? "border-red-500 bg-red-500/10 text-red-600 font-bold shadow-sm"
                          : "border-base-300 bg-base-200/50 hover:bg-base-200 text-base-content/80"
                      }`}
                    >
                      <span className="mb-1 text-base">{preset.icon}</span>
                      <span className="w-full font-semibold truncate">
                        {preset.title}
                      </span>
                      <span className="text-[10px] opacity-60">
                        {preset.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-base-300">
              <button
                type="button"
                onClick={handleCopyLink}
                className="btn btn-sm btn-outline gap-1.5 rounded-xl text-xs"
              >
                {copied ? "✓ Copied Link" : "📋 Copy Video Link"}
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    close();
                    navigate("/dashboard");
                  }}
                  className="text-xs btn btn-sm btn-primary rounded-xl"
                >
                  Go to Study Rooms →
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="text-xs btn btn-sm btn-ghost rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default YouTubeModal;
