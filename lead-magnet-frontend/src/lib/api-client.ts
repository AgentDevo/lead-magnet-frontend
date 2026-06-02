import axios from 'axios';
import { useAuthStore } from '@/store/auth';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LeadMagnet {
  id: string;
  title: string;
  type: 'ebook' | 'checklist' | 'guide' | 'template' | 'webinar_signup';
  content: string;
  status: 'draft' | 'active' | 'archived';
  pdf_url?: string;
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  created_at: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ success: boolean; data: { user: { id: string; email: string; fullName?: string; subscriptionTier?: string }; token: string; expiresIn: string } }>(
      '/auth/login-supabase', { email, password }
    ),
  signup: (email: string, password: string, fullName: string) =>
    api.post<{ success: boolean; data: { user: { id: string; email: string; fullName?: string }; message: string; code: string } }>(
      '/auth/signup-supabase', { email, password, fullName }
    ),
  logout: () => api.post('/auth/logout'),
};

export const magnetApi = {
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<{ success: boolean; data: { magnets: LeadMagnet[]; pagination: Pagination } }>(
      '/lead-magnets', { params }
    ),
  get: (id: string) =>
    api.get<{ success: boolean; data: LeadMagnet }>(`/lead-magnets/${id}`),
  create: (data: { title: string; description?: string; magnetType: string; content: string }) =>
    api.post<{ success: boolean; data: LeadMagnet }>('/lead-magnets', data),
  update: (id: string, data: { title?: string; description?: string; magnetType?: string; content?: string; status?: string }) =>
    api.put<{ success: boolean; data: LeadMagnet }>(`/lead-magnets/${id}`, data),
  remove: (id: string) =>
    api.delete<{ success: boolean; data: { id: string; deleted: boolean } }>(`/lead-magnets/${id}`),
  generatePdf: (leadMagnetId: string, title: string, content: string) =>
    api.post('/pdf/generate', { leadMagnetId, title, content, format: 'A4' }, { responseType: 'blob' }),
};

export const templateApi = {
  list: () =>
    api.get<{ success: boolean; data: { templates: Template[]; count: number } }>('/templates'),
};

// ── AI ─────────────────────────────────────────────────────────────────────

export const aiApi = {
  generate: (data: { title: string; magnetType: string; audience?: string; tone?: string }) =>
    api.post<{ success: boolean; data: { content: string } }>('/ai/generate', data),
};

// ── Landing Pages ──────────────────────────────────────────────────────────

export interface LandingPage {
  id: string;
  lead_magnet_id: string;
  slug: string;
  title: string;
  description?: string;
  form_config: { ctaText: string; requireFullName: boolean; submitLabel: string; successMessage: string };
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  lead_magnets?: { id: string; title: string; type: string };
}

export const landingPageApi = {
  list: () =>
    api.get<{ success: boolean; data: { pages: LandingPage[] } }>('/landing-pages'),
  get: (id: string) =>
    api.get<{ success: boolean; data: LandingPage }>(`/landing-pages/${id}`),
  create: (data: { leadMagnetId: string; slug: string; title: string; description?: string; ctaText?: string; requireFullName?: boolean }) =>
    api.post<{ success: boolean; data: LandingPage }>('/landing-pages', data),
  update: (id: string, data: { title?: string; description?: string; ctaText?: string; requireFullName?: boolean; isPublished?: boolean; successMessage?: string }) =>
    api.put<{ success: boolean; data: LandingPage }>(`/landing-pages/${id}`, data),
  remove: (id: string) =>
    api.delete<{ success: boolean; data: { id: string; deleted: boolean } }>(`/landing-pages/${id}`),
};

// -- Leads ------------------------------------------------------------------

export interface Lead {
  id: string;
  email: string;
  full_name: string | null;
  landing_page_id: string;
  landing_page: { title: string; slug: string } | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  gdpr_consent: boolean;
  created_at: string;
}

export const leadsApi = {
  list: (params?: { pageId?: string; page?: number; limit?: number }) =>
    api.get<{ success: boolean; data: { leads: Lead[]; total: number; page: number; limit: number } }>(
      "/leads", { params }
    ),
};

// -- Analytics --------------------------------------------------------------

export interface PageAnalytics {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  views: number;
  leads: number;
  conversion_rate: number;
  top_source: string | null;
}

export interface AnalyticsTotals {
  views: number;
  leads: number;
}

export interface UtmSource {
  source: string;
  count: number;
}

export const analyticsApi = {
  get: () =>
    api.get<{ success: boolean; data: { pages: PageAnalytics[]; totals: AnalyticsTotals; sources: UtmSource[] } }>("/analytics"),
};

// -- Webhooks ---------------------------------------------------------------

export interface Webhook {
  id: string;
  url: string;
  secret: string;
  events: string[];
  is_active: boolean;
  created_at: string;
}

export const webhookApi = {
  list: () =>
    api.get<{ success: boolean; data: { webhooks: Webhook[] } }>("/webhooks"),
  create: (data: { url: string; events?: string[] }) =>
    api.post<{ success: boolean; data: Webhook }>("/webhooks", data),
  update: (id: string, data: { url?: string; events?: string[]; isActive?: boolean }) =>
    api.put<{ success: boolean; data: Webhook }>(`/webhooks/${id}`, data),
  remove: (id: string) =>
    api.delete<{ success: boolean; data: { id: string; deleted: boolean } }>(`/webhooks/${id}`),
};
