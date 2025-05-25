import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const Header = () => {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 py-2 shadow-sm">
      <div className="container flex h-14 items-center justify-between">
        <nav className="flex gap-6">
          <div className="flex gap-4">
            <Link
              href="/about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pagina inicial
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Encontrar grupos
            </Link>
            <Link
              href="/services"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Meus grupos
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Ajuda
            </Link>
          </div>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
