import { PrismaClient, Status, Priority } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.taskTag.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const alice = await prisma.user.create({
    data: {
      name: "Alice Johnson",
      email: "alice@taskflow.dev",
      avatarUrl: "https://ui-avatars.com/api/?name=Alice+Johnson&background=6366f1&color=fff",
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: "Bob Martinez",
      email: "bob@taskflow.dev",
      avatarUrl: "https://ui-avatars.com/api/?name=Bob+Martinez&background=8b5cf6&color=fff",
    },
  });

  const carol = await prisma.user.create({
    data: {
      name: "Carol Popa",
      email: "carol@taskflow.dev",
      avatarUrl: "https://ui-avatars.com/api/?name=Carol+Popa&background=ec4899&color=fff",
    },
  });

  // Create tags
  const tagBug = await prisma.tag.create({ data: { name: "bug", color: "#ef4444" } });
  const tagFeature = await prisma.tag.create({ data: { name: "feature", color: "#3b82f6" } });
  const tagDesign = await prisma.tag.create({ data: { name: "design", color: "#a855f7" } });
  const tagBackend = await prisma.tag.create({ data: { name: "backend", color: "#f97316" } });
  const tagUrgent = await prisma.tag.create({ data: { name: "urgent", color: "#dc2626" } });

  // Create projects
  const projectWebsite = await prisma.project.create({
    data: {
      name: "Website Redesign",
      description: "Complete overhaul of the company website with modern design system",
      color: "#6366f1",
      ownerId: alice.id,
    },
  });

  const projectMobile = await prisma.project.create({
    data: {
      name: "Mobile App",
      description: "Cross-platform mobile application for iOS and Android",
      color: "#8b5cf6",
      ownerId: bob.id,
    },
  });

  const now = new Date("2026-04-19");
  const thisMonth = (day: number) => new Date(2026, 3, day); // April 2026

  // Website Redesign tasks
  const websiteTasks = [
    {
      title: "Design new homepage mockups",
      description: "Create Figma mockups for the redesigned homepage with hero section and feature highlights",
      status: Status.DONE,
      priority: Priority.HIGH,
      position: 1,
      assigneeId: carol.id,
      dueDate: thisMonth(5),
      tags: [tagDesign.id, tagFeature.id],
    },
    {
      title: "Set up design system",
      description: "Establish color palette, typography, spacing scale, and component library",
      status: Status.DONE,
      priority: Priority.HIGH,
      position: 2,
      assigneeId: carol.id,
      dueDate: thisMonth(8),
      tags: [tagDesign.id],
    },
    {
      title: "Implement responsive navbar",
      description: "Build the top navigation component with mobile hamburger menu",
      status: Status.IN_PROGRESS,
      priority: Priority.HIGH,
      position: 1,
      assigneeId: alice.id,
      dueDate: thisMonth(20),
      tags: [tagFeature.id],
    },
    {
      title: "Hero section animation",
      description: "Add smooth scroll animations to the hero section using Framer Motion",
      status: Status.IN_PROGRESS,
      priority: Priority.MEDIUM,
      position: 2,
      assigneeId: carol.id,
      dueDate: thisMonth(22),
      tags: [tagDesign.id, tagFeature.id],
    },
    {
      title: "Fix broken contact form",
      description: "Form submissions are not being saved to the database — validation errors swallowed",
      status: Status.TODO,
      priority: Priority.URGENT,
      position: 1,
      assigneeId: alice.id,
      dueDate: thisMonth(19),
      tags: [tagBug.id, tagUrgent.id],
    },
    {
      title: "Migrate CMS content",
      description: "Transfer all blog posts and pages from old WordPress CMS to new headless setup",
      status: Status.TODO,
      priority: Priority.MEDIUM,
      position: 2,
      assigneeId: bob.id,
      dueDate: thisMonth(25),
      tags: [tagBackend.id],
    },
    {
      title: "Set up analytics",
      description: "Integrate Google Analytics 4 and set up custom events",
      status: Status.TODO,
      priority: Priority.LOW,
      position: 3,
      assigneeId: bob.id,
      dueDate: thisMonth(28),
      tags: [tagFeature.id, tagBackend.id],
    },
    {
      title: "Performance audit",
      description: "Run Lighthouse audit and fix all issues below 90 score",
      status: Status.BACKLOG,
      priority: Priority.MEDIUM,
      position: 1,
      assigneeId: alice.id,
      dueDate: null,
      tags: [],
    },
    {
      title: "SEO meta tags",
      description: "Add proper Open Graph and Twitter card meta tags to all pages",
      status: Status.BACKLOG,
      priority: Priority.LOW,
      position: 2,
      assigneeId: null,
      dueDate: null,
      tags: [tagFeature.id],
    },
    {
      title: "Load testing",
      description: "Test site under heavy traffic with k6 before launch",
      status: Status.HOLD,
      priority: Priority.HIGH,
      position: 1,
      assigneeId: bob.id,
      dueDate: thisMonth(30),
      tags: [tagBackend.id],
    },
  ];

  const mobileAppTasks = [
    {
      title: "User authentication flow",
      description: "Implement signup, login, and password reset with JWT tokens",
      status: Status.DONE,
      priority: Priority.URGENT,
      position: 1,
      assigneeId: bob.id,
      dueDate: thisMonth(3),
      tags: [tagBackend.id, tagFeature.id],
    },
    {
      title: "Push notifications",
      description: "Integrate Firebase Cloud Messaging for iOS and Android push notifications",
      status: Status.IN_PROGRESS,
      priority: Priority.HIGH,
      position: 1,
      assigneeId: bob.id,
      dueDate: thisMonth(21),
      tags: [tagFeature.id, tagBackend.id],
    },
    {
      title: "App icon & splash screen",
      description: "Design and export app icons for all required sizes plus animated splash screen",
      status: Status.IN_PROGRESS,
      priority: Priority.MEDIUM,
      position: 2,
      assigneeId: carol.id,
      dueDate: thisMonth(23),
      tags: [tagDesign.id],
    },
    {
      title: "Offline mode support",
      description: "Cache API responses and queue write operations when offline",
      status: Status.TODO,
      priority: Priority.HIGH,
      position: 1,
      assigneeId: bob.id,
      dueDate: thisMonth(26),
      tags: [tagFeature.id, tagBackend.id],
    },
    {
      title: "Crash on Android 12 devices",
      description: "App crashes immediately on startup on Android 12 — null pointer in MainActivity",
      status: Status.TODO,
      priority: Priority.URGENT,
      position: 2,
      assigneeId: alice.id,
      dueDate: thisMonth(20),
      tags: [tagBug.id, tagUrgent.id],
    },
    {
      title: "Dark mode theming",
      description: "Implement full dark mode support following system preferences",
      status: Status.BACKLOG,
      priority: Priority.MEDIUM,
      position: 1,
      assigneeId: carol.id,
      dueDate: null,
      tags: [tagDesign.id, tagFeature.id],
    },
    {
      title: "App Store submission",
      description: "Prepare screenshots, descriptions, and submit for App Store review",
      status: Status.BACKLOG,
      priority: Priority.HIGH,
      position: 2,
      assigneeId: null,
      dueDate: null,
      tags: [],
    },
    {
      title: "Beta testing with users",
      description: "Recruit 20 beta testers via TestFlight and gather feedback",
      status: Status.HOLD,
      priority: Priority.MEDIUM,
      position: 1,
      assigneeId: alice.id,
      dueDate: thisMonth(29),
      tags: [tagFeature.id],
    },
    {
      title: "API rate limiting",
      description: "Implement rate limiting on all public API endpoints to prevent abuse",
      status: Status.HOLD,
      priority: Priority.HIGH,
      position: 2,
      assigneeId: bob.id,
      dueDate: null,
      tags: [tagBackend.id],
    },
    {
      title: "In-app purchases",
      description: "Set up StoreKit 2 for iOS and Google Play Billing for premium features",
      status: Status.BACKLOG,
      priority: Priority.LOW,
      position: 3,
      assigneeId: null,
      dueDate: null,
      tags: [tagFeature.id, tagBackend.id],
    },
  ];

  const createdWebsiteTasks = [];
  for (const t of websiteTasks) {
    const { tags, ...taskData } = t;
    const task = await prisma.task.create({
      data: { ...taskData, projectId: projectWebsite.id },
    });
    if (tags.length > 0) {
      await prisma.taskTag.createMany({
        data: tags.map((tagId) => ({ taskId: task.id, tagId })),
      });
    }
    createdWebsiteTasks.push(task);
  }

  const createdMobileTasks = [];
  for (const t of mobileAppTasks) {
    const { tags, ...taskData } = t;
    const task = await prisma.task.create({
      data: { ...taskData, projectId: projectMobile.id },
    });
    if (tags.length > 0) {
      await prisma.taskTag.createMany({
        data: tags.map((tagId) => ({ taskId: task.id, tagId })),
      });
    }
    createdMobileTasks.push(task);
  }

  // Comments
  await prisma.comment.createMany({
    data: [
      {
        content: "Mockups look great! Can we add a dark mode variant?",
        taskId: createdWebsiteTasks[0].id,
        authorId: alice.id,
      },
      {
        content: "Dark mode variant is now included in the v2 mockups shared in Figma.",
        taskId: createdWebsiteTasks[0].id,
        authorId: carol.id,
      },
      {
        content: "Found the issue — the error handler was catching the exception and returning 200. Fixed in branch fix/contact-form.",
        taskId: createdWebsiteTasks[4].id,
        authorId: alice.id,
      },
      {
        content: "Reproduced on Samsung Galaxy S22. Looks like a null intent extra. I'll take a look today.",
        taskId: createdMobileTasks[4].id,
        authorId: alice.id,
      },
      {
        content: "Firebase is configured. Waiting for backend webhook endpoint to be ready before we can test end-to-end.",
        taskId: createdMobileTasks[1].id,
        authorId: bob.id,
      },
      {
        content: "Rate limiting should use a sliding window algorithm. Redis would be ideal for this.",
        taskId: createdMobileTasks[8].id,
        authorId: bob.id,
      },
    ],
  });

  console.log("✅ Seed completed successfully!");
  console.log(`   Users: 3 (Alice, Bob, Carol)`);
  console.log(`   Projects: 2 (Website Redesign, Mobile App)`);
  console.log(`   Tasks: ${websiteTasks.length + mobileAppTasks.length}`);
  console.log(`   Tags: 5`);
  console.log(`   Comments: 6`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
