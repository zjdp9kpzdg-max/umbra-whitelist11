import { AdminDesk } from "@/components/admin-desk";

export const metadata = {
  title: "signal · petitions",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="relative z-50 flex min-h-full flex-1 flex-col">
      <AdminDesk />
    </div>
  );
}
