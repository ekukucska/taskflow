import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        owner: true,
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, color, ownerId } = body;

    if (!name || !ownerId) {
      return NextResponse.json({ error: "name and ownerId are required" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: { name, description, color: color || "#6366f1", ownerId },
      include: { owner: true, _count: { select: { tasks: true } } },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
