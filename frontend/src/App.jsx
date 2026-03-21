import Footer from "./components/Footer";
import NavBar from "./components/NavBar";
import Routes from "./Routes/Routes";
import ErrorBoundary from "./components/ErrorBoundary";
import { useTheme } from "./context/ThemeContext";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { usercurrent } from "./store/action/auth.action";

export const App = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(usercurrent());
  }, []);
  return (
    <ErrorBoundary>
      <div
        className="min-h-screen overflow-x-hidden bg-base-100 text-base-content"
        data-theme={theme}
      >
        <NavBar />
        <Routes />
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default App;
