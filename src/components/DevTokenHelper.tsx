// Componente para desenvolvimento - adicione temporariamente em alguma página
'use client';

import { useAuth } from '@clerk/nextjs';
import { useState } from 'react';

export function DevTokenHelper() {
  const { getToken, isSignedIn } = useAuth();
  const [currentToken, setCurrentToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGetToken = async () => {
    if (!isSignedIn) {
      alert('Você precisa estar logado');
      return;
    }

    setIsLoading(true);
    try {
      const token = await getToken();
      setCurrentToken(token || '');
      
      // Auto-copy to clipboard
      if (token) {
        await navigator.clipboard.writeText(token);
        alert('Token copiado para a área de transferência!');
      }
    } catch (error) {
      console.error('Erro ao obter token:', error);
      alert('Erro ao obter token');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (currentToken) {
      await navigator.clipboard.writeText(currentToken);
      alert('Token copiado!');
    }
  };

  if (!isSignedIn) {
    return (
      <div style={{ 
        background: '#ffebee', 
        border: '1px solid #f44336',
        padding: '10px', 
        borderRadius: '5px',
        margin: '10px 0'
      }}>
        <p>❌ Você precisa estar logado para obter o token</p>
      </div>
    );
  }

  return (
    <div style={{ 
      background: '#e8f5e8', 
      border: '1px solid #4caf50',
      padding: '15px', 
      borderRadius: '5px',
      margin: '10px 0',
      fontFamily: 'system-ui'
    }}>
      <h3>🔧 Dev Tool - Token Helper</h3>
      
      <button 
        onClick={handleGetToken}
        disabled={isLoading}
        style={{
          background: '#4caf50',
          color: 'white',
          border: 'none',
          padding: '10px 15px',
          borderRadius: '5px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          marginBottom: '10px'
        }}
      >
        {isLoading ? 'Obtendo...' : '🔄 Obter Token Novo'}
      </button>

      {currentToken && (
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Token atual (clique para copiar):
          </label>
          <textarea
            readOnly
            value={currentToken}
            onClick={copyToClipboard}
            style={{
              width: '100%',
              height: '80px',
              fontFamily: 'monospace',
              fontSize: '11px',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          />
          <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>
            💡 Cole este token no campo <code>clerk_token</code> do Insomnia (sem &quot;Bearer &quot;)
          </p>
        </div>
      )}
    </div>
  );
}
