/* QuickActions — DaisyUI btn classes only */
import { Link } from "react-router-dom";

const ACTIONS = [
  {
    label: "Create Study Group",
    icon: "📚",
    to: "/features",
    cls: "btn-primary",
  },
  {
    label: "Join with Code",
    icon: "🔑",
    to: "/features",
    cls: "btn-secondary",
  },
  {
    label: "Account Settings",
    icon: "⚙️",
    to: "/account",
    cls: "btn-ghost border border-base-300",
  },
];

const QuickActions = () => (
  <div className="flex flex-col gap-3 p-5 border shadow-sm rounded-2xl border-base-300 bg-base-100">
    <h3 className="text-lg font-black text-base-content">⚡ Quick Actions</h3>
    <div className="flex flex-col gap-2">
      {ACTIONS.map((a) => (
        <Link
          key={a.label}
          to={a.to}
          className={`btn btn-sm w-full justify-start gap-2 rounded-xl font-semibold ${a.cls}`}
        >
          <span>{a.icon}</span>
          <span>{a.label}</span>
        </Link>
      ))}
    </div>
  </div>
);

export default QuickActions;
