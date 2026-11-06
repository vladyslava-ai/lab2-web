# Трекер навчання, лабораторна робота №2

Сайт із першої лабораторної, переписаний на React (Vite). Дані про предмети й сесії навчання зберігаються в базі PostgreSQL (Supabase) і малюються на сторінці динамічно.

## Що в проєкті

```
lab2/
├── index.html              точка входу Vite
├── package.json            залежності й команди (npm run dev)
├── vite.config.js
├── .env.example            шаблон для ключів Supabase
├── supabase/
│   └── schema.sql          таблиці, права доступу й приклади даних для PostgreSQL
└── src/
    ├── main.jsx            запуск React
    ├── App.jsx             збирає сторінку з компонентів
    ├── styles.css          стилі (світла й темна тема)
    ├── components/         Header, Hero, Tracker, Journal, WeekChart, Features, Steps, форми
    ├── hooks/useTracker.js стан застосунку: завантаження з бази, додавання й видалення
    ├── lib/db.js           робота з базою (Supabase) і демо-режим без неї
    ├── lib/stats.js        підрахунок тижня й серії днів
    ├── lib/time.js         дати й формати часу
    └── data/content.js     тексти розділів «Можливості» та «Як це працює»
```

## Що вимагає завдання і де це в коді

- **Основи React.** Сторінка складається з компонентів у `src/components`. Стан зберігається через `useState`, завантаження даних відбувається в `useEffect` (`src/hooks/useTracker.js`).
- **Динамічний рендеринг контенту.** Предмети, сесії, стовпчики графіка, можливості й кроки малюються з масивів через `.map()`: `Tracker.jsx`, `Journal.jsx`, `WeekChart.jsx`, `Features.jsx`, `Steps.jsx`. Після будь-якої дії (додати, видалити) сторінка оновлюється без перезавантаження.
- **База даних.** PostgreSQL у Supabase: таблиці `subjects` і `sessions` (`supabase/schema.sql`). Запити до неї написані в `src/lib/db.js`.

## Запуск, крок за кроком

**1. Node.js.** Для React потрібен Node.js. Завантажте версію LTS з nodejs.org, встановіть із налаштуваннями за замовчуванням і перезапустіть VS Code. Перевірка в терміналі VS Code:
```
node -v
```
Має вивестися версія 18 або новіша.

**2. Проєкт у VS Code.** File → Open Folder → папка `lab2`. Коли з'явиться пропозиція встановити рекомендовані розширення, погодьтеся.

**3. База даних у Supabase.**
1. Відкрийте supabase.com → Start your project → увійдіть через GitHub.
2. New project: назва `study-tracker`, придумайте пароль бази й збережіть його, регіон найближчий (наприклад, Frankfurt). Натисніть Create new project і зачекайте 1–2 хвилини.
3. Ліворуч відкрийте **SQL Editor** → **New query**. У VS Code відкрийте `supabase/schema.sql`, скопіюйте весь вміст, вставте в редактор Supabase й натисніть **Run**. Має з'явитися повідомлення про успіх (Success).
4. Перевірте: **Table Editor** → таблиці `subjects` (4 рядки) і `sessions` (11 рядків).

**4. Ключі.** У Supabase: Project Settings → **API Keys** (або кнопка **Connect** угорі). Знадобляться два значення: **Project URL** і публічний ключ (**anon public** або **Publishable key**, обидва підходять). Секретний ключ (**service_role**, **secret**) нікуди вставляти не можна.

У папці проєкту створіть файл `.env` (скопіюйте `.env.example` і змініть назву), вставте свої значення:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=ваш_публічний_ключ
```

**5. Запуск.** У терміналі VS Code (Terminal → New Terminal):
```
npm install
npm run dev
```
Браузер відкриє `http://localhost:5173`. Якщо ключі вказано правильно, у картці трекера буде напис «Дані зберігаються в базі PostgreSQL (Supabase)». Якщо там «Демо-режим», `.env` не підхопився: перевірте назву файлу й змінних та перезапустіть `npm run dev` (Ctrl+C, потім знову команда).

**6. Перевірка бази.** Додайте сесію й оновіть сторінку (F5): сесія має залишитися. У Supabase в **Table Editor** → `sessions` з'явиться новий рядок.

Без ключів сторінка теж працює, але в демо-режимі: дані живуть лише до перезавантаження.

## Git

Створіть на github.com порожній репозиторій `lab2-web` (Public, без README), а потім у терміналі VS Code в папці `lab2`:
```
git init
git add .
git commit -m "Lab 2: React interface with PostgreSQL"
git branch -M main
git remote add origin https://github.com/vladyslava-ai/lab2-web.git
git push -u origin main
```
Файл `.env` із ключами в репозиторій не потрапить: він указаний у `.gitignore`.

## Скріншоти для звіту

1. Структура проєкту у VS Code (папка `src` із компонентами).
2. Результат `node -v` і `npm run dev` у терміналі.
3. Сторінка в браузері на `localhost:5173`.
4. Таблиця `sessions` у Supabase (Table Editor).
5. Новий предмет або сесія, додані через форму, і той самий запис у Supabase.
6. Репозиторій `lab2-web` на GitHub.

## Про безпеку ключів

Публічний ключ Supabase призначений для браузера, тож те, що він видимий у коді сторінки, нормально. На час лабораторної в базі дозволено будь-які дії з цим ключем (`supabase/schema.sql`, політики `lab open access`). У лабораторній №4 додамо вхід користувачів і обмежимо доступ.
