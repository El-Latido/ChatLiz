import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { UserObj } from '../types';

interface LoginProps {
  user: UserObj & { password?: string };
  setUser: React.Dispatch<React.SetStateAction<UserObj & { password?: string, securityEmail?: string }>>;
  handleLogin: (e?: React.FormEvent) => void;
  setRecoveryModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Login({ user, setUser, handleLogin, setRecoveryModalOpen }: LoginProps) {
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
                   <button 
                     onClick={handleLogin}
                     className="btn-submit"
                   >
                      <span>ENTRAR AL CHAT</span>
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
