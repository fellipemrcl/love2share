import { currentUser } from "@clerk/nextjs/server";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "../ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Main = async () => {
  const user = await currentUser();

  if (!user) {
    return (
      <div className="text-center p-4">
        <p className="mb-4 text-muted-foreground">
          Você precisa estar logado para criar um novo grupo
        </p>
        <SignInButton>
          <Button variant="outline">Fazer Login</Button>
        </SignInButton>
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">+ Criar novo grupo</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar novo grupo de {user.firstName}</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default Main;
