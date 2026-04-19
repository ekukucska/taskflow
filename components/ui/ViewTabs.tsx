"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Board", slug: "board" },
  { label: "List", slug: "list" },
  { label: "Calendar", slug: "calendar" },
];

export default function ViewTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const currentView = pathname.split("/").pop();

  return (
    <div className="flex items-center gap-1">
      {TABS.map((tab) => {
        const active = currentView === tab.slug;
        return (
          <Link
            key={tab.slug}
            href={`/projects/${projectId}/${tab.slug}`}
            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
              active
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
