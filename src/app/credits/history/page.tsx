import { CreditHistory } from "@/components/CreditHistory";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function CreditHistoryPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background">
      <CreditHistory />
    </div>
  );
}