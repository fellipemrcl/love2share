"use client";

import { usePathname } from "next/navigation";

export const useNavigation = () => {
  const pathname = usePathname();

  const getBackButtonConfig = () => {
    // Configurações específicas para cada rota
    switch (pathname) {
      case "/groups/find":
        return {
          show: true,
          href: "/groups",
          label: "Voltar para Grupos"
        };
      case "/groups/my":
        return {
          show: true,
          href: "/groups", 
          label: "Voltar para Grupos"
        };
      case "/invites":
        return {
          show: true,
          href: "/",
          label: "Voltar ao Início"
        };
      case "/savings":
        return {
          show: true,
          href: "/",
          label: "Voltar ao Início"
        };
      case "/help":
        return {
          show: true,
          href: "/",
          label: "Voltar ao Início"
        };
      case "/admin":
        return {
          show: true,
          href: "/",
          label: "Voltar ao Início"
        };
      default:
        return {
          show: false,
          href: "/",
          label: "Voltar"
        };
    }
  };

  const getBreadcrumbItems = () => {
    const segments = pathname.split("/").filter(Boolean);
    
    const items = [];
    
    if (segments.includes("groups")) {
      items.push({ label: "Grupos", href: "/groups" });
      
      if (segments.includes("find")) {
        items.push({ label: "Encontrar" });
      } else if (segments.includes("my")) {
        items.push({ label: "Meus Grupos" });
      }
    } else if (pathname === "/invites") {
      items.push({ label: "Convites" });
    } else if (pathname === "/savings") {
      items.push({ label: "Economias" });
    } else if (pathname === "/help") {
      items.push({ label: "Ajuda" });
    } else if (pathname === "/admin") {
      items.push({ label: "Administração" });
    }
    
    return items;
  };

  return {
    pathname,
    getBackButtonConfig,
    getBreadcrumbItems
  };
};
