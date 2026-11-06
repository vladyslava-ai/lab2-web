// Шар доступу до даних.
// Якщо в .env є ключі Supabase, дані читаються й пишуться в PostgreSQL.
// Без ключів застосунок працює в демо-режимі: дані живуть у пам'яті до перезавантаження.

import { createClient } from "@supabase/supabase-js";
import { keyDaysAgo } from "./time.js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(url && key);

const SUBJECT_COLUMNS = "id, name, goal_minutes";
const SESSION_COLUMNS = "id, subject_id, minutes, note, studied_on";

function check({ data, error }) {
  if (error)
    throw new Error(error.message || "Не вдалося виконати запит до бази даних");
  return data;
}

/* ---------- PostgreSQL через Supabase ---------- */

function createRemoteDb() {
  const supabase = createClient(url, key);
  return {
    async listSubjects() {
      return check(
        await supabase.from("subjects").select(SUBJECT_COLUMNS).order("id"),
      );
    },
    async listSessions(sinceKey) {
      return check(
        await supabase
          .from("sessions")
          .select(SESSION_COLUMNS)
          .gte("studied_on", sinceKey)
          .order("studied_on", { ascending: false })
          .order("id", { ascending: false }),
      );
    },
    async addSubject({ name, goalMinutes }) {
      return check(
        await supabase
          .from("subjects")
          .insert({ name, goal_minutes: goalMinutes })
          .select(SUBJECT_COLUMNS)
          .single(),
      );
    },
    async deleteSubject(id) {
      check(await supabase.from("subjects").delete().eq("id", id));
    },
    async addSession({ subjectId, minutes, note, studiedOn }) {
      return check(
        await supabase
          .from("sessions")
          .insert({
            subject_id: subjectId,
            minutes,
            note: note || null,
            studied_on: studiedOn,
          })
          .select(SESSION_COLUMNS)
          .single(),
      );
    },
    async deleteSession(id) {
      check(await supabase.from("sessions").delete().eq("id", id));
    },
  };
}

/* ---------- Демо-режим у пам'яті ---------- */

function createMemoryDb() {
  let nextId = 1;
  const subjects = [
    { name: "Python", goal_minutes: 360 },
    { name: "SQL", goal_minutes: 300 },
    { name: "Англійська", goal_minutes: 240 },
    { name: "Математика", goal_minutes: 180 },
  ].map((subject) => ({ id: nextId++, ...subject }));

  // [скільки днів тому, предмет, хвилини, нотатка]
  const seed = [
    [6, "Python", 60, "Цикли та функції"],
    [5, "SQL", 90, "JOIN і підзапити"],
    [5, "Англійська", 30, "Нові слова за темою «робота»"],
    [4, "Python", 45, "Словники та списки"],
    [4, "Математика", 30, "Матриці"],
    [3, "SQL", 60, "Віконні функції"],
    [3, "Англійська", 30, "Аудіювання"],
    [2, "Python", 45, "Pandas: перші кроки"],
    [1, "SQL", 60, "Групування й агрегати"],
    [1, "Математика", 30, "Ймовірність"],
    [0, "Англійська", 30, "Читання статті"],
  ];
  let sessions = seed.map(([ago, name, minutes, note]) => ({
    id: nextId++,
    subject_id: subjects.find((s) => s.name === name).id,
    minutes,
    note,
    studied_on: keyDaysAgo(ago),
  }));

  const wait = (value) =>
    new Promise((resolve) =>
      setTimeout(() => resolve(structuredClone(value)), 120),
    );
  const byNewest = (a, b) =>
    a.studied_on === b.studied_on
      ? b.id - a.id
      : a.studied_on < b.studied_on
        ? 1
        : -1;

  const db = {
    listSubjects: () => wait(subjects),
    listSessions: (sinceKey) =>
      wait(sessions.filter((s) => s.studied_on >= sinceKey).sort(byNewest)),
    async addSubject({ name, goalMinutes }) {
      const row = { id: nextId++, name, goal_minutes: goalMinutes };
      subjects.push(row);
      return wait(row);
    },
    async deleteSubject(id) {
      subjects.splice(
        subjects.findIndex((s) => s.id === id),
        1,
      );
      sessions = sessions.filter((s) => s.subject_id !== id);
      return wait(null);
    },
    async addSession({ subjectId, minutes, note, studiedOn }) {
      const row = {
        id: nextId++,
        subject_id: subjectId,
        minutes,
        note: note || null,
        studied_on: studiedOn,
      };
      sessions.push(row);
      return wait(row);
    },
    async deleteSession(id) {
      sessions = sessions.filter((s) => s.id !== id);
      return wait(null);
    },
  };
  return db;
}

export const db = isConfigured ? createRemoteDb() : createMemoryDb();
