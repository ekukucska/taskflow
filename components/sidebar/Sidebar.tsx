"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Project } from "@/types";

export default function Sidebar() {
  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[]>([]);

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
      style={{ background: "#1a1a2e", minWidth: 240, width: 240 }}
      className="flex flex-col h-full text-white"
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            T
          </div>
          <span className="font-semibold text-base tracking-tight">
            TaskFlow
          </span>
        </div>
      </div>

      {/* Projects list */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2">
          <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
            Projects
          </span>
        </div>

        {projects.map((project) => {
          const isActive = project.id === currentProjectId;
          return (
            <div key={project.id}>
              <Link
                href={`/projects/${project.id}/board`}
                className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors rounded-md mx-2 ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white/90"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <span className="truncate">{project.name}</span>
                <span className="ml-auto text-xs text-white/30">
                  {project._count?.tasks ?? 0}
                </span>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="text-xs text-white/30 text-center">
          Work Management App
        </div>
      </div>
    </aside>
  );
}
