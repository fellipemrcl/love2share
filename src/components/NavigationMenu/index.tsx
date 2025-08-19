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
    <NavigationMenu viewport={false} className="z-50">
      <NavigationMenuList className="gap-1">
        <NavigationMenuItem>
          <NavigationMenuLink
            asChild
            className={navigationMenuTriggerStyle()}
          >
            <Link href="/" className="font-medium">Página inicial</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="font-medium">Grupos</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[450px] gap-3 p-6">
              <li>
                <NavigationMenuLink asChild>
                  <Link href="/groups/find" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
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
                  <Link href="/groups/my" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
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
                  <Link href="/invites" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    <div className="text-sm font-medium leading-none flex items-center gap-2">
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
                  <Link href="/groups/access-data" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    <div className="text-sm font-medium leading-none flex items-center gap-2">
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
          <NavigationMenuTrigger className="font-medium">Financeiro</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[450px] gap-3 p-6">
              <li>
                <NavigationMenuLink asChild>
                  <Link href="/credits" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    <div className="text-sm font-medium leading-none">
                      Comprar Créditos
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Adicione créditos à sua conta para usar na plataforma
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link href="/credits/history" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    <div className="text-sm font-medium leading-none">
                      Histórico de Créditos
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Visualize suas transações e pagamentos
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link href="/savings" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    <div className="text-sm font-medium leading-none">
                      Minhas Economias
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Veja quanto você está economizando com os compartilhamentos
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
            <Link href="/help" className="font-medium">Ajuda</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default MainNavigationMenu;
