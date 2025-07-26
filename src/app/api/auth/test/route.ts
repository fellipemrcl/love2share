import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// Endpoint para testar autenticação
export async function GET(req: NextRequest) {
  try {
    console.log("=== DEBUG AUTH ===");
    
    // Verificar headers
    const authHeader = req.headers.get("authorization");
    console.log("Authorization header:", authHeader);
    
    // Verificar todas as variáveis de ambiente do Clerk
    console.log("CLERK_SECRET_KEY exists:", !!process.env.CLERK_SECRET_KEY);
    console.log("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY exists:", !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
    console.log("CLERK_SECRET_KEY starts with:", process.env.CLERK_SECRET_KEY?.substring(0, 10));
    
    // Tentar extrair o token manualmente
    let token = null;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
      console.log("Token extracted:", token.substring(0, 20) + "...");
    }
    
    // Tentar autenticar
    const authResult = await auth();
    console.log("Auth result:", authResult);
    
    const { userId, sessionId, orgId } = authResult;
    
    // Se não funcionou, tentar debug adicional
    if (!userId && token) {
      console.log("Token details:");
      try {
        // Decodificar header do JWT
        const header = JSON.parse(atob(token.split('.')[0]));
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        console.log("JWT header:", header);
        console.log("JWT payload sub:", payload.sub);
        console.log("JWT payload iss:", payload.iss);
        console.log("JWT payload exp:", new Date(payload.exp * 1000));
        console.log("JWT current time:", new Date());
        
        return NextResponse.json({
          success: false,
          userId,
          sessionId,
          orgId,
          hasAuthHeader: !!authHeader,
          authHeader: authHeader ? authHeader.substring(0, 30) + "..." : null,
          tokenDetails: {
            header,
            subject: payload.sub,
            issuer: payload.iss,
            expiresAt: new Date(payload.exp * 1000),
            isExpired: payload.exp * 1000 < Date.now(),
          },
          timestamp: new Date().toISOString(),
        });
      } catch (decodeError) {
        console.log("Error decoding token:", decodeError);
      }
    }
    
    return NextResponse.json({
      success: !!userId,
      userId,
      sessionId,
      orgId,
      hasAuthHeader: !!authHeader,
      authHeader: authHeader ? authHeader.substring(0, 30) + "..." : null,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { 
        error: "Erro na autenticação",
        details: error instanceof Error ? error.message : "Erro desconhecido",
        stack: error instanceof Error ? error.stack : null,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
