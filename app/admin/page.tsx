import { AdminDesk } from "@/components/admin-desk";

export const metadata = {
  title: "UMBRA · Petitions",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AdminDesk />
    </div>
  );
}
