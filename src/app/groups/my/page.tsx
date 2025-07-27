import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import MyGroupsClient from "@/components/MyGroupsClient";

export default async function MyGroupsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <MyGroupsClient />;
}
