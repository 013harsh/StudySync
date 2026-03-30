import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "../context/ThemeContext";
import { userLogout } from "../store/action/auth.action";

const NavBar = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const firstName = user?.fullName?.firstName || "Guest";
  const lastName = user?.fullName?.lastName || "User";
  const email = user?.email || "guest@example.com";
  const isGuest = !user;

  const toggleTheme = () => {
    setTheme(theme === "winter" ? "forest" : "winter");
  };

  const handleLogout = async () => {
    dispatch(userLogout());
    navigate("/login");
  };

  return (
    <div className="p-5 border-b shadow-xl px-9 navbar bg-base-100 border-base-500">
      <div className="flex-1 bg">
        <button
          onClick={() => navigate("/home")}
          className="text-2xl font-bold normal-case text-primary"
        >
          StudySync
        </button>
      </div>

      <div className="flex items-center flex-none gap-6 ml-4">
        <div className="flex items-center gap-2 mr-4">
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-circle text-base-content"
            title={`Switch to ${theme === "winter" ? "forest" : "winter"} theme`}
          >
            {theme === "winter" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-[22px] h-[22px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-[22px] h-[22px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>
        </div>

        <div className="dropdown dropdown-end">
          <label
            tabIndex={0}
            className="btn btn-ghost btn-circle avatar text-base-content"
          >
            <div className="w-10 border-2 rounded-full border-primary/50">
              <img
                src={`https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`}
                alt="User Avatar"
              />
            </div>
          </label>

          <ul
            tabIndex={0}
            className="mt-3 z-[100] p-2 shadow-2xl menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-200"
          >
            <li className="px-4 py-2 mb-2 border-b menu-title border-base-200">
              <span className="font-semibold">
                {firstName} {lastName}
              </span>
              <span className="text-xs text-base-content/60">{email}</span>
            </li>

            <li>
              <button onClick={() => navigate("/account")}>
                Account Settings
              </button>
            </li>

            <li>
              <button onClick={() => navigate("/dashboard")}>
                My Dashboard
              </button>
            </li>

            {isGuest ? (
              <li>
                <button
                  onClick={() => navigate("/login")}
                  className="text-primary"
                >
                  Login
                </button>
              </li>
            ) : (
              <li>
                <button onClick={handleLogout} className="text-error">
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
