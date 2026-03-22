"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { name: "Profile", path: "/profile", icon: "👤", color: "bg-indigo-50 text-indigo-700 ring-indigo-200" },
  { name: "Swipe", path: "/swipe", icon: "🃏", color: "bg-pink-50 text-pink-700 ring-pink-200" },
  { name: "Discover", path: "/discover", icon: "🧩", color: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  { name: "Tracker", path: "/tracker", icon: "📋", color: "bg-amber-50 text-amber-800 ring-amber-200" },
  { name: "Coach", path: "/coach", icon: "🤖", color: "bg-sky-50 text-sky-700 ring-sky-200" },
];

export default function NavTabs() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-3">
      {tabs.map((t) => {
        const active = pathname === t.path;
        return (
          <Link
            key={t.path}
            href={t.path}
            className={[
              "group inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold",
              "ring-1 transition hover:-translate-y-[1px] hover:shadow-sm",
              active ? "bg-slate-900 text-white ring-slate-900" : t.color,
            ].join(" ")}
          >
            <span className="text-lg">{t.icon}</span>
            <span>{t.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
