import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import Particles from "react-tsparticles";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <App />
          <Particles />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
