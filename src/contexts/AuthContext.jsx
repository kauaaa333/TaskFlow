import { useState } from 'react';
import AuthContext from './AuthContextBase';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [usuario, setUsuario] = useState(() => {
    try {
      return localStorage.getItem('token') ? JSON.parse(localStorage.getItem('usuario')) : null;
    } catch {
      return null;
    }
  });

  function login(dadosUsuario, tokenRecebido) {
    setUsuario(dadosUsuario);
    setToken(tokenRecebido);
    localStorage.setItem('token', tokenRecebido);
    localStorage.setItem('usuario', JSON.stringify(dadosUsuario));
  }

  function logout() {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  return (
    <AuthContext.Provider value={{ token, usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
