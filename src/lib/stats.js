import { DAYS, daysAgo } from "./time.js";

// Підсумки за останні 7 днів: хвилини по предметах і по днях, серія днів поспіль
export function computeStats(subjects, sessions) {
  const perSubject = {};
  subjects.forEach((subject) => {
    perSubject[subject.id] = 0;
  });
  const perDay = Array(DAYS).fill(0);

  for (const session of sessions) {
    const ago = daysAgo(session.studied_on);
    if (ago < 0 || ago >= DAYS) continue;
    perDay[ago] += session.minutes;
    if (session.subject_id in perSubject) perSubject[session.subject_id] += session.minutes;
  }

  const total = perDay.reduce((sum, minutes) => sum + minutes, 0);

  // Якщо сьогодні ще нічого немає, серію рахуємо від учорашнього дня
  let streak = 0;
  for (let ago = perDay[0] > 0 ? 0 : 1; ago < DAYS && perDay[ago] > 0; ago++) streak++;

  return { perSubject, perDay, total, streak };
}
