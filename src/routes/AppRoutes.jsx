import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Sobre from '../pages/Sobre';
import Login from '../pages/Login';
import RotaPrivada from '../componentes/RotaPrivada';

function AppRoutes({ theme, toggleTheme }) {
  return (
    <Routes>
      <Route
        path='/'
        element={
          <RotaPrivada>
            <Dashboard theme={theme} onToggleTheme={toggleTheme} />
          </RotaPrivada>
        }
      />
      <Route path='/visitante' element={<Dashboard key="visitante" visitante theme={theme} onToggleTheme={toggleTheme} />} />
      <Route path='/sobre' element={<Sobre />} />
      <Route path='/login' element={<Login />} />
    </Routes>
  );
}

export default AppRoutes;
