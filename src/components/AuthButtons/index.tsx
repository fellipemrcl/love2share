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
    <>
      <SignedOut>
        <SignInButton>
          <Button variant="outline">Entrar</Button>
        </SignInButton>
        <SignUpButton>
          <Button className="bg-[#6c47ff] hover:bg-[#5a3ee6] text-white">
            Cadastrar
          </Button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </>
  );
};

export default AuthButtons;
