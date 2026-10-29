import './Login.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import api, { mensagensDeErro } from '../api';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [shake, setShake] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (event) => {
    event.preventDefault();
    if (enviando) return;
    setErro('');
    setEnviando(true);

    try {
      const resposta = await api.post('/auth/login', { email, senha });
      const { token, usuario } = resposta.data;

      login(usuario, token);
      navigate('/', { replace: true });
    } catch (err) {
      setErro(mensagensDeErro(err).join(' '));
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setEnviando(false);
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
          required
          aria-label="E-mail"
        />
        <input
          className="login-input"
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
          autoComplete="current-password"
          required
          aria-label="Senha"
        />

        {erro && <p className="login-erro" role="alert">{erro}</p>}

        <button className="login-btn" type="submit" disabled={enviando}>{enviando ? 'Entrando...' : 'Entrar'}</button>
        <p className="login-aviso">Use sua conta cadastrada. Para solicitar acesso, procure o administrador.</p>
      </form>
    </div>
  );
}

export default Login;
