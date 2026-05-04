import { InstitutionProgram, ProgramsByInstitution } from '../data/programs';
import { isSupabaseConfigured, selectFromSupabase } from '../lib/supabaseRest';

type ProgramRow = Record<string, any>;

const tableName = process.env.SUPABASE_PROGRAMS_TABLE || 'programs';

const firstValue = (...values: unknown[]) => {
  return values.find(value => value !== undefined && value !== null && value !== '');
};

const toDisplayString = (value: unknown): string | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (Array.isArray(value)) return value.map(toDisplayString).filter(Boolean).join('、') || undefined;
  if (typeof value === 'boolean') return value ? '是' : '否';
  if (typeof value === 'object') {
    const objectValue = value as Record<string, unknown>;
    const label = firstValue(
      objectValue.name_zh,
      objectValue.label_zh,
      objectValue.title_zh,
      objectValue.name,
      objectValue.label,
      objectValue.title,
      objectValue.name_en
    );
    return label ? String(label).trim() : JSON.stringify(value);
  }
  const rawText = String(value).trim();
  if (!rawText) return undefined;

  if (
    (rawText.startsWith('"') && rawText.endsWith('"')) ||
    (rawText.startsWith("'") && rawText.endsWith("'")) ||
    (rawText.startsWith('[') && rawText.endsWith(']')) ||
    (rawText.startsWith('{') && rawText.endsWith('}'))
  ) {
    try {
      const parsed = JSON.parse(rawText);
      const parsedDisplay = toDisplayString(parsed);
      if (parsedDisplay) return parsedDisplay;
    } catch {
      // Fall through to quote cleanup.
    }
  }

  const text = rawText.replace(/^["']|["']$/g, '').trim();
  return text || undefined;
};

const toStringArray = (value: unknown): string[] | undefined => {
  if (Array.isArray(value)) return value.map(toDisplayString).filter(Boolean) as string[];
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map(toDisplayString).filter(Boolean) as string[];
      if (typeof parsed === 'string') return toStringArray(parsed);
    } catch {
      // Plain CSV, pipe, semicolon, and Postgres array strings are handled below.
    }

    const normalized = trimmed.startsWith('{') && trimmed.endsWith('}')
      ? trimmed.slice(1, -1)
      : trimmed;

    return normalized
      .replace(/^["']|["']$/g, '')
      .split(/[,;|\n]/)
      .map(item => item.replace(/^"|"$/g, '').trim())
      .filter(Boolean);
  }
  const displayValue = toDisplayString(value);
  return displayValue ? [displayValue] : undefined;
};

const toBoolean = (value: unknown): boolean | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  const normalized = String(value).replace(/^["']|["']$/g, '').trim().toLowerCase();
  if (['true', 'yes', 'y', '1'].includes(normalized)) return true;
  if (['false', 'no', 'n', '0'].includes(normalized)) return false;
  return undefined;
};

const toNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const numericValue = Number(String(value).replace(/^["']|["']$/g, '').trim());
  return Number.isFinite(numericValue) ? numericValue : undefined;
};

const toUniqueStrings = (values: Array<string | undefined>) => {
  return Array.from(new Set(values.map(value => value?.trim()).filter(Boolean) as string[]));
};

const mapProgramRow = (row: ProgramRow): InstitutionProgram | null => {
  const schoolKeys = toUniqueStrings([
    toDisplayString(firstValue(row.school_id, row.schoolId, row.schools_id, row.institution_id, row.institutionId, row.school_uuid, row.schoolUuid)),
    toDisplayString(firstValue(row.school_slug, row.schoolSlug, row.institution_slug, row.institutionSlug)),
    toDisplayString(firstValue(row.school_name, row.schoolName, row.school_title, row.institution_name, row.institutionName)),
    toDisplayString(firstValue(row.school_name_zh, row.schoolNameZh, row.school_zh, row.institution_name_zh)),
    toDisplayString(firstValue(row.school_name_en, row.schoolNameEn, row.school_en, row.institution_name_en)),
    toDisplayString(firstValue(row.school?.id, row.school?.name, row.school?.name_zh, row.school?.name_en)),
    toDisplayString(firstValue(row.schools?.id, row.schools?.name, row.schools?.name_zh, row.schools?.name_en)),
  ]);
  if (!schoolKeys.length) return null;

  const id = String(firstValue(row.id, row.uuid, row.slug, `${schoolKeys[0]}-${row.program_name || row.name_zh || row.name || row.name_en || crypto.randomUUID()}`));
  const name = String(
    firstValue(
      row.name_zh,
      row.title_zh,
      row.program_name,
      row.name,
      row.title,
      row.name_en,
      row.english_name,
      '未命名专业'
    )
  );
  const degreeType = toDisplayString(firstValue(row.degree_type, row.degree, row.degree_label, row.degreeLabel));
  const degreeFullName = toDisplayString(firstValue(row.degree_full_name, row.degree_name, row.degreeName));
  const category = toDisplayString(firstValue(row.program_category, row.category, row.category_name));
  const overview = toDisplayString(firstValue(row.program_overview, row.overview, row.description, row.summary));
  const highlights = toStringArray(firstValue(row.program_highlights, row.highlights, row.feature_tags));
  const duration = toDisplayString(firstValue(row.duration_text, row.duration, row.program_duration, row.length));
  const studyMode = toDisplayString(firstValue(row.study_mode, row.mode, row.learning_mode));
  const intakeMonths = toStringArray(firstValue(row.intake_months, row.intakes, row.intake));
  const coreCourses = toStringArray(firstValue(row.core_courses, row.curriculum, row.courses));
  const careerPaths = toStringArray(firstValue(row.career_paths, row.careers, row.career_outcomes));

  return {
    id,
    schoolId: schoolKeys[0],
    schoolKeys,
    name,
    originalName: toDisplayString(firstValue(row.originalName, row.original_name, row.name_en, row.en_name, row.english_name, degreeFullName)),
    description: highlights?.join('；') || overview,
    degree: degreeType || degreeFullName,
    degreeType,
    degreeFullName,
    category,
    programCode: toDisplayString(firstValue(row.program_code, row.code)),
    ucasCode: toDisplayString(row.ucas_code),
    duration,
    durationMonths: toNumber(row.duration_months),
    language: toDisplayString(firstValue(row.language, row.teaching_language, row.language_of_instruction)),
    studyMode,
    intakeMonths,
    requiresPortfolio: toBoolean(row.requires_portfolio),
    requiresInterview: toBoolean(row.requires_interview),
    requiresPersonalStatement: toBoolean(row.requires_personal_statement),
    minimumEducation: toDisplayString(row.minimum_education),
    overview,
    highlights,
    accreditationInfo: toDisplayString(row.accreditation_info),
    coreCourses,
    careerPaths,
    admissionSummary: toDisplayString(row.admission_summary),
    coverImageUrl: toDisplayString(row.cover_image_url),
    status: toDisplayString(row.status),
    isRecommended: toBoolean(row.is_recommended),
    tags: toUniqueStrings([
      category,
      ...(toStringArray(firstValue(row.tags, row.art_categories, row.category_tags)) || []),
    ]),
  };
};

const groupProgramRows = (rows: ProgramRow[]): ProgramsByInstitution => {
  return rows.reduce<ProgramsByInstitution>((groups, row) => {
    const program = mapProgramRow(row);
    if (!program) return groups;

    program.schoolKeys?.forEach((schoolKey) => {
      groups[schoolKey] = groups[schoolKey] || [];
      groups[schoolKey].push(program);
    });
    return groups;
  }, {});
};

export async function loadProgramsByInstitution(): Promise<ProgramsByInstitution> {
  if (!isSupabaseConfigured) return {};

  try {
    const rows = await selectFromSupabase<ProgramRow>(tableName, { select: '*' });
    if (!rows.length) {
      console.warn('Programs table returned 0 rows. If Supabase has data, check anon SELECT/RLS policy for the programs table.');
      return {};
    }
    const groupedRows = groupProgramRows(rows);
    if (!Object.keys(groupedRows).length) {
      console.warn('Programs data loaded, but no recognized school linkage field was found.', Object.keys(rows[0] || {}));
    }
    return groupedRows;
  } catch (error) {
    console.warn('Programs data is unavailable.', error);
    return {};
  }
}
