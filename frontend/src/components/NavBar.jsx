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
                className="swap-on h-7 w-7 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
              </svg>
            ) : (
              <svg
                className="swap-off h-7 w-7 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
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
