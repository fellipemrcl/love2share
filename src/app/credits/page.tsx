import { CreditsPurchaseForm } from "@/components/CreditsPurchaseForm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function CreditsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background">
      <CreditsPurchaseForm />
    </div>
  );
}