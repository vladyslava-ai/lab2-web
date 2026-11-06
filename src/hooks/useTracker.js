import { useCallback, useEffect, useState } from "react";
import { db } from "../lib/db.js";
import { DAYS, keyDaysAgo } from "../lib/time.js";

const byNewest = (a, b) =>
  a.studied_on === b.studied_on ? b.id - a.id : a.studied_on < b.studied_on ? 1 : -1;

// Увесь стан трекера: предмети й сесії з бази та дії над ними
export function useTracker() {
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const [subjectRows, sessionRows] = await Promise.all([
        db.listSubjects(),
        db.listSessions(keyDaysAgo(DAYS - 1)),
      ]);
      setSubjects(subjectRows);
      setSessions(sessionRows);
      setLoadError("");
      setStatus("ready");
    } catch (error) {
      setLoadError(error.message);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Виконує дію, показує помилку, якщо вона сталася, і повідомляє форму, чи вдалося
  const guard = (action) => async (...args) => {
    setBusy(true);
    setActionError("");
    try {
      await action(...args);
      return true;
    } catch (error) {
      setActionError(error.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const addSubject = guard(async (input) => {
    const row = await db.addSubject(input);
    setSubjects((prev) => [...prev, row]);
  });

  const removeSubject = guard(async (id) => {
    await db.deleteSubject(id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setSessions((prev) => prev.filter((s) => s.subject_id !== id));
  });

  const addSession = guard(async (input) => {
    const row = await db.addSession(input);
    setSessions((prev) => [row, ...prev].sort(byNewest));
  });

  const removeSession = guard(async (id) => {
    await db.deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  });

  return {
    subjects,
    sessions,
    status,
    loadError,
    actionError,
    busy,
    reload: load,
    addSubject,
    removeSubject,
    addSession,
    removeSession,
  };
}
