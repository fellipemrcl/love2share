// Hook para gerenciar token com auto-refresh
import { useAuth } from '@clerk/nextjs';
import { useState, useEffect, useCallback } from 'react';

export function useAutoRefreshToken() {
  const { getToken, isSignedIn } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshToken = useCallback(async () => {
    if (!isSignedIn) {
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const newToken = await getToken();
      setToken(newToken);
      console.log('Token refreshed:', newToken?.substring(0, 20) + '...');
    } catch (error) {
      console.error('Error refreshing token:', error);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [getToken, isSignedIn]);

  // Refresh token on mount and periodically
  useEffect(() => {
    refreshToken();

    // Refresh every 30 minutes
    const interval = setInterval(refreshToken, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshToken]);

  return {
    token,
    isLoading,
    refreshToken,
  };
}

// Componente para obter token facilmente
export function TokenDisplay() {
  const { token, isLoading, refreshToken } = useAutoRefreshToken();

  if (isLoading) return <div>Carregando token...</div>;

  return (
    <div style={{ 
      background: '#f5f5f5', 
      padding: '10px', 
      margin: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <h4>Token atual:</h4>
      <textarea
        readOnly
        value={token || 'Não logado'}
        style={{ width: '100%', height: '60px' }}
      />
      <button onClick={refreshToken} style={{ marginTop: '5px' }}>
        Refresh Token
      </button>
      <p>
        <small>
          Use este token no Insomnia (copie e cole no campo clerk_token)
        </small>
      </p>
    </div>
  );
}
