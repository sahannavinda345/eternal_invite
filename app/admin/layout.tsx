import AdminSidebar from "@/components/admin/AdminSidebar";
import { requireAdmin } from "@/lib/admin";

export const metadata = { title: { default: "Admin", template: "%s · Admin · Eternal Chapter" } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  return (
    <div className="grid min-h-screen md:grid-cols-[232px_minmax(0,1fr)]">
      <AdminSidebar email={user.email ?? "Admin"} />
      <main className="min-w-0 px-4 pb-12 pt-6 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">{children}</div>
      </main>
    </div>
  );
}
