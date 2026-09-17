"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserRole } from "@/lib/getUserRole";

export default function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadRole() {
      const userRole = await getUserRole();

      if (mounted) {
        setRole(userRole || "");
      }
    }

    loadRole();

    return () => {
      mounted = false;
    };
  }, []);

  const menu = [
    {
      name: "Dashboard",
      icon: "🏠",
      href: "/admin",
      roles: ["Admin", "Editor", "Reporter"],
    },
    {
      name: "All News",
      icon: "📰",
      href: "/admin/articles",
      roles: ["Admin", "Editor"],
    },
    {
      name: "Add News",
      icon: "➕",
      href: "/admin/articles/new",
      roles: ["Admin", "Editor", "Reporter"],
    },
    {
      name: "Advertisements",
      icon: "📢",
      href: "/admin/advertisements",
      roles: ["Admin"],
    },
    {
      name: "Analytics",
      icon: "📊",
      href: "/admin/analytics",
      roles: ["Admin", "Editor"],
    },
    {
      name: "Staff Management",
      icon: "👥",
      href: "/admin/staff",
      roles: ["Admin"],
    },
    {
      name: "Settings",
      icon: "⚙️",
      href: "/admin/settings",
      roles: ["Admin"],
    },
  ];

  return (
    <aside className="min-h-screen w-64 shrink-0 bg-gray-900 text-white">
      <div className="border-b border-gray-700 p-6">
        <h1 className="text-2xl font-bold">MyHisarNews</h1>
        <p className="mt-1 text-sm text-gray-400">Admin Panel</p>
      </div>

      <nav className="mt-6 space-y-2 px-4">
        {menu
          .filter((item) =>
            item.roles.some(
              (r) => r.toLowerCase() === role.trim().toLowerCase()
            )
          )
          .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                "flex items-center gap-3 rounded-lg px-4 py-3 transition " +
                (pathname === item.href
                  ? "bg-red-600"
                  : "hover:bg-gray-800")
              }
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
      </nav>
    </aside>
  );
}
