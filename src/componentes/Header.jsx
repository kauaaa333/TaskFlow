import { useState, useEffect } from 'react';
import styles from './Header.module.css';

function Header({ titulo, subtitulo = "Informe o subtítulo", total, pendentes, emAndamento, concluidas, theme, onToggleTheme }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.logo}>
            <h1>{titulo}</h1>
            <p>{subtitulo}</p>            
          </div>

          <div className={styles.controls}>
            <div id="contadores">
              <div className="contadores-status">
                <span id="cont-pendentes">{pendentes} {pendentes === 1 ? 'tarefa pendente' : 'tarefas pendentes'}</span>
                <span className="separador" aria-hidden="true">·</span>
                <span id="cont-andamento">{emAndamento} {emAndamento === 1 ? 'tarefa' : 'tarefas'} em andamento</span>
                <span className="separador" aria-hidden="true">·</span>
                <span id="cont-concluidas">{concluidas} {concluidas === 1 ? 'tarefa concluída' : 'tarefas concluídas'}</span>
              </div>
              <span id="cont-total">Total: {total} {total === 1 ? 'tarefa' : 'tarefas'}</span>
            </div>
            
            <button 
              onClick={toggleFullscreen} 
              className={styles.themeToggle}
              title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
            >
              {isFullscreen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/>
                  <path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8V5a2 2 0 0 1 2-2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/>
                  <path d="M21 16v3a2 2 0 0 1-2 2h-3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/>
                </svg>
              )}
            </button>
            <button 
              onClick={onToggleTheme} 
              className={styles.themeToggle}
              title={`Mudar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
            >
              {theme === 'light' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>
  );
}

export default Header;
