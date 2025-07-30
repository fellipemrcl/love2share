"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X, Search, Users, PiggyBank, MessageSquare } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  className?: string;
}

const FloatingActionButton = ({ className }: FloatingActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      label: "Encontrar Grupos",
      href: "/groups/find",
      icon: Search,
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      label: "Meus Grupos", 
      href: "/groups/my",
      icon: Users,
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      label: "Economias",
      href: "/savings", 
      icon: PiggyBank,
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      label: "Convites",
      href: "/invites",
      icon: MessageSquare,
      color: "bg-orange-500 hover:bg-orange-600"
    }
  ];

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      <div className="flex flex-col-reverse items-end space-y-2 space-y-reverse">
        {/* Action buttons */}
        {isOpen && actions.map((action, index) => (
          <div
            key={action.href}
            className="flex items-center space-x-2 animate-in slide-in-from-bottom-2 fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <span className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {action.label}
            </span>
            <Link href={action.href} onClick={() => setIsOpen(false)}>
              <Button
                size="icon"
                className={cn("h-12 w-12 rounded-full shadow-lg", action.color)}
              >
                <action.icon className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        ))}

        {/* Main toggle button */}
        <Button
          size="icon"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-transform",
            isOpen ? "rotate-45 bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </Button>
      </div>
    </div>
  );
};

export default FloatingActionButton;
