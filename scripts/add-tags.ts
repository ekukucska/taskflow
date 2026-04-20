import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TAGS = [
  { name: "feature",       color: "#3b82f6" },
  { name: "bug",           color: "#ef4444" },
  { name: "chore",         color: "#6b7280" },
  { name: "design",        color: "#a855f7" },
  { name: "documentation", color: "#14b8a6" },
  { name: "wip",           color: "#f59e0b" },
  { name: "qa",            color: "#06b6d4" },
  { name: "frontend",      color: "#6366f1" },
  { name: "backend",       color: "#f97316" },
  { name: "devops",        color: "#22c55e" },
  { name: "security",      color: "#7c3aed" },
  { name: "mobile",        color: "#0ea5e9" },
];

async function main() {
  for (const tag of TAGS) {
    await prisma.tag.upsert({
      where:  { name: tag.name },
      update: {},
      create: tag,
    });
  }
  console.log(`✅ Tags synced (${TAGS.length} upserted, existing data untouched).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
