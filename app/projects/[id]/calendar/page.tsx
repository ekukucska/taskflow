import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CalendarView from "@/components/calendar/CalendarView";

export default async function CalendarPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      tasks: {
        include: {
          assignee: true,
          tags: { include: { tag: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { dueDate: "asc" },
      },
    },
  });

  if (!project) notFound();

  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });

  return (
    <CalendarView
      project={project as any}
      initialTasks={project.tasks as any}
      users={users as any}
      tags={tags as any}
    />
  );
}
