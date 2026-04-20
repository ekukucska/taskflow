import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TAGS = [
  { name: "feature",       color: "#bfdbfe" },
  { name: "bug",           color: "#fecaca" },
  { name: "chore",         color: "#e5e7eb" },
  { name: "design",        color: "#e9d5ff" },
  { name: "documentation", color: "#99f6e4" },
  { name: "wip",           color: "#fef08a" },
  { name: "qa",            color: "#a5f3fc" },
  { name: "frontend",      color: "#c7d2fe" },
  { name: "backend",       color: "#fed7aa" },
  { name: "devops",        color: "#bbf7d0" },
  { name: "security",      color: "#ddd6fe" },
  { name: "mobile",        color: "#bae6fd" },
];

async function main() {
  for (const tag of TAGS) {
    await prisma.tag.upsert({
      where:  { name: tag.name },
      update: { color: tag.color },
      create: tag,
    });
  }
  console.log(`✅ Tags synced (${TAGS.length} upserted, existing data untouched).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
