import { currentUser } from "@clerk/nextjs/server";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "../ui/button";
import MainClient from "../MainClient";

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

  return <MainClient />;
};

export default Main;
