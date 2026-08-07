import { Link } from "react-router-dom";

import { useDeleteProjectMutation, useListProjectsQuery, useMeQuery } from "../app/api";
import { useAppDispatch } from "../app/hooks";
import { logout } from "../features/auth/authSlice";

const STATUS_LABELS: Record<string, string> = {
  draft: "Черновик",
  generating: "Генерируется",
  ready: "Готов",
  published: "Опубликован",
};

const TARIFF_LABELS: Record<string, string> = {
  trial: "Бесплатный",
  basic: "Базовый",
  business: "Бизнес",
};

const TYPE_ICONS: Record<string, string> = {
  landing: "🚀",
  shop: "🛍️",
  multipage: "📄",
  crm: "🗂️",
};

export default function DashboardPage() {
  const { data: projects, isLoading } = useListProjectsQuery();
  const { data: me } = useMeQuery();
  const [deleteProject] = useDeleteProjectMutation();
  const dispatch = useAppDispatch();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Мои сайты</h1>
          {me && <span className="hint">Тариф: {TARIFF_LABELS[me.tariff]}</span>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/new" className="btn btn-primary">
            + Новый сайт
          </Link>
          <button type="button" className="btn" onClick={() => dispatch(logout())}>
            Выйти
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="project-grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="project-card">
              <div className="project-card-thumb skeleton" style={{ background: "none" }} />
              <div className="skeleton" style={{ height: 14, borderRadius: 4, width: "70%" }} />
              <div className="skeleton" style={{ height: 18, borderRadius: 999, width: 70 }} />
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!projects || projects.length === 0) && (
        <div className="empty-state">
          <div className="empty-state-icon">✨</div>
          <div className="empty-state-title">Пока нет ни одного сайта</div>
          <p>Опишите бренд в двух словах — ИИ соберёт лендинг за минуту.</p>
          <Link to="/new" className="btn btn-primary" style={{ marginTop: 16 }}>
            Создать первый сайт →
          </Link>
          <div>
            <span className="empty-state-example">💬 «Уютная кофейня с домашней выпечкой в центре города»</span>
          </div>
        </div>
      )}

      <div className="project-grid">
        {projects?.map((p) => (
          <div key={p.id} className="project-card">
            <Link to={`/editor/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="project-card-thumb">{TYPE_ICONS[p.type] ?? "🌐"}</div>
              <h3>{p.name}</h3>
              <span className="status-badge">{STATUS_LABELS[p.status] ?? p.status}</span>
            </Link>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              {p.status !== "draft" && p.status !== "generating" && (
                <Link
                  to={`/preview/${p.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{ flex: 1 }}
                  title="Открыть сайт без панелей редактора"
                >
                  👁 Просмотр
                </Link>
              )}
              <button
                type="button"
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={() => {
                  if (window.confirm(`Удалить проект «${p.name}»?`)) deleteProject(p.id);
                }}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
