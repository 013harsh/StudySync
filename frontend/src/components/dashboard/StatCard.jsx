/* StatCard — uses DaisyUI semantic tokens, winter-theme safe */
const STYLES = {
  primary: "bg-primary/10 border-primary/20 [&_p.val]:text-primary",
  secondary: "bg-secondary/10 border-secondary/20 [&_p.val]:text-secondary",
  accent: "bg-accent/10 border-accent/20 [&_p.val]:text-accent",
};

const VALUE_CLS = {
  primary: "text-primary",
  secondary: "text-secondary",
  accent: "text-accent",
};

const StatCard = ({ icon, label, value, sub, color = "primary" }) => (
  <div
    className={`rounded-2xl border ${STYLES[color]} shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-1`}
  >
    <div className="text-4xl mb-1">{icon}</div>
    <p className="text-xs font-bold uppercase tracking-widest text-base-content/40">
      {label}
    </p>
    <p className={`text-5xl font-black ${VALUE_CLS[color]}`}>{value}</p>
    {sub && <p className="text-sm text-base-content/50 mt-1">{sub}</p>}
  </div>
);

export default StatCard;
