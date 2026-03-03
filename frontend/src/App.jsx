import Footer from "./components/Footer";
import NavBar from "./components/NavBar";
import Routes from "./Routes/Routes";
import { useTheme } from "./context/ThemeContext";

export const App = () => {
  const { theme } = useTheme();

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-base-100 text-base-content"
      data-theme={theme}
    >
      <NavBar />
      <Routes />
      <Footer />
    </div>
  );
};

export default App;
