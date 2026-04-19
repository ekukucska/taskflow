import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const firstProject = await prisma.project.findFirst({ orderBy: { createdAt: "asc" } });
  if (firstProject) {
    redirect(`/projects/${firstProject.id}/board`);
  }
  return (
    <div className="flex items-center justify-center h-full text-gray-500">
      No projects found. Create one to get started.
    </div>
  );
}
