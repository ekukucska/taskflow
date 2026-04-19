import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");

    const tasks = await prisma.task.findMany({
      where: {
        ...(projectId ? { projectId } : {}),
        ...(status ? { status: status as any } : {}),
      },
      include: {
        assignee: true,
        tags: { include: { tag: true } },
        _count: { select: { comments: true } },
      },
      orderBy: [{ status: "asc" }, { position: "asc" }],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, status, priority, projectId, assigneeId, dueDate, tagIds } = body;

    if (!title || !projectId) {
      return NextResponse.json({ error: "title and projectId are required" }, { status: 400 });
    }

    const maxPosition = await prisma.task.aggregate({
      where: { projectId, status: status || "BACKLOG" },
      _max: { position: true },
    });

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || "BACKLOG",
        priority: priority || "MEDIUM",
        position: (maxPosition._max.position ?? 0) + 1,
        projectId,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: tagIds?.length
          ? { create: tagIds.map((tagId: string) => ({ tagId })) }
          : undefined,
      },
      include: {
        assignee: true,
        tags: { include: { tag: true } },
        _count: { select: { comments: true } },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
