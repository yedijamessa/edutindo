import "@/lib/server-only";

import { ensureCurriculumReady } from "@/lib/curriculum-portal";
import { listModuleDocuments } from "@/lib/module-editor";
import { sqlQuery as sql } from "@/lib/postgres-query";

type CurriculumActivityRow = {
  id: string;
  title: string;
  item_type: string;
  actor_user_id: string | null;
  actor_email: string | null;
  created_at: Date;
  updated_at: Date;
};

type ModuleActivityRow = {
  id: string;
  title: string;
  actor_user_id: string | null;
  actor_email: string | null;
  created_at: Date;
  updated_at: Date;
};

type AssignmentActivityRow = {
  id: string;
  lesson_title: string;
  module_title: string;
  actor_user_id: string | null;
  actor_email: string | null;
  assigned_at: Date;
};

export type AdminActivityLog = {
  id: string;
  action: "created" | "updated" | "assigned";
  itemType: "curriculum" | "chapter" | "module" | "assignment";
  title: string;
  actorUserId: string;
  actorEmail: string;
  occurredAt: string;
};

function getActorLabel(email: string | null, userId: string | null) {
  return email || userId || "Unknown user";
}

function toIsoDate(value: Date) {
  return new Date(value).toISOString();
}

function getCurriculumItemType(nodeType: string): AdminActivityLog["itemType"] {
  if (nodeType === "chapter") return "chapter";
  if (nodeType === "lesson") return "module";
  return "curriculum";
}

function getAction(createdAt: Date, updatedAt: Date): AdminActivityLog["action"] {
  return Math.abs(new Date(updatedAt).getTime() - new Date(createdAt).getTime()) < 1000 ? "created" : "updated";
}

export async function listAdminActivityLogs(limit = 80): Promise<AdminActivityLog[]> {
  await ensureCurriculumReady();
  await listModuleDocuments();

  const [curriculumResult, moduleResult, assignmentResult] = await Promise.all([
    sql<CurriculumActivityRow>`
      SELECT
        node.id,
        node.title,
        node.node_type AS item_type,
        COALESCE(node.updated_by_user_id, node.created_by_user_id) AS actor_user_id,
        actor.email AS actor_email,
        node.created_at,
        node.updated_at
      FROM curriculum_nodes AS node
      LEFT JOIN auth_users AS actor
        ON actor.id = COALESCE(node.updated_by_user_id, node.created_by_user_id)
      WHERE node.node_type IN ('subject', 'chapter', 'lesson')
      ORDER BY node.updated_at DESC
      LIMIT ${limit}
    `,
    sql<ModuleActivityRow>`
      SELECT
        modules.id,
        modules.title,
        modules.updated_by_user_id AS actor_user_id,
        actor.email AS actor_email,
        modules.created_at,
        modules.updated_at
      FROM module_editor_modules AS modules
      LEFT JOIN auth_users AS actor
        ON actor.id = modules.updated_by_user_id
      ORDER BY modules.updated_at DESC
      LIMIT ${limit}
    `,
    sql<AssignmentActivityRow>`
      SELECT
        assignment.lesson_id || ':' || assignment.module_id AS id,
        lesson.title AS lesson_title,
        modules.title AS module_title,
        assignment.assigned_by_user_id AS actor_user_id,
        actor.email AS actor_email,
        assignment.assigned_at
      FROM module_editor_lesson_assignments AS assignment
      INNER JOIN curriculum_nodes AS lesson
        ON lesson.id = assignment.lesson_id
      INNER JOIN module_editor_modules AS modules
        ON modules.id = assignment.module_id
      LEFT JOIN auth_users AS actor
        ON actor.id = assignment.assigned_by_user_id
      ORDER BY assignment.assigned_at DESC
      LIMIT ${limit}
    `,
  ]);

  const curriculumLogs = curriculumResult.rows.map((row): AdminActivityLog => ({
    id: `curriculum:${row.id}:${row.updated_at.toISOString()}`,
    action: getAction(row.created_at, row.updated_at),
    itemType: getCurriculumItemType(row.item_type),
    title: row.title,
    actorUserId: row.actor_user_id ?? "",
    actorEmail: getActorLabel(row.actor_email, row.actor_user_id),
    occurredAt: toIsoDate(row.updated_at),
  }));

  const moduleLogs = moduleResult.rows.map((row): AdminActivityLog => ({
    id: `module:${row.id}:${row.updated_at.toISOString()}`,
    action: getAction(row.created_at, row.updated_at),
    itemType: "module",
    title: row.title,
    actorUserId: row.actor_user_id ?? "",
    actorEmail: getActorLabel(row.actor_email, row.actor_user_id),
    occurredAt: toIsoDate(row.updated_at),
  }));

  const assignmentLogs = assignmentResult.rows.map((row): AdminActivityLog => ({
    id: `assignment:${row.id}:${row.assigned_at.toISOString()}`,
    action: "assigned",
    itemType: "assignment",
    title: `${row.module_title} assigned to ${row.lesson_title}`,
    actorUserId: row.actor_user_id ?? "",
    actorEmail: getActorLabel(row.actor_email, row.actor_user_id),
    occurredAt: toIsoDate(row.assigned_at),
  }));

  return [...curriculumLogs, ...moduleLogs, ...assignmentLogs]
    .sort((left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime())
    .slice(0, limit);
}
