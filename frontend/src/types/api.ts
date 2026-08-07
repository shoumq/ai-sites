import type { SiteSchema, Theme } from "./site";

export type Tariff = "trial" | "basic" | "business";

export interface User {
  id: string;
  email: string;
  tariff: Tariff;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export type SiteType = "landing" | "shop" | "multipage" | "crm";
export type StylePreset = Theme["style"];
export type SiteGoal = "sales" | "booking" | "portfolio" | "info";

export interface BriefIn {
  site_type: SiteType;
  style: StylePreset;
  custom_hex_color?: string | null;
  brand_name: string;
  description: string;
  goal: SiteGoal;
}

export type ProjectStatus = "draft" | "generating" | "ready" | "published";

export interface ProjectSummary {
  id: string;
  name: string;
  type: SiteType;
  status: ProjectStatus;
  updated_at: string;
}

export interface ProjectOut {
  id: string;
  name: string;
  type: SiteType;
  style: StylePreset;
  status: ProjectStatus;
  site_data: SiteSchema;
  settings: Record<string, unknown>;
  published_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface GenerationProgress {
  stage: string;
  step: number;
  total_steps: number;
  message: string;
}

export interface ChatCommandOut {
  reply: string;
  applied: boolean;
  site_data: SiteSchema;
}

export interface DomainSettings {
  custom_domain: string;
  subdomain: string;
  dns_verified: boolean;
}

export interface SeoSettings {
  title: string;
  description: string;
  keywords: string;
}

export interface LegalSettings {
  add_pd_consent: boolean;
  inn: string;
  ogrn: string;
}

export interface IntegrationSettings {
  yookassa_enabled: boolean;
  yandex_metrika_id: string;
  dgis_enabled: boolean;
  whatsapp_widget_phone: string;
}

export interface ProjectSettings {
  domain: DomainSettings;
  seo: SeoSettings;
  legal: LegalSettings;
  integrations: IntegrationSettings;
}

export interface DnsCheckResult {
  domain: string;
  verified: boolean;
  expected_record: string;
  detail: string;
}

export interface PublishOut {
  url: string;
}

export interface CheckoutOut {
  payment_id: string;
  confirmation_url: string;
  amount: number;
}
