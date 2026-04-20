"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Project } from "@/types";

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then(setProjects)
      .catch(console.error);
  }, []);

  const match = pathname.match(/\/projects\/([^/]+)/);
  const currentProjectId = match?.[1];

  return (
    <aside
      style={{
        background: "var(--sidebar-bg, #1a1a2e)",
        width: collapsed ? 56 : 240,
        minWidth: collapsed ? 56 : 240,
        transition: "width 0.25s ease, min-width 0.25s ease",
      }}
      className="flex flex-col h-full text-white overflow-hidden"
    >
      {/* Logo */}
      <div className="px-3 py-5 border-b border-white/10 flex items-center gap-2">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          T
        </div>
        {!collapsed && (
          <span className="font-semibold text-base tracking-tight whitespace-nowrap">
            TaskFlow
          </span>
        )}
      </div>

      {/* Projects list */}
      <div className="flex-1 overflow-y-auto py-4">
        {!collapsed && (
          <div className="px-4 mb-2">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
              Projects
            </span>
          </div>
        )}

        {projects.map((project) => {
          const isActive = project.id === currentProjectId;
          return (
            <div key={project.id}>
              <Link
                href={`/projects/${project.id}/board`}
                title={collapsed ? project.name : undefined}
                className={`flex items-center gap-3 px-3 py-3 text-[15px] font-medium transition-colors rounded-md mx-2 min-h-[44px] ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white/90"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-blue-500"
                />
                {!collapsed && (
                  <>
                    <span className="truncate">{project.name}</span>
                    <span className="ml-auto text-xs text-white/30">
                      {project._count?.tasks ?? 0}
                    </span>
                  </>
                )}
              </Link>
            </div>
          );
        })}
      </div>

      {/* Collapse toggle */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="w-full flex items-center justify-center gap-2 text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors min-h-[44px] rounded-md"
        >
          {collapsed ? <ChevronRightIcon /> : (
            <>
              <ChevronLeftIcon />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
