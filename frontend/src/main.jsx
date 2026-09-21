import {} from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import Particles from "react-tsparticles";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <ThemeProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <App />
          <Particles />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ThemeProvider>
  </Provider>,
);
