"use client";

import Link from "next/link";
import PendingInvitesBadge from "@/components/PendingInvitesBadge";
import PendingAccessDataBadge from "@/components/PendingAccessDataBadge";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const MainNavigationMenu = () => {
  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink
            asChild
            className={navigationMenuTriggerStyle()}
          >
            <Link href="/">Página inicial</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Grupos</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-2 p-4">
              <li>
                <NavigationMenuLink asChild>
                  <Link href="/groups/find">
                    <div className="text-sm font-medium leading-none">
                      Encontrar grupos
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Descubra grupos de compartilhamento próximos a você
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link href="/groups/my">
                    <div className="text-sm font-medium leading-none">
                      Meus grupos
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Gerencie suas assinaturas e compartilhamentos
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link href="/invites">
                    <div className="text-sm font-medium leading-none flex items-center">
                      Convites
                      <PendingInvitesBadge />
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Gerencie suas solicitações e convites de grupos
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link href="/groups/access-data">
                    <div className="text-sm font-medium leading-none flex items-center">
                      Dados de Acesso
                      <PendingAccessDataBadge />
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Confirme o recebimento dos dados de streaming
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            asChild
            className={navigationMenuTriggerStyle()}
          >
            <Link href="/savings">Minhas economias</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            asChild
            className={navigationMenuTriggerStyle()}
          >
            <Link href="/help">Ajuda</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default MainNavigationMenu;
