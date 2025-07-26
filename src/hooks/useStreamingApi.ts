import { useState, useCallback } from "react";
import {
  CreateStreamingRequest,
  UpdateStreamingRequest,
  StreamingResponse,
  StreamingWithCount,
  StreamingWithDetails,
} from "@/types/streaming";

export function useStreamingApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiCall = useCallback(async <T>(
    apiCall: () => Promise<Response>
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiCall();
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro na requisição");
      }

      return data as T;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listar todos os streamings
  const getStreamings = useCallback(async (): Promise<StreamingWithCount[] | null> => {
    return handleApiCall(async () => {
      return fetch("/api/streaming", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
    });
  }, [handleApiCall]);

  // Buscar um streaming específico
  const getStreaming = useCallback(async (id: string): Promise<StreamingWithDetails | null> => {
    return handleApiCall(async () => {
      return fetch(`/api/streaming/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
    });
  }, [handleApiCall]);

  // Criar um novo streaming
  const createStreaming = useCallback(async (
    data: CreateStreamingRequest
  ): Promise<StreamingResponse | null> => {
    return handleApiCall(async () => {
      return fetch("/api/streaming", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    });
  }, [handleApiCall]);

  // Atualizar um streaming
  const updateStreaming = useCallback(async (
    id: string,
    data: UpdateStreamingRequest
  ): Promise<StreamingResponse | null> => {
    return handleApiCall(async () => {
      return fetch(`/api/streaming/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    });
  }, [handleApiCall]);

  // Deletar um streaming
  const deleteStreaming = useCallback(async (id: string): Promise<{ message: string } | null> => {
    return handleApiCall(async () => {
      return fetch(`/api/streaming/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
    });
  }, [handleApiCall]);

  return {
    // Estados
    isLoading,
    error,
    
    // Métodos
    getStreamings,
    getStreaming,
    createStreaming,
    updateStreaming,
    deleteStreaming,
    
    // Utilitários
    clearError: () => setError(null),
  };
}
