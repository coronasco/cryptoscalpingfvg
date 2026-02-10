import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <div className="bg-transparent text-[color:var(--text)]">{children}</div>;
}
