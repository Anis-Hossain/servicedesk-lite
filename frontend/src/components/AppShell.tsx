"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Ticket as TicketIcon,
  Users,
  LogOut,
  Headset,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tickets", label: "Tickets", icon: TicketIcon },
  { href: "/customers", label: "Customers", icon: Users },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted text-sm">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-bg">
      <aside className="hidden md:flex w-60 shrink-0 flex-col bg-primary-dark text-white">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
          <Headset size={20} className="text-white/90" />
          <span className="font-semibold tracking-tight">ServiceDesk Lite</span>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-white/10 text-white font-medium"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-3 pb-2">
            <p className="text-sm font-medium truncate">{user.fullName}</p>
            <p className="text-xs text-white/60 truncate">{user.role === "ADMIN" ? "Administrator" : "Support Agent"}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 rounded px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut size={17} />
            Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-primary-dark text-white">
          <span className="font-semibold">ServiceDesk Lite</span>
          <button onClick={logout} className="text-sm text-white/70">
            Log out
          </button>
        </header>
        <main className="p-4 md:p-8 max-w-6xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
