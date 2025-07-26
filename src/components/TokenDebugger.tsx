// Adicione isso ao DevTokenHelper para debug detalhado
'use client';

import { useAuth } from '@clerk/nextjs';

export function TokenDebugger() {
  const { getToken, isSignedIn } = useAuth();

  const analyzeToken = async () => {
    if (!isSignedIn) return;

    try {
      const token = await getToken();
      if (!token) return;

      // Decodificar o token
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const now = Date.now();
      const exp = payload.exp * 1000;
      const iat = payload.iat * 1000;
      
      console.log('=== TOKEN ANALYSIS ===');
      console.log('Criado em:', new Date(iat).toLocaleString());
      console.log('Expira em:', new Date(exp).toLocaleString());
      console.log('Hora atual:', new Date(now).toLocaleString());
      console.log('Tempo restante:', Math.round((exp - now) / 1000), 'segundos');
      console.log('Duração total:', Math.round((exp - iat) / 1000), 'segundos');
      console.log('Status:', now > exp ? '❌ EXPIRADO' : '✅ VÁLIDO');
      console.log('Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
      console.log('Offset:', new Date().getTimezoneOffset(), 'minutos');
      console.log('Issuer:', payload.iss);
      
      // Alerta visual
      const timeLeft = Math.round((exp - now) / 1000);
      if (timeLeft < 60) {
        alert(`⚠️ Token expira em ${timeLeft} segundos! 
        
Isso é muito rápido. Possíveis causas:
1. Relógio do sistema dessincronizado
2. Configuração do Clerk muito restritiva
3. Token sendo reutilizado

Verifique o console para detalhes.`);
      } else {
        alert(`✅ Token válido por ${Math.round(timeLeft / 60)} minutos`);
      }
      
    } catch (error) {
      console.error('Error analyzing token:', error);
    }
  };

  if (!isSignedIn) return null;

  return (
    <div style={{ 
      background: '#fff3e0', 
      border: '1px solid #ff9800',
      padding: '15px', 
      borderRadius: '5px',
      margin: '10px 0',
      fontFamily: 'system-ui'
    }}>
      <h4>🔍 Token Debugger</h4>
      
      <button 
        onClick={analyzeToken}
        style={{
          background: '#ff9800',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '3px',
          cursor: 'pointer',
          marginBottom: '10px'
        }}
      >
        Analisar Token
      </button>

      <p style={{ fontSize: '12px', margin: '5px 0' }}>
        Clique para analisar o token atual e ver detalhes no console
      </p>
    </div>
  );
}
