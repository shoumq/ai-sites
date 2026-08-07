import { Link, useParams } from "react-router-dom";

import { useGetProjectQuery } from "../app/api";
import SitePreview from "../components/SitePreview";
import { pageLabel } from "../utils/pageLabels";

// Автономный просмотр сайта — без топбара, панели редактора и рамок выделения,
// ровно то, что увидит посетитель. Открывается в отдельной вкладке из редактора.
export default function PreviewPage() {
  const { projectId = "", pageSlug } = useParams();
  const { data: project, isLoading } = useGetProjectQuery(projectId, { skip: !projectId });

  if (isLoading) {
    return <div className="preview-loading">Загружаем сайт…</div>;
  }

  const pages = project?.site_data?.pages ?? [];
  const page = (pageSlug ? pages.find((p) => p.slug === pageSlug) : pages[0]) ?? pages[0];
  if (!project || !page) {
    return (
      <div className="preview-loading">
        Сайт ещё не сгенерирован.
        <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>
          На дашборд
        </Link>
      </div>
    );
  }

  return (
    <div className="preview-standalone">
      <div className="preview-toolbar">
        <Link to={`/editor/${projectId}`} className="preview-back-btn" title="Вернуться в редактор">
          ← Редактор
        </Link>
        {pages.length > 1 && (
          <div className="preview-page-tabs">
            {pages.map((p) => (
              <Link
                key={p.slug}
                to={`/preview/${projectId}/${p.slug}`}
                className={`preview-page-tab${p.slug === page.slug ? " active" : ""}`}
              >
                {pageLabel(p.slug, p.title)}
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="container">
        <SitePreview page={page} theme={project.site_data.theme} readOnly />
      </div>
    </div>
  );
}
