const fs = require('fs');

let content = fs.readFileSync('src/components/Login.tsx', 'utf8');

const emailInputHtml = `
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
`;

content = content.replace('{/* Input: Contraseña */}', emailInputHtml + '\n                   {/* Input: Contraseña */}');

fs.writeFileSync('src/components/Login.tsx', content);
