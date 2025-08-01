"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import MainNavigationMenu from "@/components/NavigationMenu";
import AuthButtons from "@/components/AuthButtons";
import { AdminButton } from "@/components/AdminButton";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import PendingInvitesBadge from "@/components/PendingInvitesBadge";
import PendingAccessDataBadge from "@/components/PendingAccessDataBadge";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closeSheet = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center px-4 lg:px-8">
        {/* Left Section - Logo + Navigation */}
        <div className="flex items-center gap-8 lg:gap-12">
          {/* Logo/Brand */}
          <Link href="/" className="text-xl font-bold hover:text-primary transition-colors duration-200">
            Love2Share
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex">
            <MainNavigationMenu />
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="ml-auto flex items-center gap-3 lg:gap-4">
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <AdminButton />
            <div className="h-6 w-px bg-border hidden lg:block" />
            <AuthButtons />
            <div className="h-6 w-px bg-border" />
            <ThemeToggle />
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-3">
            <AdminButton />
            <ThemeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden hover:bg-accent">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] px-6">
              <SheetHeader className="mb-6">
                <SheetTitle>Navegação</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-6">
                {/* Mobile Navigation Links */}
                <Link 
                  href="/" 
                  className="flex items-center py-3 px-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors"
                  onClick={closeSheet}
                >
                  Página inicial
                </Link>
                
                {/* Groups Section */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-muted-foreground px-2">Grupos</div>
                  <div className="space-y-1">
                    <Link 
                      href="/groups/find" 
                      className="flex flex-col py-3 px-4 text-sm hover:bg-accent rounded-lg transition-colors"
                      onClick={closeSheet}
                    >
                      <span className="font-medium">Encontrar grupos</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        Descubra grupos de compartilhamento próximos a você
                      </span>
                    </Link>
                    <Link 
                      href="/groups/my" 
                      className="flex flex-col py-3 px-4 text-sm hover:bg-accent rounded-lg transition-colors"
                      onClick={closeSheet}
                    >
                      <span className="font-medium">Meus grupos</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        Gerencie suas assinaturas e compartilhamentos
                      </span>
                    </Link>
                    <Link 
                      href="/invites" 
                      className="flex items-center justify-between py-3 px-4 text-sm hover:bg-accent rounded-lg transition-colors"
                      onClick={closeSheet}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">Convites</span>
                        <span className="text-xs text-muted-foreground mt-1">
                          Gerencie suas solicitações e convites de grupos
                        </span>
                      </div>
                      <PendingInvitesBadge />
                    </Link>
                    <Link 
                      href="/groups/access-data" 
                      className="flex items-center justify-between py-3 px-4 text-sm hover:bg-accent rounded-lg transition-colors"
                      onClick={closeSheet}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">Dados de Acesso</span>
                        <span className="text-xs text-muted-foreground mt-1">
                          Confirme o recebimento dos dados de streaming
                        </span>
                      </div>
                      <PendingAccessDataBadge />
                    </Link>
                  </div>
                </div>

                <Link 
                  href="/savings" 
                  className="flex items-center py-3 px-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors"
                  onClick={closeSheet}
                >
                  Minhas economias
                </Link>

                <Link 
                  href="/help" 
                  className="flex items-center py-3 px-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors"
                  onClick={closeSheet}
                >
                  Ajuda
                </Link>

                {/* Mobile Auth Buttons */}
                <div className="pt-4 border-t px-2">
                  <AuthButtons />
                </div>
              </div>
            </SheetContent>
          </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
