import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
  BriefIn,
  ChatCommandOut,
  CheckoutOut,
  DnsCheckResult,
  ProjectOut,
  ProjectSettings,
  ProjectSummary,
  PublishOut,
  Tariff,
  Token,
  User,
} from "../types/api";
import type { RootState } from "./store";
import type { SiteSchema } from "../types/site";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["Project", "Settings"],
  endpoints: (builder) => ({
    register: builder.mutation<User, { email: string; password: string }>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    login: builder.mutation<Token, { email: string; password: string }>({
      query: ({ email, password }) => {
        const form = new URLSearchParams();
        form.set("username", email);
        form.set("password", password);
        return {
          url: "/auth/login",
          method: "POST",
          body: form,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        };
      },
    }),
    me: builder.query<User, void>({
      query: () => "/auth/me",
    }),
    listProjects: builder.query<ProjectSummary[], void>({
      query: () => "/projects",
      providesTags: ["Project"],
    }),
    getProject: builder.query<ProjectOut, string>({
      query: (id) => `/projects/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Project", id }],
    }),
    deleteProject: builder.mutation<void, string>({
      query: (id) => ({ url: `/projects/${id}`, method: "DELETE" }),
      invalidatesTags: ["Project"],
    }),
    generateProject: builder.mutation<ProjectOut, BriefIn>({
      query: (body) => ({ url: "/projects/generate", method: "POST", body }),
      invalidatesTags: ["Project"],
    }),
    updateSite: builder.mutation<void, { projectId: string; site_data: SiteSchema }>({
      query: ({ projectId, site_data }) => ({
        url: `/projects/${projectId}/site`,
        method: "PUT",
        body: { site_data },
      }),
      invalidatesTags: (_res, _err, { projectId }) => [{ type: "Project", id: projectId }],
    }),
    chatCommand: builder.mutation<ChatCommandOut, { projectId: string; message: string }>({
      query: ({ projectId, message }) => ({
        url: `/projects/${projectId}/chat`,
        method: "POST",
        body: { message },
      }),
    }),
    generateImage: builder.mutation<{ url: string; remaining_today: number }, { projectId: string; prompt: string }>({
      query: ({ projectId, prompt }) => ({
        url: `/projects/${projectId}/images`,
        method: "POST",
        body: { prompt },
      }),
    }),
    getSettings: builder.query<ProjectSettings, string>({
      query: (projectId) => `/projects/${projectId}/settings`,
      providesTags: (_res, _err, projectId) => [{ type: "Settings", id: projectId }],
    }),
    updateSettings: builder.mutation<ProjectSettings, { projectId: string; settings: ProjectSettings }>({
      query: ({ projectId, settings }) => ({
        url: `/projects/${projectId}/settings`,
        method: "PUT",
        body: settings,
      }),
      invalidatesTags: (_res, _err, { projectId }) => [{ type: "Settings", id: projectId }],
    }),
    checkDomain: builder.mutation<DnsCheckResult, string>({
      query: (projectId) => ({ url: `/projects/${projectId}/settings/check-domain`, method: "POST" }),
    }),
    publishProject: builder.mutation<PublishOut, string>({
      query: (projectId) => ({ url: `/projects/${projectId}/publish`, method: "POST" }),
      invalidatesTags: (_res, _err, projectId) => [{ type: "Project", id: projectId }],
    }),
    checkout: builder.mutation<CheckoutOut, { tariff: Tariff; return_url?: string }>({
      query: (body) => ({ url: "/billing/checkout", method: "POST", body }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useMeQuery,
  useListProjectsQuery,
  useGetProjectQuery,
  useDeleteProjectMutation,
  useGenerateProjectMutation,
  useUpdateSiteMutation,
  useChatCommandMutation,
  useGenerateImageMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useCheckDomainMutation,
  usePublishProjectMutation,
  useCheckoutMutation,
} = api;
