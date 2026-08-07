import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { CheckIcon } from "../components/icons";
import type { BriefIn, SiteGoal, SiteType, StylePreset } from "../types/api";

const SITE_TYPES: { value: SiteType; label: string; desc: string }[] = [
  { value: "landing", label: "Лендинг", desc: "1 страница, форма захвата" },
  { value: "shop", label: "Интернет-магазин", desc: "Каталог + корзина + оплата" },
  { value: "multipage", label: "Многостраничник", desc: "Главная, услуги, контакты, о нас" },
  { value: "crm", label: "CRM-портал", desc: "Личный кабинет с документами и чатом" },
];

const STYLES: { value: StylePreset; label: string; desc: string; swatch: string }[] = [
  { value: "business", label: "Деловой", desc: "Синий/серый, Sans-Serif", swatch: "#2563EB" },
  { value: "warm", label: "Тёплый", desc: "Бежевый/зелёный — кафе, beauty", swatch: "#C17A4E" },
  { value: "techno", label: "Техно", desc: "Тёмная тема с неоном — для IT", swatch: "#7C3AED" },
  { value: "custom", label: "Свой стиль", desc: "Загрузите логотип и выберите HEX-цвет", swatch: "#111827" },
];

const GOALS: { value: SiteGoal; label: string }[] = [
  { value: "sales", label: "Продажи" },
  { value: "booking", label: "Запись клиентов" },
  { value: "portfolio", label: "Портфолио" },
  { value: "info", label: "Информирование" },
];

export default function FunnelPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [siteType, setSiteType] = useState<SiteType | null>(null);
  const [style, setStyle] = useState<StylePreset | null>(null);
  const [customHex, setCustomHex] = useState("#2563EB");
  const [brandName, setBrandName] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState<SiteGoal>("sales");

  const canGoNext = (step === 0 && siteType) || (step === 1 && style) || step === 2;

  const handleGenerate = () => {
    if (!siteType || !style || !brandName.trim() || !description.trim()) return;
    const brief: BriefIn = {
      site_type: siteType,
      style,
      custom_hex_color: style === "custom" ? customHex : null,
      brand_name: brandName.trim(),
      description: description.trim(),
      goal,
    };
    navigate("/generating", { state: brief });
  };

  return (
    <div className="funnel">
      <div className="funnel-steps">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`funnel-step-dot${i <= step ? " active" : ""}`} />
        ))}
      </div>

      {step === 0 && (
        <>
          <h2>Какой сайт создаём?</h2>
          <p className="funnel-subtitle">Выберите тип — от него зависит структура и набор блоков.</p>
          <div className="card-grid">
            {SITE_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                className={`choice-card${siteType === t.value ? " selected" : ""}`}
                onClick={() => setSiteType(t.value)}
              >
                <h3>{t.label}</h3>
                <p>{t.desc}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <h2>Выберите настроение</h2>
          <p className="funnel-subtitle">Визуальный пресет: цвета и шрифт сайта.</p>
          <div className="card-grid">
            {STYLES.map((s) => (
              <button
                key={s.value}
                type="button"
                className={`choice-card${style === s.value ? " selected" : ""}`}
                onClick={() => setStyle(s.value)}
              >
                <div className="mood-swatch" style={{ background: s.swatch }} />
                <h3>{s.label}</h3>
                <p>{s.desc}</p>
              </button>
            ))}
          </div>
          {style === "custom" && (
            <div className="field" style={{ marginTop: 16 }}>
              <label className="label">HEX-цвет бренда</label>
              <input className="input" type="color" value={customHex} onChange={(e) => setCustomHex(e.target.value)} />
            </div>
          )}
        </>
      )}

      {step === 2 && (
        <>
          <h2>Расскажите о бренде</h2>
          <p className="funnel-subtitle">Это и есть промпт для ИИ — чем точнее опишете, тем точнее будут тексты сайта.</p>

          <div className="prompt-card">
            <span className="ai-badge" style={{ marginBottom: 18 }}>
              ✨ Отсюда начинается генерация
            </span>
            <div className="field">
              <label className="label">Название компании / бренда</label>
              <div className="field-control-wrap">
                <input
                  className={`input${brandName.trim().length > 1 ? " valid" : ""}`}
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  maxLength={120}
                  placeholder="Например, «Кафе Ромашка»"
                />
                {brandName.trim().length > 1 && (
                  <span className="valid-check">
                    <CheckIcon />
                  </span>
                )}
              </div>
            </div>
            <div className="field">
              <label className="label">Чем занимаетесь?</label>
              <textarea
                className="textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                maxLength={500}
                rows={4}
                placeholder="Например: уютная кофейня в центре города с домашней выпечкой и авторскими десертами"
              />
              <div className="char-count">{description.length} / 500</div>
            </div>
          </div>

          <div className="field" style={{ marginTop: 20 }}>
            <label className="label">Какая главная цель сайта?</label>
            <select className="select" value={goal} onChange={(e) => setGoal(e.target.value as SiteGoal)}>
              {GOALS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="funnel-nav">
        <button type="button" className="btn" onClick={() => (step === 0 ? navigate("/") : setStep(step - 1))}>
          Назад
        </button>
        {step < 2 ? (
          <button type="button" className="btn btn-primary" disabled={!canGoNext} onClick={() => setStep(step + 1)}>
            Далее
          </button>
        ) : (
          <button type="button" className="btn btn-primary" disabled={!brandName.trim() || !description.trim()} onClick={handleGenerate}>
            Сгенерировать
          </button>
        )}
      </div>
    </div>
  );
}
