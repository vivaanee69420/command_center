# Pending Work — Command Center OS

## 1. Pages Listed as "Done" but Still Have Hardcoded Data

### `business-performance-page.jsx` — HIGH PRIORITY
- `OPS_DATA` (wait times, chair utilisation, no-show rates, staff efficiency) — all fake numbers per practice
- `LEADS_DATA` (total, qualified, appointments, conversions per practice) — all fake
- `PREV_REVENUE` (last month revenue per practice) — hardcoded
- `SERVICE_MIX` (implants/invisalign/general/cosmetic/emergency % split) — hardcoded
- `LEAD_SOURCES` (Google Ads/Facebook/Website/Referral/Walk-in % split) — hardcoded
- `TRENDS` (group revenue, lead volume, booking rate, no-show, chair util, ad ROI) — hardcoded

**Fix plan:**
- Wire LEADS section to `api.leads()` — compute total/qualified/conversions from real lead stage data
- Wire PREV_REVENUE to `api.revenue()` — compute last month from revenue snapshots
- Mark OPS metrics (chair util, wait time) as "Dentally not connected" instead of showing fake numbers
- SERVICE_MIX and LEAD_SOURCES need Dentally + GHL data — show placeholder until connected

### `practice-dashboard-page.jsx`
- `SEED_TASKS` — hardcoded fallback tasks per practice
- `SEED_LEADS` — hardcoded fallback leads per practice
- `APPOINTMENTS_TODAY` — hardcoded appointments list

**Fix plan:**
- Replace SEED_TASKS with `api.tasks({ business_id })` filtered by practice
- Replace SEED_LEADS with `api.leads()` filtered by business_id
- APPOINTMENTS_TODAY → mark as "Dentally not connected" or remove until Dentally is wired

### `marketing-overview-page.jsx`
- `RECENT_ACTIVITY` — hardcoded activity feed (fake task completions, lead events)

**Fix plan:** Wire to `api.tasks({ status: "done" })` + `api.leads()` to build real activity feed

### `voice-tasks-page.jsx`
- `HISTORY_SEED` — hardcoded past voice session history

**Fix plan:** No backend table for voice history yet. Either add a `voice_session` table + endpoint or remove the history tab until built.

### `user-management-page.jsx`
- `LAST_LOGINS` — hardcoded last login timestamps per user

**Fix plan:** No last_login field on Person model. Add `last_login_at` column to `person` table + update on `/auth/login` + surface via `/api/people`.

---

## 2. Pages Fully Static — No Backend Exists

These pages cannot be wired until backend models/endpoints are built.

| Page | Route | Needs |
|------|-------|-------|
| Content Calendar | `/content-calendar` | Backend model for content posts + scheduling |
| Documents | `/documents` | File upload endpoint (S3/R2) + document model |
| Manus Inbox | `/marketing/manus-inbox` | Messaging backend or GHL inbox proxy |
| Offer Library | `/marketing/offers` | Offer model + CRUD endpoints |
| Content Factory | `/marketing/content-factory` | Content item model + CRUD endpoints |
| Sales Enablement | `/marketing/sales` | Scripts/objections model or static CMS |
| Outsourcer Tracker | `/outsourcer-tracker` | Outsourcer/contractor model + CRUD |
| Competitor Analysis | `/competitor-ai` | AI endpoint + competitor data model |
| Market Intel | `/market-intel` | Research data source or AI endpoint |

---

## 3. External API Keys — What Each Unlocks

### Keys that work now (endpoint + frontend wired):
| Key | Page that benefits |
|-----|-------------------|
| `ANTHROPIC_API_KEY` | AI Brain, ask-brain, directives |
| `GHL_TOKENS` | Conversations proxy |

### Keys that need backend endpoint work:
| Key | Current state | What to build |
|-----|--------------|---------------|
| `AHREFS_API_KEY` | In `.env`, no endpoint | Add `GET /api/seo/backlinks` router + wire `backlinks-page.jsx` and `seo-tracking-page.jsx` |
| `DENTALLY_API_KEY` | In `.env`, worker stub exists | Add `GET /api/dentally/appointments` endpoint + wire `practice-dashboard-page.jsx` appointments, `business-performance-page.jsx` ops metrics |
| `SEMRUSH_API_KEY` | In `.env`, no endpoint | Add `GET /api/seo/rankings` router + wire `seo-tracking-page.jsx` keywords |
| `TWILIO_*` | In `.env`, no endpoint | Wire WhatsApp sending via existing `twilio_whatsapp` integration |
| `RESEND_API_KEY` | In `.env`, no endpoint | Email sending for notifications |

### Keys that require OAuth flow to complete first:
| Key | What to do |
|-----|-----------|
| Google OAuth (GSC) | User must connect via `/api/integrations/google/connect` → then `gsc.py` worker pulls data → add `GET /api/seo/gsc` endpoint → wire `seo-tracking-page.jsx` |
| Google Ads | Same OAuth flow → `google_ads.py` worker pulls → `ads-dashboard-page.jsx` shows real data |
| Meta Ads | `META_SYSTEM_USER_TOKEN` already set → `meta_ads.py` worker runs on schedule → ads page already ready to display |

---

## 4. Backend Workers — Need Real HTTP Calls

All provider workers in `app/workers/` have routing + DB writes in place but HTTP fetch loops are stubbed with `TODO`. These need real API calls:

| Worker | File | Status |
|--------|------|--------|
| Meta Ads | `meta_ads.py` | Stub — needs real Graph API call |
| Google Ads | `google_ads.py` | Stub — needs real Ads API call |
| Google Search Console | `gsc.py` | Stub — needs real Search Console API call |
| Gmail | `gmail.py` | Stub |
| Google Calendar | `calendar.py` | Stub |
| Dentally | `dentally.py` | Stub — needs real Dentally API call |
| GHL | `ghl.py` | Partial — conversations proxy works, contacts/appointments stub |

---

## 5. Backend Model Gaps

| Missing | Needed by |
|---------|-----------|
| `last_login_at` on `Person` | `user-management-page.jsx` last login display |
| `voice_session` table | `voice-tasks-page.jsx` history tab |
| `content_post` table | Content Calendar, Content Factory pages |
| `document` table | Documents page |
| `outsourcer` table | Outsourcer Tracker page |
| `offer` table | Offer Library page |

---

## 6. GHL Dashboard — Appointments + Campaigns

`ghl-dashboard-page.jsx` Appointments and Campaigns tabs are fully hardcoded.

**Fix plan:**
- Appointments: GHL has an appointments API — add `GET /api/ghl/appointments` proxy endpoint (similar to conversations proxy)
- Campaigns: GHL has workflows API — add `GET /api/ghl/campaigns` proxy endpoint
- Both need GHL_TOKENS already set in `.env`

---

## 7. Right Sidebar — Remaining Modal Fixes

4 of 5 `<DialogContent>` modals still missing `bg-white` class — modals appear transparent on some browsers.

File: `new-frontend/src/components/shared/right-sidebar.jsx`

---

## 8. SEO Page — Full Wiring Plan (when ready)

1. Connect Google account via `/api/integrations/google/connect`
2. Uncomment HTTP calls in `app/workers/gsc.py`
3. Add `GET /api/seo/gsc` router endpoint reading `gsc_snapshot` table
4. Add `api.gscData()` to `client.js`
5. Wire `seo-tracking-page.jsx` to replace `KPI_CARDS` and `KEYWORDS` with real GSC data

---

## Priority Order (suggested)

1. Fix `business-performance-page.jsx` — shows fake numbers, high visibility
2. Fix `practice-dashboard-page.jsx` — SEED_TASKS/SEED_LEADS should be real
3. Add `last_login_at` to Person model — easy win for user management
4. Wire Dentally worker HTTP calls — unlocks ops metrics across multiple pages
5. Wire Meta/Google Ads workers — unlocks ads dashboard real data
6. Add GHL appointments proxy endpoint — fixes GHL Dashboard appointments tab
7. Add GSC endpoint — unlocks SEO page
8. Fix right sidebar modal bg-white (4 remaining)
