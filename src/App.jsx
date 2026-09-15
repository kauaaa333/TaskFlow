import { useState, useEffect } from "react";
import Sidebar from "./componentes/sidebar";
import AppRoutes from "./routes/AppRoutes";
import ShaderBackground from "./componentes/ShaderBackground";
import { useAuth } from "./contexts/useAuth";
import "./App.css";

function App() {
  const [theme, setTheme] = useState("light");
  const { token } = useAuth();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleF11 = (e) => {
      if (e.key === "F11") {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }
    };

    window.addEventListener("keydown", handleF11);
    return () => window.removeEventListener("keydown", handleF11);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="app-layout">
      <ShaderBackground theme={theme} />
      {token && <Sidebar />}
      <main
        className="app-conteudo"
        style={{ marginLeft: token ? "220px" : "0" }}
      >
        <AppRoutes
          theme={theme}
          toggleTheme={toggleTheme}
        />
      </main>
    </div>
  );
}

export default App;
