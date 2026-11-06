-- Трекер навчання: структура бази даних (PostgreSQL, Supabase)
-- Виконайте весь файл один раз: SQL Editor -> New query -> вставити -> Run.

-- Предмети й тижневі цілі
create table if not exists subjects (
  id           bigint generated always as identity primary key,
  name         text not null check (char_length(btrim(name)) between 1 and 60),
  goal_minutes integer not null check (goal_minutes between 10 and 6000),
  created_at   timestamptz not null default now()
);

-- Сесії навчання: кожна належить предмету
create table if not exists sessions (
  id         bigint generated always as identity primary key,
  subject_id bigint not null references subjects (id) on delete cascade,
  minutes    integer not null check (minutes between 1 and 720),
  note       text check (note is null or char_length(note) <= 200),
  studied_on date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists sessions_studied_on_idx on sessions (studied_on);

-- Права доступу.
-- Row Level Security увімкнено, але на час лабораторної дозволено всі дії
-- з публічним ключем. У лабораторній №4 додамо вхід користувачів і обмежимо доступ.
alter table subjects enable row level security;
alter table sessions enable row level security;

drop policy if exists "lab open access" on subjects;
drop policy if exists "lab open access" on sessions;
create policy "lab open access" on subjects for all to anon using (true) with check (true);
create policy "lab open access" on sessions for all to anon using (true) with check (true);

grant select, insert, update, delete on subjects, sessions to anon;

-- Приклади даних. Дати рахуються від сьогодні, тому графік тижня одразу заповнений.
-- Блок спрацює, лише якщо таблиця предметів порожня.
do $$
begin
  if not exists (select 1 from subjects) then
    insert into subjects (name, goal_minutes) values
      ('Python', 360),
      ('SQL', 300),
      ('Англійська', 240),
      ('Математика', 180);

    insert into sessions (subject_id, minutes, note, studied_on)
    select s.id, v.minutes, v.note, current_date - v.ago
    from (values
      (6, 'Python',      60, 'Цикли та функції'),
      (5, 'SQL',         90, 'JOIN і підзапити'),
      (5, 'Англійська',  30, 'Нові слова за темою «робота»'),
      (4, 'Python',      45, 'Словники та списки'),
      (4, 'Математика',  30, 'Матриці'),
      (3, 'SQL',         60, 'Віконні функції'),
      (3, 'Англійська',  30, 'Аудіювання'),
      (2, 'Python',      45, 'Pandas: перші кроки'),
      (1, 'SQL',         60, 'Групування й агрегати'),
      (1, 'Математика',  30, 'Ймовірність'),
      (0, 'Англійська',  30, 'Читання статті')
    ) as v (ago, subject, minutes, note)
    join subjects s on s.name = v.subject;
  end if;
end $$;
