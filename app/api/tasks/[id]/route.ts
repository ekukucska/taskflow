import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        assignee: true,
        project: true,
        tags: { include: { tag: true } },
        comments: {
          include: { author: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { title, description, status, priority, assigneeId, dueDate, position, tagIds, version } = body;

    if (version === undefined) {
      return NextResponse.json({ error: "version is required" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const { count } = await tx.task.updateMany({
        where: { id: params.id, version },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(status !== undefined && { status }),
          ...(priority !== undefined && { priority }),
          ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
          ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
          ...(position !== undefined && { position }),
          version: { increment: 1 },
        },
      });

      if (count === 0) return null;

      if (tagIds !== undefined) {
        await tx.taskTag.deleteMany({ where: { taskId: params.id } });
        if (tagIds.length > 0) {
          await tx.taskTag.createMany({
            data: tagIds.map((tagId: string) => ({ taskId: params.id, tagId })),
          });
        }
      }

      return tx.task.findUnique({
        where: { id: params.id },
        include: {
          assignee: true,
          project: true,
          tags: { include: { tag: true } },
          comments: {
            include: { author: true },
            orderBy: { createdAt: "asc" },
          },
        },
      });
    });

    if (result === null) {
      return NextResponse.json({ error: "CONCURRENCY_CONFLICT" }, { status: 409 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.task.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
