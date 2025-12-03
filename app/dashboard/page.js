// app/admin/dashboard/page.js (server component)
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import Nav from '@/components/Nav';

// export default async function Page() {
//   const session = await getServerSession(authOptions);
// console.log(session,"sessionnnn");

//   if (!session) return redirect("/login");
//   return <div>Welcome {session.user.email}</div>;
// }

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    
    return (
        <>
          
            <div>
                Welcome {session?.user?.email}
            </div>
        </>
    );
}