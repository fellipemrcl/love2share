// Tipos para os endpoints de Streaming

export interface CreateStreamingRequest {
  name: string;
  description?: string;
  platform: string;
  logoUrl?: string;
  websiteUrl?: string;
  monthlyPrice?: number;
  maxUsers?: number;
  maxSimultaneousScreens?: number;
  isActive?: boolean;
}

export interface UpdateStreamingRequest {
  name?: string;
  description?: string;
  platform?: string;
  logoUrl?: string;
  websiteUrl?: string;
  monthlyPrice?: number;
  maxUsers?: number;
  maxSimultaneousScreens?: number;
  isActive?: boolean;
}

// Enum de roles para grupos de streaming
export enum StreamingGroupRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

// Tipos para usuários
export interface UserResponse {
  id: string;
  name: string | null;
  email: string;
}

// Tipos para grupos de streaming
export interface StreamingGroupUserResponse {
  id: string;
  userId: string;
  role: StreamingGroupRole;
  user: UserResponse;
  createdAt: Date;
  updatedAt: Date;
}

export interface StreamingGroupResponse {
  id: string;
  name: string;
  description: string | null;
  maxMembers: number;
  createdById: string;
  createdBy: UserResponse;
  createdAt: Date;
  updatedAt: Date;
  streamingGroupUsers: StreamingGroupUserResponse[];
  userRole?: StreamingGroupRole;
  isOwner?: boolean;
  isAdmin?: boolean;
  _count?: {
    streamingGroupUsers: number;
    streamingGroupStreamings: number;
  };
}

export interface StreamingResponse {
  id: string;
  name: string;
  description: string | null;
  platform: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  monthlyPrice: number | null;
  maxUsers: number;
  maxSimultaneousScreens: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Interface extendida com cálculos de preço (calculados dinamicamente)
export interface StreamingWithPricing extends StreamingResponse {
  pricePerScreen: number | null;
  isValidPricing: boolean;
}

export interface StreamingWithCount extends StreamingResponse {
  _count: {
    streamingGroupStreamings: number;
  };
}

export interface StreamingWithDetails extends StreamingResponse {
  streamingGroupStreamings: Array<{
    id: string;
    streamingGroup: {
      id: string;
      name: string;
    };
  }>;
  _count: {
    streamingGroupStreamings: number;
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: Record<string, unknown>;
  message?: string;
}

// Constantes para plataformas populares
export const STREAMING_PLATFORMS = [
  "Netflix",
  "Disney+",
  "Prime Video",
  "HBO Max",
  "Paramount+",
  "Apple TV+",
  "Hulu",
  "Peacock",
  "Discovery+",
  "Crunchyroll",
  "YouTube Premium",
  "Spotify",
  "Outro",
] as const;

export type StreamingPlatform = typeof STREAMING_PLATFORMS[number];
