import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const NavBar = () => {
  const { theme, setTheme } = useTheme();

  // Toggle between forest & winter
  const toggleTheme = () => {
    setTheme(theme === "winter" ? "forest" : "winter");
  };

  return (
    <div className="py-2 border-b shadow-xl px-9 navbar bg-base-100 border-base-200">
      <div className="flex-1">
        <Link
          to="/"
          className="text-xl font-bold normal-case btn btn-ghost text-primary"
        >
          StudySync
        </Link>
      </div>

      <div className="flex items-center flex-none gap-2 ml-4">
        {/* Theme Toggle */}
        <div className="flex items-center gap-2 mr-4">
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-circle text-base-content"
            title={`Switch to ${theme === "winter" ? "forest" : "winter"} theme`}
          >
            {theme === "winter" ? (
              // Moon Icon
              <svg
                className="w-6 h-6 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Z" />
              </svg>
            ) : (
              // Sun Icon
              <svg
                className="w-6 h-6 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M12 6.5A5.5 5.5 0 1017.5 12 5.51 5.51 0 0012 6.5zM12 15.5A3.5 3.5 0 1115.5 12 3.5 3.5 0 0112 15.5z" />
              </svg>
            )}
          </button>
        </div>

        {/* User Dropdown */}
        <div className="dropdown dropdown-end">
          <label
            tabIndex={0}
            className="btn btn-ghost btn-circle avatar text-base-content"
          >
            <div className="w-10 border-2 rounded-full border-primary/50 hover:border-primary">
              <img
                src="https://ui-avatars.com/api/?name=John+Doe&background=random"
                alt="User Avatar"
              />
            </div>
          </label>

          <ul
            tabIndex={0}
            className="mt-3 z-[100] p-2 shadow-2xl menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-200"
          >
            <li className="px-4 py-2 mb-2 border-b menu-title border-base-200">
              <span className="font-semibold">John Doe</span>
              <span className="text-xs text-base-content/60">
                john@example.com
              </span>
            </li>

            <li>
              <Link to="/account">Account Settings</Link>
            </li>

            <li>
              <Link to="/dashboard">My Dashboard</Link>
            </li>

            <div className="my-0 divider"></div>

            <li>
              <Link to="/login" className="text-error hover:bg-error/10">
                Logout
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
