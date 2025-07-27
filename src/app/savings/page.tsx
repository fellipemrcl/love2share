import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import SavingsClient from "@/components/SavingsClient/index";

export const metadata: Metadata = {
  title: "Minhas Economias | Love2Share",
  description: "Veja quanto você está economizando compartilhando streamings com outros usuários",
};

export default async function SavingsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <SavingsClient />;
}
