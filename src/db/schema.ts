import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["USER", "ADMIN"]);

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").default("USER").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  projectMembers: many(projectMembers),
  assignedTasks: many(tasks, { relationName: "assignee" }),
  createdTasks: many(tasks, { relationName: "creator" }),
  comments: many(comments),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ─── Projects ────────────────────────────────────────────────────────────────

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("ACTIVE").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projectsRelations = relations(projects, ({ many }) => ({
  members: many(projectMembers),
  tasks: many(tasks),
}));

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

// ─── Project Members (junction) ─────────────────────────────────────────────

export const projectMembers = pgTable("project_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  projectRole: varchar("project_role", { length: 100 }),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  user: one(users, { fields: [projectMembers.userId], references: [users.id] }),
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
}));

export type ProjectMember = typeof projectMembers.$inferSelect;
export type NewProjectMember = typeof projectMembers.$inferInsert;

// ─── Tasks ───────────────────────────────────────────────────────────────────

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("TODO").notNull(),
  priority: varchar("priority", { length: 50 }).default("MEDIUM").notNull(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  assigneeId: integer("assignee_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdById: integer("created_by_id")
    .notNull()
    .references(() => users.id),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
    relationName: "assignee",
  }),
  creator: one(users, {
    fields: [tasks.createdById],
    references: [users.id],
    relationName: "creator",
  }),
  taskLabels: many(taskLabels),
  comments: many(comments),
}));

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

// ─── Labels ──────────────────────────────────────────────────────────────────

export const labels = pgTable("labels", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  color: varchar("color", { length: 20 }),
});

export const labelsRelations = relations(labels, ({ many }) => ({
  taskLabels: many(taskLabels),
}));

export type Label = typeof labels.$inferSelect;
export type NewLabel = typeof labels.$inferInsert;

// ─── Task Labels (many-to-many junction) ─────────────────────────────────────

export const taskLabels = pgTable(
  "task_labels",
  {
    taskId: integer("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    labelId: integer("label_id")
      .notNull()
      .references(() => labels.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.taskId, t.labelId] })],
);

export const taskLabelsRelations = relations(taskLabels, ({ one }) => ({
  task: one(tasks, { fields: [taskLabels.taskId], references: [tasks.id] }),
  label: one(labels, { fields: [taskLabels.labelId], references: [labels.id] }),
}));

export type TaskLabel = typeof taskLabels.$inferSelect;
export type NewTaskLabel = typeof taskLabels.$inferInsert;

// ─── Comments ────────────────────────────────────────────────────────────────

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  taskId: integer("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const commentsRelations = relations(comments, ({ one }) => ({
  task: one(tasks, { fields: [comments.taskId], references: [tasks.id] }),
  author: one(users, { fields: [comments.authorId], references: [users.id] }),
}));

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
