import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useCheckDomainMutation, useGetSettingsQuery, useUpdateSettingsMutation } from "../app/api";
import { CheckIcon } from "../components/icons";
import type { DnsCheckResult, ProjectSettings } from "../types/api";

const EMPTY_SETTINGS: ProjectSettings = {
  domain: { custom_domain: "", subdomain: "", dns_verified: false },
  seo: { title: "", description: "", keywords: "" },
  legal: { add_pd_consent: true, inn: "", ogrn: "" },
  integrations: { yookassa_enabled: false, yandex_metrika_id: "", dgis_enabled: false, whatsapp_widget_phone: "" },
};

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return <button type="button" className={`toggle${on ? " on" : ""}`} onClick={onClick} aria-pressed={on} />;
}

export default function SettingsPage() {
  const { projectId = "" } = useParams();
  const { data, isLoading } = useGetSettingsQuery(projectId, { skip: !projectId });
  const [updateSettings] = useUpdateSettingsMutation();
  const [checkDomain, { isLoading: checking }] = useCheckDomainMutation();

  const [settings, setSettings] = useState<ProjectSettings>(EMPTY_SETTINGS);
  const [dnsResult, setDnsResult] = useState<DnsCheckResult | null>(null);
  const loaded = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (data && !loaded.current) {
      setSettings(data);
      loaded.current = true;
    }
  }, [data]);

  useEffect(() => {
    if (!loaded.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updateSettings({ projectId, settings });
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const patchDomain = (p: Partial<ProjectSettings["domain"]>) => setSettings((s) => ({ ...s, domain: { ...s.domain, ...p } }));
  const patchSeo = (p: Partial<ProjectSettings["seo"]>) => setSettings((s) => ({ ...s, seo: { ...s.seo, ...p } }));
  const patchLegal = (p: Partial<ProjectSettings["legal"]>) => setSettings((s) => ({ ...s, legal: { ...s.legal, ...p } }));
  const patchIntegrations = (p: Partial<ProjectSettings["integrations"]>) =>
    setSettings((s) => ({ ...s, integrations: { ...s.integrations, ...p } }));

  const handleCheckDomain = async () => {
    try {
      const result = await checkDomain(projectId).unwrap();
      setDnsResult(result);
      if (result.verified) patchDomain({ dns_verified: true });
    } catch {
      window.alert("Не удалось проверить домен. Убедитесь, что он указан в настройках.");
    }
  };

  if (isLoading) return <div className="settings-page">Загружаем настройки…</div>;

  return (
    <div className="settings-page">
      <Link to={`/editor/${projectId}`} className="hint">
        ← Вернуться в редактор
      </Link>
      <h1>Настройки сайта</h1>

      <div className="settings-card">
        <h2>Домены</h2>
        <div className="field">
          <label className="label">Свой домен</label>
          <input
            className="input"
            placeholder="example.ru"
            value={settings.domain.custom_domain}
            onChange={(e) => patchDomain({ custom_domain: e.target.value, dns_verified: false })}
          />
        </div>
        <button type="button" className="btn" disabled={checking || !settings.domain.custom_domain} onClick={handleCheckDomain}>
          {checking ? "Проверяем…" : "Проверить DNS"}
        </button>
        {dnsResult && (
          <div className={`dns-result ${dnsResult.verified ? "verified" : "unverified"}`}>
            {dnsResult.verified && <CheckIcon />}
            {dnsResult.detail}
          </div>
        )}
      </div>

      <div className="settings-card">
        <h2>SEO-настройки</h2>
        <div className="field">
          <label className="label">Title</label>
          <input
            className="input"
            placeholder="Кафе Ромашка — уютная кофейня в центре города"
            value={settings.seo.title}
            onChange={(e) => patchSeo({ title: e.target.value })}
          />
        </div>
        <div className="field">
          <label className="label">Description</label>
          <textarea
            className="textarea"
            placeholder="Домашняя выпечка, авторские десерты и бесплатный Wi-Fi. Открыты каждый день с 8:00."
            value={settings.seo.description}
            onChange={(e) => patchSeo({ description: e.target.value })}
          />
        </div>
        <div className="field">
          <label className="label">Keywords</label>
          <input
            className="input"
            placeholder="кофейня, кафе, десерты, доставка"
            value={settings.seo.keywords}
            onChange={(e) => patchSeo({ keywords: e.target.value })}
          />
        </div>
      </div>

      <div className="settings-card">
        <h2>Законность (152-ФЗ)</h2>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Автоматически добавить согласие на обработку ПД</div>
            <div className="settings-row-hint">Баннер согласия появится внизу каждой страницы</div>
          </div>
          <Toggle on={settings.legal.add_pd_consent} onClick={() => patchLegal({ add_pd_consent: !settings.legal.add_pd_consent })} />
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label className="label">ИНН</label>
          <input className="input" placeholder="7712345678" value={settings.legal.inn} onChange={(e) => patchLegal({ inn: e.target.value })} />
        </div>
        <div className="field">
          <label className="label">ОГРН</label>
          <input className="input" placeholder="1157746112233" value={settings.legal.ogrn} onChange={(e) => patchLegal({ ogrn: e.target.value })} />
        </div>
      </div>

      <div className="settings-card">
        <h2>Интеграции</h2>
        <div className="settings-row">
          <div className="settings-row-label">ЮKassa</div>
          <Toggle on={settings.integrations.yookassa_enabled} onClick={() => patchIntegrations({ yookassa_enabled: !settings.integrations.yookassa_enabled })} />
        </div>
        <div className="field">
          <label className="label">Яндекс.Метрика — номер счётчика</label>
          <input
            className="input"
            placeholder="Например, 98765432"
            value={settings.integrations.yandex_metrika_id}
            onChange={(e) => patchIntegrations({ yandex_metrika_id: e.target.value })}
          />
        </div>
        <div className="settings-row">
          <div className="settings-row-label">2ГИС (iframe на карте контактов)</div>
          <Toggle on={settings.integrations.dgis_enabled} onClick={() => patchIntegrations({ dgis_enabled: !settings.integrations.dgis_enabled })} />
        </div>
        <div className="field">
          <label className="label">WhatsApp-виджет — номер телефона</label>
          <input
            className="input"
            placeholder="+7900..."
            value={settings.integrations.whatsapp_widget_phone}
            onChange={(e) => patchIntegrations({ whatsapp_widget_phone: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
