import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, taskId, authorId } = body;

    if (!content || !taskId || !authorId) {
      return NextResponse.json({ error: "content, taskId, authorId are required" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: { content, taskId, authorId },
      include: { author: true },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
