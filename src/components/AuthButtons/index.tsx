"use client";

import { Button } from "@/components/ui/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

const AuthButtons = () => {
  return (
    <div className="flex items-center gap-2">
      <SignedOut>
        <SignInButton>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm">
            Entrar
          </Button>
        </SignInButton>
        <SignUpButton>
          <Button 
            size="sm" 
            className="bg-[#6c47ff] hover:bg-[#5a3ee6] text-white text-xs sm:text-sm"
          >
            Cadastrar
          </Button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
};

export default AuthButtons;
