import { useMemo } from "react";
import { useTracker } from "./hooks/useTracker.js";
import { computeStats } from "./lib/stats.js";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Journal from "./components/Journal.jsx";
import WeekChart from "./components/WeekChart.jsx";
import Features from "./components/Features.jsx";
import Steps from "./components/Steps.jsx";

export default function App() {
  const tracker = useTracker();
  const stats = useMemo(
    () => computeStats(tracker.subjects, tracker.sessions),
    [tracker.subjects, tracker.sessions]
  );

  return (
    <>
      <a className="skip" href="#main">Перейти до вмісту</a>
      <Header />
      <main id="main">
        <div id="top" />
        <Hero tracker={tracker} stats={stats} />
        <Journal tracker={tracker} />
        <WeekChart perDay={stats.perDay} />
        <Features />
        <Steps />
      </main>
      <footer className="wrap foot">
        <p>Влада Кушнір, «Трекер навчання».</p>
        <a href="#top">На початок сторінки</a>
      </footer>
    </>
  );
}
