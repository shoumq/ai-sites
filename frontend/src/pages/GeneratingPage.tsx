import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../app/hooks";
import { api } from "../app/api";
import { completed, failed, progressReceived, reset, startConnecting } from "../features/funnel/generationSlice";
import type { BriefIn } from "../types/api";

const TIMER_SECONDS = 60;

const STAGE_LABELS = ["Тексты", "Вёрстка", "Изображения", "Сборка"];

export default function GeneratingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const generation = useAppSelector((s) => s.generation);
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const socketRef = useRef<WebSocket | null>(null);

  const brief = location.state as BriefIn | null;

  useEffect(() => {
    if (!brief || !token) return;

    // React 18 StrictMode запускает эффект дважды в dev (mount → cleanup → mount).
    // Без этого флага «устаревший» сокет первого прохода мог продиспатчить
    // ошибку уже поверх успешно идущей генерации второго прохода.
    let cancelled = false;

    dispatch(startConnecting());
    setSecondsLeft(TIMER_SECONDS);

    const ws = new WebSocket(`${import.meta.env.VITE_WS_BASE_URL}/ws/generate?token=${encodeURIComponent(token)}`);
    socketRef.current = ws;

    ws.onopen = () => {
      if (!cancelled) ws.send(JSON.stringify(brief));
    };
    ws.onmessage = (event) => {
      if (cancelled) return;
      const payload = JSON.parse(event.data);
      if (payload.type === "progress") {
        dispatch(progressReceived(payload));
      } else if (payload.type === "done") {
        dispatch(completed(payload.project.id));
        dispatch(api.util.invalidateTags(["Project"]));
      } else if (payload.type === "error") {
        dispatch(failed(payload.message ?? "Ошибка генерации"));
      }
    };
    ws.onerror = () => {
      if (!cancelled) dispatch(failed("Не удалось подключиться к серверу генерации."));
    };

    return () => {
      cancelled = true;
      ws.close();
      dispatch(reset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brief, token]);

  useEffect(() => {
    if (generation.status === "done" || generation.status === "error") return;
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, generation.status]);

  useEffect(() => {
    if (generation.status === "done" && generation.resultProjectId) {
      navigate(`/editor/${generation.resultProjectId}`, { replace: true });
    }
  }, [generation.status, generation.resultProjectId, navigate]);

  if (!brief) return <Navigate to="/new" replace />;

  const currentStep = generation.progress?.step ?? 0;
  const progressPct = generation.progress ? (generation.progress.step / generation.progress.total_steps) * 100 : 5;

  return (
    <div className="generating">
      <span className="ai-badge">✨ ИИ-оркестратор работает</span>
      <h2 style={{ marginTop: 14 }}>Создаём ваш сайт «{brief.brand_name}»</h2>
      <div className="generating-timer">{secondsLeft}с</div>

      <div className="progress-steps">
        {STAGE_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const state = stepNum < currentStep || generation.status === "done" ? "done" : stepNum === currentStep ? "current" : "";
          return (
            <div key={label} className={`progress-step ${state}`}>
              <span className="progress-step-dot" />
              {label}
            </div>
          );
        })}
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progressPct}%` }} />
      </div>
      <div className="progress-message">
        {generation.status === "error"
          ? generation.error
          : (generation.progress?.message ?? "Подключаемся к ИИ-оркестратору…")}
      </div>
      {generation.status === "error" && (
        <button type="button" className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => navigate("/new")}>
          Попробовать снова
        </button>
      )}
    </div>
  );
}
