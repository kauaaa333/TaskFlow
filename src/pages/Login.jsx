import './Login.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import api from '../api';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (event) => {
    event.preventDefault();
    setErro('');

    try {
      const resposta = await api.post('/auth/login', { email, senha });
      const { token, usuario } = resposta.data;

      login(usuario, token);
      navigate('/', { replace: true });
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao fazer login');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="login-container">
      <form className={`login-card ${shake ? 'shake' : ''}`} onSubmit={handleLogin}>
        <h1 className="login-logo">TaskFlow</h1>
        <p className="login-subtitulo">Faça login para continuar</p>

        <input
          className="login-input"
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="username"
        />
        <input
          className="login-input"
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
          autoComplete="current-password"
        />

        {erro && <p className="login-erro" role="alert">{erro}</p>}

        <button className="login-btn" type="submit">Entrar</button>
        <p className="login-aviso">Login didático: use alice@email.com / 123456.</p>
      </form>
    </div>
  );
}

export default Login;
