import type { MouseEvent, ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { usePreviewMode } from "./PreviewModeContext";

// nav_items/footer links хранят href вида "services.html" — так и должно быть
// для статической выгрузки (publish.py кладёт страницы плоско рядом, обычная
// относительная ссылка работает сама). Но внутри SPA (редактор и автономный
// /preview/:projectId/:pageSlug) относительный "services.html" резолвится
// браузером от ТЕКУЩЕГО пути и на /preview/{projectId} (без слага) подменяет
// собой сегмент projectId — получаем /preview/services.html и 422 от API.
// Поэтому здесь ".html"-ссылки перехватываются и уводятся через react-router
// по слагу, а обычные "#anchor"-ссылки (одностраничники) не трогаем.
function slugFromHref(href: string): string | null {
  const match = href.match(/^([\w-]+)\.html$/);
  if (!match) return null;
  return match[1] === "index" ? "main" : match[1];
}

export default function SiteNavLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const { readOnly } = usePreviewMode();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const slug = slugFromHref(href);

  if (slug && readOnly && projectId) {
    const to = `/preview/${projectId}/${slug}`;
    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      navigate(to);
    };
    return (
      <a href={to} className={className} onClick={handleClick}>
        {children}
      </a>
    );
  }

  if (slug && !readOnly) {
    // В редакторе переход между страницами многостраничника — через вкладки
    // .page-tabs, а не клик по контенту; здесь просто гасим уход со страницы.
    return (
      <a href={href} className={className} onClick={(event) => event.preventDefault()}>
        {children}
      </a>
    );
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
