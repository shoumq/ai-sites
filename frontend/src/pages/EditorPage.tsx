import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useGenerateImageMutation, useGetProjectQuery, useMeQuery, usePublishProjectMutation, useUpdateSiteMutation } from "../app/api";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import BlockCarousel from "../features/editor/BlockCarousel";
import ChatPanel from "../features/editor/ChatPanel";
import ConstructorPanel from "../features/editor/ConstructorPanel";
import { createDefaultSection } from "../features/editor/sectionFactory";
import { selectSection, setActiveTab, setPreviewMode } from "../features/editor/editorUiSlice";
import SitePreview from "../components/SitePreview";
import { pageLabel } from "../utils/pageLabels";
import type { Section, SectionType, SiteSchema } from "../types/site";

const TAB_LABELS = { constructor: "Конструктор", blocks: "Блоки", chat: "ИИ-Чат" } as const;

export default function EditorPage() {
  const { projectId = "" } = useParams();
  const dispatch = useAppDispatch();
  const { selectedSectionId, activeTab, previewMode } = useAppSelector((s) => s.editorUi);
  const token = useAppSelector((s) => s.auth.token);
  const { data: me } = useMeQuery();

  const { data: project, isLoading } = useGetProjectQuery(projectId, { skip: !projectId });
  const [updateSite] = useUpdateSiteMutation();
  const [generateImage, { isLoading: imageGenerating }] = useGenerateImageMutation();
  const [publishProject, { isLoading: publishing }] = usePublishProjectMutation();

  const [site, setSite] = useState<SiteSchema | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [draggingBlockType, setDraggingBlockType] = useState<SectionType | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const loadedProjectId = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (project && loadedProjectId.current !== project.id) {
      setSite(project.site_data);
      loadedProjectId.current = project.id;
      setCurrentPageIndex(0);
    }
  }, [project]);

  useEffect(() => {
    if (!site || !project || loadedProjectId.current !== project.id) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updateSite({ projectId, site_data: site });
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  if (isLoading || !site) {
    return <div className="generating">Загружаем проект…</div>;
  }

  const pageIndex = Math.min(currentPageIndex, site.pages.length - 1);
  const page = site.pages[pageIndex];
  const selectedSection: Section | null = page.sections.find((s) => s.id === selectedSectionId) ?? null;

  const updateSection = (id: string, patch: Record<string, unknown>) => {
    setSite((prev) =>
      prev
        ? {
            ...prev,
            pages: prev.pages.map((p, i) =>
              i === pageIndex ? { ...p, sections: p.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)) } : p,
            ),
          }
        : prev,
    );
  };

  const updateTheme = (patch: Record<string, unknown>) => {
    setSite((prev) => (prev ? { ...prev, theme: { ...prev.theme, ...patch } } : prev));
  };

  const deleteSection = (id: string) => {
    setSite((prev) =>
      prev
        ? { ...prev, pages: prev.pages.map((p, i) => (i === pageIndex ? { ...p, sections: p.sections.filter((s) => s.id !== id) } : p)) }
        : prev,
    );
    dispatch(selectSection(null));
  };

  const switchPage = (index: number) => {
    setCurrentPageIndex(index);
    dispatch(selectSection(null));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as { kind?: string; blockType?: SectionType } | undefined;
    if (data?.kind === "library" && data.blockType) setDraggingBlockType(data.blockType);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event;
    const blockType = draggingBlockType;
    setDraggingBlockType(null);
    if (!blockType || !over) return;
    const overId = String(over.id);
    if (!overId.startsWith("gap-")) return;
    const index = Number(overId.slice(4));
    const newSection = createDefaultSection(blockType);
    setSite((prev) => {
      if (!prev) return prev;
      const sections = prev.pages[pageIndex].sections.slice();
      sections.splice(index, 0, newSection);
      return { ...prev, pages: prev.pages.map((p, i) => (i === pageIndex ? { ...p, sections } : p)) };
    });
    dispatch(selectSection(newSection.id));
    dispatch(setActiveTab("constructor"));
  };

  const handleGenerateImage = async (field: "bg_image" | "image") => {
    if (!selectedSection) return;
    const promptText =
      "title" in selectedSection && selectedSection.title
        ? `${selectedSection.title}, ${site.theme.style} style`
        : `${project?.name ?? "сайт"}, ${site.theme.style} style`;
    try {
      const result = await generateImage({ projectId, prompt: promptText }).unwrap();
      updateSection(selectedSection.id, { [field]: result.url });
    } catch {
      // ошибка (например, исчерпан дневной лимит) — сообщаем пользователю
      window.alert("Не удалось сгенерировать изображение. Возможно, исчерпан дневной лимит на вашем тарифе.");
    }
  };

  const handlePublish = async () => {
    try {
      const result = await publishProject(projectId).unwrap();
      setPublishedUrl(result.url);
    } catch {
      window.alert("Не удалось опубликовать сайт. Попробуйте ещё раз.");
    }
  };

  const handleExport = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/projects/${projectId}/export`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      window.alert("Экспорт кода доступен только на тарифе «Бизнес».");
      return;
    }
    const pages = (await res.json()) as Record<string, string>;
    const blob = new Blob([JSON.stringify(pages, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project?.name ?? "site"}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="editor-shell">
        <div className="editor-topbar">
          <div className="editor-topbar-left">
            <Link to="/" className="icon-btn" title="К проектам">
              ←
            </Link>
            <strong>{project?.name}</strong>
            {project?.status && <span className="status-badge">{project.status}</span>}
          </div>
          <div className="editor-topbar-right">
            <button
              type="button"
              className={`icon-btn${previewMode === "desktop" ? " active" : ""}`}
              title="Десктоп"
              onClick={() => dispatch(setPreviewMode("desktop"))}
            >
              🖥
            </button>
            <button
              type="button"
              className={`icon-btn${previewMode === "mobile" ? " active" : ""}`}
              title="Мобильный"
              onClick={() => dispatch(setPreviewMode("mobile"))}
            >
              📱
            </button>
            <Link to={`/editor/${projectId}/settings`} className="icon-btn" title="Настройки">
              ⚙
            </Link>
            <Link to={`/preview/${projectId}`} target="_blank" rel="noopener noreferrer" className="btn" title="Открыть сайт в отдельной вкладке, без панелей">
              👁 Просмотр
            </Link>
            {me?.tariff === "business" && (
              <button type="button" className="btn" onClick={handleExport}>
                Экспорт кода
              </button>
            )}
            <button type="button" className="btn btn-primary" onClick={handlePublish} disabled={publishing}>
              {publishing ? "Публикуем…" : "Опубликовать"}
            </button>
          </div>
        </div>

        {publishedUrl && (
          <div style={{ padding: "8px 16px", background: "#ecfdf5", fontSize: 13 }}>
            Сайт опубликован: <a href={publishedUrl.startsWith("http") ? publishedUrl : `https://${publishedUrl}`} target="_blank" rel="noreferrer">{publishedUrl}</a>
          </div>
        )}

        {site.pages.length > 1 && (
          <div className="page-tabs">
            {site.pages.map((p, i) => (
              <button
                key={p.slug}
                type="button"
                className={`page-tab${i === pageIndex ? " active" : ""}`}
                onClick={() => switchPage(i)}
              >
                {pageLabel(p.slug, p.title)}
              </button>
            ))}
          </div>
        )}

        <div className="editor-body">
          <div className="editor-preview-wrap">
            <div className={`editor-preview-frame${previewMode === "mobile" ? " mobile" : ""}`}>
              <SitePreview
                page={page}
                theme={site.theme}
                selectedSectionId={selectedSectionId}
                onSelect={(id) => dispatch(selectSection(id || null))}
                onUpdateSection={updateSection}
                insertMode={!!draggingBlockType}
              />
            </div>
          </div>

          <div className="editor-panel">
            <div className="panel-tabs">
              {(Object.keys(TAB_LABELS) as (keyof typeof TAB_LABELS)[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`panel-tab${activeTab === tab ? " active" : ""}`}
                  onClick={() => dispatch(setActiveTab(tab))}
                >
                  {TAB_LABELS[tab]}
                </button>
              ))}
            </div>
            <div className="panel-content">
              {activeTab === "constructor" && (
                <ConstructorPanel
                  theme={site.theme}
                  selectedSection={selectedSection}
                  onUpdateTheme={updateTheme}
                  onUpdateSection={updateSection}
                  onDeleteSection={deleteSection}
                  onGenerateImage={handleGenerateImage}
                  imageGenerating={imageGenerating}
                />
              )}
              {activeTab === "blocks" && <BlockCarousel />}
              {activeTab === "chat" && (
                <ChatPanel
                  projectId={projectId}
                  onApplied={(newSite) => {
                    setSite(newSite);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
}
