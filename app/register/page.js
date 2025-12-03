
import Register from "@/components/Register";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
export default async function Product() {
   const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/dashboard");
  }
  return <Register/>;
  
}
