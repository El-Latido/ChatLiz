import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { UserObj } from '../types';

interface LoginProps {
  user: UserObj & { password?: string };
  setUser: React.Dispatch<React.SetStateAction<UserObj & { password?: string, securityEmail?: string }>>;
  handleLogin: (e?: React.FormEvent) => void;
  handleGoogleLogin?: () => void;
  setRecoveryModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Login({ user, setUser, handleLogin, setRecoveryModalOpen, handleGoogleLogin }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <style>{`
        .login-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: #050508;
          background-image: 
            radial-gradient(circle at center, #131720 0%, #050508 100%),
            url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.83v58.34l-.83.83H5.373l-.83-.83V.83l.83-.83h49.254zM53.5 2.5h-47v55h47v-55zM27 27h6v6h-6v-6zm-4-4h14v14H23V23zm-6-6h26v26H17V17z' fill='rgba(255,255,255,0.03)' fill-rule='evenodd'/%3E%3C/svg%3E");
          font-family: system-ui, -apple-system, sans-serif;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 50;
        }

        .login-titles {
          text-align: center;
          margin-bottom: 1.5rem;
          z-index: 10;
        }

        .login-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: transparent;
          background-clip: text;
          -webkit-background-clip: text;
          background-image: linear-gradient(to right, #22d3ee, #99f6e4);
          margin-bottom: 0.5rem;
          text-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
        }

        .login-subtitle {
          color: #d1d5db;
          font-size: 0.875rem;
          font-weight: 500;
          letter-spacing: 0.025em;
        }

        .login-panel-wrapper {
          position: relative;
          width: 100%;
          max-width: 420px;
          padding: 0 1.25rem;
          box-sizing: border-box;
          z-index: 10;
        }

        .login-panel-border {
          position: relative;
          padding: 2px;
          border-radius: 24px;
          background: linear-gradient(to right, #22d3ee, #a855f7, #d946ef);
          box-shadow: 0 0 25px rgba(34, 211, 238, 0.5), 0 0 40px rgba(217, 70, 239, 0.3);
        }

        .login-panel-inner {
          position: relative;
          overflow: hidden;
          background-color: rgba(13, 17, 26, 0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 22px;
          padding: 2.5rem 2rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .corner-tl, .corner-tr, .corner-bl, .corner-br {
          position: absolute;
          width: 3rem;
          height: 3rem;
          pointer-events: none;
          opacity: 0.8;
        }

        .corner-tl { top: 0; left: 0; border-top: 2px solid #22d3ee; border-left: 2px solid #22d3ee; border-top-left-radius: 22px; box-shadow: inset 2px 2px 8px rgba(34, 211, 238, 0.3); }
        .corner-tr { top: 0; right: 0; border-top: 2px solid #d946ef; border-right: 2px solid #d946ef; border-top-right-radius: 22px; box-shadow: inset -2px 2px 8px rgba(217, 70, 239, 0.3); }
        .corner-bl { bottom: 0; left: 0; border-bottom: 2px solid #22d3ee; border-left: 2px solid #22d3ee; border-bottom-left-radius: 22px; box-shadow: inset 2px -2px 8px rgba(34, 211, 238, 0.3); }
        .corner-br { bottom: 0; right: 0; border-bottom: 2px solid #d946ef; border-right: 2px solid #d946ef; border-bottom-right-radius: 22px; box-shadow: inset -2px -2px 8px rgba(217, 70, 239, 0.3); }

        .input-group {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          pointer-events: none;
          transition: color 0.3s;
        }
        
        .icon-cyan { color: #22d3ee; }
        .icon-magenta { color: #e879f9; }
        .input-group:focus-within .icon-cyan { color: #67e8f9; }
        .input-group:focus-within .icon-magenta { color: #f0abfc; }

        .login-input {
          width: 100%;
          box-sizing: border-box;
          background-color: rgba(19, 23, 34, 0.8);
          padding: 0.875rem 1rem 0.875rem 3rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          outline: none;
          color: #ffffff;
          font-size: 0.9375rem;
          box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.5);
          transition: all 0.3s;
          font-weight: 500;
          letter-spacing: 0.025em;
        }
        
        .login-input::placeholder { color: #6b7280; }

        .input-cyan { border-color: rgba(34, 211, 238, 0.3); }
        .input-magenta { border-color: rgba(217, 70, 239, 0.3); padding-right: 3rem; }

        .input-cyan:focus { border-color: #22d3ee; box-shadow: 0 0 15px rgba(34, 211, 238, 0.2), inset 0 2px 10px rgba(0, 0, 0, 0.5); }
        .input-magenta:focus { border-color: #d946ef; box-shadow: 0 0 15px rgba(217, 70, 239, 0.2), inset 0 2px 10px rgba(0, 0, 0, 0.5); }

        .btn-eye {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          transition: color 0.3s;
          padding: 0;
          display: flex;
        }
        .btn-eye:hover { color: #ffffff; }

        .btn-submit {
          position: relative;
          width: 100%;
          padding: 0.875rem;
          margin-top: 0.5rem;
          color: #ffffff;
          font-weight: 700;
          font-size: 0.9375rem;
          letter-spacing: 0.05em;
          border-radius: 0.5rem;
          background: linear-gradient(to right, #22d3ee, #d946ef);
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.4);
          border: none;
          cursor: pointer;
          overflow: hidden;
          transition: box-shadow 0.3s;
        }
        .btn-submit:hover {
          box-shadow: 0 0 30px rgba(217, 70, 239, 0.6);
        }
        .btn-submit span {
          position: relative;
          z-index: 10;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        .btn-submit::after {
          content: '';
          position: absolute;
          inset: 0;
          background-color: rgba(255, 255, 255, 0.2);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .btn-submit:hover::after {
          opacity: 1;
        }

        .links-container {
          margin-top: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          z-index: 10;
        }

        .link-btn {
          background: none;
          border: none;
          font-size: 0.875rem;
          font-weight: 500;
          letter-spacing: 0.025em;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
        }
        .link-cyan { color: #67e8f9; }
        .link-cyan:hover { color: #a5f3fc; text-decoration: underline; text-underline-offset: 4px; }
        .link-magenta { color: #f0abfc; }
        .link-magenta:hover { color: #e879f9; text-decoration: underline; text-underline-offset: 4px; }
        .btn-google {
          position: relative;
          width: 100%;
          padding: 0.875rem;
          margin-top: 1rem;
          color: #ffffff;
          font-weight: 600;
          font-size: 0.9375rem;
          border-radius: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }
        .btn-google:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.4);
        }

      `}</style>

      <div className="login-container">
        {/* Títulos sobre el panel */}
        <div className="login-titles">
           <h1 className="login-title">¡Bienvenido a ChatLiz!</h1>
           <p className="login-subtitle">Inicia sesión o regístrate para continuar.</p>
        </div>

        <div className="login-panel-wrapper">
          {/* Panel Central de Vidrio con Brillo Neón */}
          <div className="login-panel-border">
             <div className="login-panel-inner">
                
                {/* Esquinas decorativas futuristas */}
                <div className="corner-tl"></div>
                <div className="corner-tr"></div>
                <div className="corner-bl"></div>
                <div className="corner-br"></div>

                <div style={{ position: 'relative', zIndex: 10 }}>
                   {/* Input: Nombre de Usuario */}
                   <div className="input-group">
                     <div className="input-icon icon-cyan">
                        <User size={18} strokeWidth={2.5} />
                     </div>
                     <input 
                       className="login-input input-cyan"
                       placeholder="Nombre de Usuario..." 
                       value={user.username}
                       onChange={e => setUser({...user, username: e.target.value})} 
                     />
                   </div>

                   
                   {/* Input: Email */}
                   <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                     <div className="input-icon" style={{ color: '#fbbf24' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                     </div>
                     <input 
                       className="login-input" style={{ borderColor: 'rgba(251, 191, 36, 0.3)' }}
                       type="email" 
                       placeholder="Email (Recuperación)..." 
                       value={user.securityEmail || ''}
                       onChange={e => setUser({...user, securityEmail: e.target.value})} 
                       onKeyDown={e => e.key === 'Enter' && handleLogin()}
                     />
                   </div>

                   {/* Input: Contraseña */}
                   <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                     <div className="input-icon icon-magenta">
                        <Lock size={18} strokeWidth={2.5} />
                     </div>
                     <input 
                       className="login-input input-magenta"
                       type={showPassword ? "text" : "password"} 
                       placeholder="Contraseña..." 
                       value={user.password}
                       onChange={e => setUser({...user, password: e.target.value})} 
                       onKeyDown={e => e.key === 'Enter' && handleLogin()}
                     />
                     <button 
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="btn-eye"
                     >
                       {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                     </button>
                   </div>

                   {/* Botón ENTRAR AL CHAT */}
                   
                   {/* Botón ENTRAR AL CHAT */}
                   <button 
                     onClick={handleLogin}
                     className="btn-submit"
                   >
                      <span>ENTRAR AL CHAT</span>
                   </button>
                   
                   <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ height: '1px', flex: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                      <span style={{ margin: '0 10px', color: '#9ca3af', fontSize: '0.8rem' }}>O INTENTA CON</span>
                      <div style={{ height: '1px', flex: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                   </div>

                   <button 
                     type="button"
                     onClick={handleGoogleLogin}
                     className="btn-google"
                   >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" style={{ marginRight: '8px' }}>
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                      </svg>
                      <span>Iniciar sesión con Google</span>
                   </button>

                </div>
             </div>
          </div>
        </div>

        {/* Enlaces centrados debajo del panel */}
        <div className="links-container">
           <button 
              onClick={handleLogin}
              className="link-btn link-cyan"
           >
              Crear nueva cuenta
           </button>
           <button 
              onClick={(e) => { e.preventDefault(); setRecoveryModalOpen(true); }} 
              className="link-btn link-magenta"
           >
              ¿Olvidaste tu contraseña?
           </button>
        </div>
      </div>
    </>
  );
}
