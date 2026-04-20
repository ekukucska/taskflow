# TaskFlow — Distributed Task Manager

A JIRA-like task management web application built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, **Prisma**, and **PostgreSQL**.

## Features

- **Kanban Board** — Drag and drop tasks between status columns
- **List View** — Sortable, filterable task table
- **Calendar View** — Tasks visualized on their due dates
- **Task Management** — Create, edit, and comment on tasks
- **User Assignments** — Assign tasks to team members
- **Priority & Status Tracking** — Organize by priority (LOW, MEDIUM, HIGH, URGENT) and status (BACKLOG, TODO, IN_PROGRESS, HOLD, DONE)

---

## Prerequisites

Before setting up TaskFlow, ensure you have installed:

- **Node.js** (v18 or higher) — [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) — [Download](https://www.postgresql.org/download/)
- **pgAdmin 4** (optional, for database management) — [Download](https://www.pgadmin.org/download/)

---

## Setup Instructions

### 1. **Clone / Extract the Project**

```bash
# If provided as a zip file, extract it first
unzip taskflow.zip
cd taskflow
```

### 2. **Install Dependencies**

```bash
npm install
```

### 3. **Set Up PostgreSQL Database**

#### Option A: **Using the Database Dump (Quickest)**

If a `backup.sql` file is included:

1. Open **pgAdmin** or use the **psql terminal**
2. Create a new empty database:
   ```sql
   CREATE DATABASE taskflow;
   ```
3. Restore the database from the dump:
   ```bash
   psql -U postgres -h localhost taskflow < taskflow_dump.sql
   ```
4. The database is now pre-populated with tables, migrations, and seed data. **Skip to step 4.**

#### Option B: **Manual Database Setup**

1. Open **pgAdmin** → Connect to your PostgreSQL server
2. Create a new database named `taskflow`
3. Note your PostgreSQL password (used during installation)

### 4. **Configure Environment Variables**

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and replace the placeholder with your PostgreSQL credentials:

   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/taskflow"
   ```

   **Example:**

   ```env
   DATABASE_URL="postgresql://postgres:admin1234@localhost:5432/taskflow"
   ```

### 5. **Run Database Migrations & Seed (Only if using Option B)**

If you didn't use the dump file, run:

```bash
# Apply the latest migrations
npx prisma migrate dev

# (Optional) Populate the database with sample data
npx prisma db seed
```

### 6. **Start the Development Server**

```bash
npm run dev
```

The app will be available at **[http://localhost:3000](http://localhost:3000)**

---

## Testing the Application

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. You should see the TaskFlow dashboard with pre-populated projects and tasks
3. Test the features:
   - **Kanban Board** — Drag tasks between columns
   - **List View** — Sort and filter tasks
   - **Calendar View** — View tasks by due date
   - **Create/Edit Tasks** — Click "New Task" or edit existing tasks
   - **Comments** — Add comments to tasks

---

## Project Structure

```
taskflow/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (tasks, projects, comments, users)
│   ├── projects/[id]/     # Dynamic project pages (board, list, calendar)
│   └── layout.tsx         # Root layout with sidebar
├── components/            # Reusable React components
├── lib/                   # Utilities and Prisma client
├── prisma/
│   ├── schema.prisma      # Database schema definition
│   ├── migrations/        # Database migration files
│   ├── seed.ts            # Seed script for sample data
│   └── taskflow_dump.sql  # Database backup (optional)
├── public/                # Static assets
├── .env.example           # Environment variables template
├── README.md              # This file
└── package.json           # Dependencies and scripts
```

---

## Available Scripts

```bash
npm run dev              # Start development server (next dev)
npm run build            # Build for production (next build)
npm start                # Start production server (next start)
npm run lint             # Run ESLint
npm run type-check       # Check TypeScript types

# Prisma commands
npx prisma migrate dev   # Create and run migrations interactively
npx prisma db push      # Sync schema with database (without migrations)
npx prisma db seed      # Run the seed script
npx prisma studio      # Open Prisma Studio (visual database GUI)
```

---

## Database Schema

### Core Tables

- **User** — Authors, assignees, project owners
- **Project** — Task containers with color coding
- **Task** — Individual tasks with status, priority, due dates, comments
- **Comment** — Task comments from users
- **Tag** — Categorization tags
- **TaskTag** — Many-to-many relationship between tasks and tags

### Enums

- **Status**: `BACKLOG` | `TODO` | `IN_PROGRESS` | `HOLD` | `DONE`
- **Priority**: `LOW` | `MEDIUM` | `HIGH` | `URGENT`

---

## Troubleshooting

### **Error: "Can't reach database server"**

- Ensure PostgreSQL is running: `pg_ctl start` (macOS/Linux) or use pgAdmin
- Check `DATABASE_URL` in `.env` matches your PostgreSQL credentials
- Verify the database `taskflow` exists

### **Error: "relation 'User' does not exist"**

- You skipped the database setup. Run:
  ```bash
  npx prisma migrate dev
  npx prisma db seed
  ```

### **Port 3000 already in use**

```bash
# Use a different port
npm run dev -- -p 3001
```

### **Migrations failed**

- Reset the database (destructive):
  ```bash
  npx prisma migrate reset
  ```
- Or restore from the dump file again

---

## Technology Stack

| Technology          | Purpose                         |
| ------------------- | ------------------------------- |
| **Next.js 14**      | React framework with App Router |
| **TypeScript**      | Type-safe JavaScript            |
| **Tailwind CSS**    | Utility-first CSS framework     |
| **Prisma**          | Type-safe ORM for PostgreSQL    |
| **PostgreSQL**      | Relational database             |
| **React Draggable** | Drag-and-drop for Kanban        |

---

## License

MIT — See LICENSE file for details.
