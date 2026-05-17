# Artiqore 艺见心 Web

艺见心前端 Web 应用，面向艺术留学、院校检索、院校对比、AI 问答、社区内容和用户工作台等场景。

当前前端使用 Vite + React + TypeScript 构建，并通过 Supabase REST API 读取院校、专业和院校对比指标数据。

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Motion
- Supabase REST API
- Gemini API

## Local Development

Install dependencies:

```bash
npm install
```

Create a local env file:

```bash
cp .env.example .env.local
```

Fill `.env.local` with the required public frontend values. Do not commit `.env.local`.

Start the dev server:

```bash
npm run dev
```

The default Vite URL is:

```text
http://localhost:3000/
```

To run on a specific port:

```bash
npm run dev -- --host 0.0.0.0 --port 3002
```

## Environment Variables

Required for AI features:

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
GEMINI_MODEL="gemini-3-flash-preview"
```

Required for Supabase-backed data:

```env
SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_PUBLIC_KEY"
SUPABASE_INSTITUTIONS_TABLE="schools"
SUPABASE_SCHOOL_TYPES_TABLE="school_types"
SUPABASE_PROGRAMS_TABLE="programs"
SUPABASE_SCHOOL_RADAR_METRICS_TABLE="school_radar_metrics"
```

Only use the Supabase anon public key in frontend env files. Never place a `service_role` key in this repo.

## Data Integration

The main Supabase-backed frontend services are:

- `src/services/institutionsService.ts`
  - Reads school records from `schools`
  - Reads school type labels from `school_types`
  - Reads radar metrics from `school_radar_metrics`
  - Merges radar metrics into each institution by `school_id`

- `src/services/programsService.ts`
  - Reads program records from `programs`
  - Groups programs by institution/school identity

The radar chart used by the comparison center expects six normalized scores:

- `academic_score`
- `employment_score`
- `facility_score`
- `cost_score`
- `reputation_score`
- `innovation_score`

The SQL view definition for `school_radar_metrics` lives in:

```text
docs/supabase-school-radar-metrics-view.sql
```

## Institution Filters

The institution page filters are implemented in:

```text
src/views/InstitutionsView.tsx
```

Current filter sources:

- Region tag: `schools.region_tag`
- School type: `schools.school_type`, displayed through `school_types`
- Strength discipline: `schools.strength_disciplines`

`strength_disciplines` keeps the raw Supabase values, but the frontend computes broader user-facing categories through `strengthCategoryRules`. A school appears in a category when any raw strength discipline matches that category.

Region tags are also displayed through a frontend Chinese label map, while preserving the original Supabase value for filtering.

## Useful Commands

Type-check the app:

```bash
npm run lint
```

Build the production bundle:

```bash
npm run build
```

Preview a production build:

```bash
npm run preview
```

Clean build output:

```bash
npm run clean
```

## Git Notes

Recommended commit message for the latest institution filter work:

```bash
feat: add localized institution filters
```

Before pushing, confirm the target remote:

```bash
git remote -v
```

The intended organization repository is:

```text
https://github.com/artsee-platform/Artsee_web.git
```
