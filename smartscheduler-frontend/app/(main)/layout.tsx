import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex" style={{ minHeight: "100vh" }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
