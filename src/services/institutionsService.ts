import { INSTITUTIONS_DATA, Institution, InstitutionData } from '../data/institutions';
import { isSupabaseConfigured, selectFromSupabase } from '../lib/supabaseRest';

type InstitutionRow = Record<string, any>;
type SchoolTypeRow = Record<string, any>;
type SchoolTypeLabelMap = Record<string, string>;

const tableName = process.env.SUPABASE_INSTITUTIONS_TABLE || 'schools';
const schoolTypesTableName = process.env.SUPABASE_SCHOOL_TYPES_TABLE || 'school_types';

const regionLabelMap: Record<string, string> = {
  other_south_america: '其他南美国家',
  us_midwest_flagship: '美国中西部旗舰',
  us_south_southwest: '美国南方与西南',
  other_europe: '其他欧洲国家',
  us_california_flagship: '美国加州旗舰',
  us_northeast_top: '美国东北强校',
  other_africa: '其他非洲国家',
  nordics: '北欧',
  other_asia: '其他亚洲国家',
};

const countryCodeLabelMap: Record<string, string> = {
  AR: '阿根廷',
  AU: '澳大利亚',
  BR: '巴西',
  CA: '加拿大',
  CD: '刚果（金）',
  CI: '科特迪瓦',
  CL: '智利',
  CN: '中国',
  CO: '哥伦比亚',
  CR: '哥斯达黎加',
  CU: '古巴',
  DE: '德国',
  DZ: '阿尔及利亚',
  EG: '埃及',
  ET: '埃塞俄比亚',
  FI: '芬兰',
  FR: '法国',
  GB: '英国',
  GH: '加纳',
  GT: '危地马拉',
  HN: '洪都拉斯',
  ID: '印度尼西亚',
  IN: '印度',
  IT: '意大利',
  JP: '日本',
  KE: '肯尼亚',
  KR: '韩国',
  MA: '摩洛哥',
  ML: '马里',
  MU: '毛里求斯',
  MX: '墨西哥',
  NG: '尼日利亚',
  NI: '尼加拉瓜',
  NL: '荷兰',
  NO: '挪威',
  NZ: '新西兰',
  PA: '巴拿马',
  PL: '波兰',
  PR: '波多黎各',
  SD: '苏丹',
  SE: '瑞典',
  SG: '新加坡',
  SN: '塞内加尔',
  SV: '萨尔瓦多',
  TH: '泰国',
  TN: '突尼斯',
  TZ: '坦桑尼亚',
  UG: '乌干达',
  US: '美国',
  ZA: '南非',
  ZM: '赞比亚',
  ZW: '津巴布韦',
};

const firstValue = (...values: unknown[]) => {
  return values.find(value => value !== undefined && value !== null && value !== '');
};

const toRegionLabel = (value: unknown): string | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const key = String(value).trim();
  return regionLabelMap[key] || countryCodeLabelMap[key.toUpperCase()] || key;
};

const toDisplayString = (value: unknown): string | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (Array.isArray(value)) return value.map(toDisplayString).filter(Boolean).join('、') || undefined;
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
  const text = String(value).trim();
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
    } catch {
      // Plain CSV, pipe, semicolon, and Postgres array strings are handled below.
    }

    const normalized = trimmed.startsWith('{') && trimmed.endsWith('}')
      ? trimmed.slice(1, -1)
      : trimmed;

    return normalized
      .split(/[,;|]/)
      .map(item => item.replace(/^"|"$/g, '').trim())
      .filter(Boolean);
  }
  const displayValue = toDisplayString(value);
  return displayValue ? [displayValue] : undefined;
};

const toUniqueStrings = (values: Array<string | undefined>) => {
  return Array.from(new Set(values.map(value => value?.trim()).filter(Boolean) as string[]));
};

const toLookupKey = (value: string) => value.trim().toLowerCase();

const buildSchoolTypeLabelMap = (rows: SchoolTypeRow[]): SchoolTypeLabelMap => {
  return rows.reduce<SchoolTypeLabelMap>((labels, row) => {
    const code = toDisplayString(row.code);
    const label = toDisplayString(firstValue(row.display_name_zh, row.displayNameZh, row.display_name, row.displayName));
    if (!code || !label) return labels;

    labels[code] = label;
    labels[toLookupKey(code)] = label;
    return labels;
  }, {});
};

const loadSchoolTypeLabels = async (): Promise<SchoolTypeLabelMap> => {
  try {
    const rows = await selectFromSupabase<SchoolTypeRow>(schoolTypesTableName, {
      select: 'code,display_name_zh,display_name',
    });
    if (!rows.length) {
      console.warn('School types table returned 0 rows. If Supabase has data, check anon SELECT/RLS policy for school_types.');
    }
    return buildSchoolTypeLabelMap(rows);
  } catch (error) {
    console.warn('School type labels are unavailable; using raw school_type codes.', error);
    return {};
  }
};

const resolveSchoolTypeLabel = (row: InstitutionRow, schoolTypeLabels: SchoolTypeLabelMap): string | undefined => {
  const code = toDisplayString(firstValue(row.schoolType, row.school_type));
  if (!code) return undefined;
  return schoolTypeLabels[code] || schoolTypeLabels[toLookupKey(code)] || code;
};

const toRank = (row: InstitutionRow): string | undefined => {
  const explicitRank = firstValue(row.rank, row.ranking);
  if (explicitRank) return String(explicitRank);

  const rankSources = [
    ['QS A&D', firstValue(row.qs_art_design_rank, row.qsArtDesignRank)],
    ['QS Architecture', firstValue(row.qs_architecture_built_environment_rank, row.qsArchitectureBuiltEnvironmentRank)],
    ['QS Arts', firstValue(row.qs_art_humanities_rank, row.qsArtHumanitiesRank)],
    ['QS History of Art', firstValue(row.qs_history_of_art_rank, row.qsHistoryOfArtRank)],
    ['QS Overall', firstValue(row.qs_overall_rank, row.qsOverallRank, row.qs_rank, row.qsRank, row.ranking_qs)],
  ] as const;

  const found = rankSources.find(([, value]) => value !== undefined && value !== null && value !== '');
  return found ? `${found[0]} #${found[1]}` : undefined;
};

const toAdmissionDifficulty = (row: InstitutionRow): string | undefined => {
  const difficulty = firstValue(row.admissionDifficulty, row.admission_difficulty, row.acceptance_rate, row.admission_rate);
  if (difficulty) return String(difficulty);

  const tier = firstValue(row.school_tier, row.schoolTier);
  return tier ? `Tier ${tier}` : undefined;
};

const toRadarData = (row: InstitutionRow): Institution['radarData'] | undefined => {
  const radar = firstValue(row.radarData, row.radar_data);
  if (radar && typeof radar === 'object') return radar as Institution['radarData'];

  const radarData = {
    academic: Number(firstValue(row.academic, row.academic_score, row.academicScore, 0)),
    employment: Number(firstValue(row.employment, row.employment_score, row.employmentScore, 0)),
    facility: Number(firstValue(row.facility, row.facility_score, row.facilityScore, 0)),
    cost: Number(firstValue(row.cost, row.cost_score, row.costScore, 0)),
    reputation: Number(firstValue(row.reputation, row.reputation_score, row.reputationScore, 0)),
    innovation: Number(firstValue(row.innovation, row.innovation_score, row.innovationScore, 0)),
  };

  return Object.values(radarData).some(Boolean) ? radarData : undefined;
};

const mapInstitutionRow = (row: InstitutionRow, schoolTypeLabels: SchoolTypeLabelMap): { region: string; institution: Institution } => {
  const country = firstValue(row.country, row.country_name, row.countryName, row.raw_country, row.rawCountry, row.country_code);
  const city = firstValue(row.city, row.city_name, row.cityName);
  const location = String(firstValue(row.location, [city, country].filter(Boolean).join(', '), country, '未知地区'));
  const region = String(
    firstValue(
      toRegionLabel(row.raw_country),
      toRegionLabel(row.rawCountry),
      toRegionLabel(row.country),
      toRegionLabel(row.country_name),
      toRegionLabel(row.countryName),
      toRegionLabel(row.region),
      toRegionLabel(row.area),
      toRegionLabel(row.market),
      toRegionLabel(row.region_tag),
      toRegionLabel(row.regionTag),
      toRegionLabel(row.country_code),
      '其他'
    )
  );
  const id = String(firstValue(row.id, row.uuid, row.slug, row.name_zh, row.name, row.name_en, crypto.randomUUID()));
  const name = String(firstValue(row.name_zh, row.chinese_name, row.name, row.title, '未命名院校'));
  const originalName = toDisplayString(firstValue(row.originalName, row.original_name, row.en_name, row.english_name, row.name_en));
  const lookupKeys = toUniqueStrings([
    id,
    toDisplayString(row.id),
    toDisplayString(row.uuid),
    toDisplayString(row.slug),
    toDisplayString(row.school_id),
    toDisplayString(row.name),
    toDisplayString(row.name_zh),
    toDisplayString(row.chinese_name),
    toDisplayString(row.title),
    toDisplayString(row.name_en),
    originalName,
    name,
  ]);
  const campusImages = toStringArray(firstValue(row.campus_image_urls, row.campusImageUrls));
  const featureTags = toStringArray(firstValue(row.featureTags, row.feature_tags, row.tags));
  const strengthDisciplines = toStringArray(firstValue(row.strengthDisciplines, row.strength_disciplines, row.strength_discipline));

  return {
    region,
    institution: {
      id,
      lookupKeys,
      name,
      originalName,
      location,
      description: String(firstValue(row.description_en, row.summary_en, row.intro_en, row.overview_en, row.description, row.summary, row.intro, row.overview, '')),
      image: String(firstValue(row.image, row.image_url, row.cover_url, row.cover, campusImages?.[0], row.logo_url, `https://picsum.photos/seed/${id}/800/600`)),
      notableAlumni: toStringArray(firstValue(row.notableAlumni, row.notable_alumni, row.alumni)),
      foundedYear: toDisplayString(firstValue(row.foundedYear, row.founded_year, row.year_founded, row.established_year)),
      schoolType: resolveSchoolTypeLabel(row, schoolTypeLabels),
      schoolTier: toDisplayString(firstValue(row.schoolTier, row.school_tier)),
      applicationDeadline: toDisplayString(firstValue(row.applicationDeadline, row.application_deadline, row.deadline)),
      entryScoreRequirements: toDisplayString(firstValue(row.entryScoreRequirements, row.entry_score_requirements)),
      rank: toRank(row),
      admissionDifficulty: toAdmissionDifficulty(row),
      portfolioReq: toDisplayString(firstValue(row.portfolioReq, row.portfolio_req, row.portfolio_requirement)),
      annualCost: toDisplayString(firstValue(row.annualCost, row.annual_cost, row.tuition, row.cost_text)),
      employmentRate: toDisplayString(firstValue(row.employmentRate, row.employment_rate)),
      studentFacultyRatio: toDisplayString(firstValue(row.studentFacultyRatio, row.student_faculty_ratio)),
      scholarshipRate: toDisplayString(firstValue(row.scholarshipRate, row.scholarship_rate)),
      campusFacility: toDisplayString(firstValue(row.campusFacility, row.campus_facility, row.facilities)),
      majorStrengths: toStringArray(firstValue(row.majorStrengths, row.major_strengths, row.strengths, strengthDisciplines, featureTags)),
      featureTags,
      strengthDisciplines,
      alumniNetwork: toDisplayString(firstValue(row.alumniNetwork, row.alumni_network)),
      radarData: toRadarData(row),
    },
  };
};

const groupInstitutionRows = (rows: InstitutionRow[], schoolTypeLabels: SchoolTypeLabelMap): InstitutionData => {
  return rows.reduce<InstitutionData>((groups, row) => {
    const { region, institution } = mapInstitutionRow(row, schoolTypeLabels);
    groups[region] = groups[region] || [];
    groups[region].push(institution);
    return groups;
  }, {});
};

export async function loadInstitutionData(): Promise<InstitutionData> {
  if (!isSupabaseConfigured) return INSTITUTIONS_DATA;

  try {
    const [rows, schoolTypeLabels] = await Promise.all([
      selectFromSupabase<InstitutionRow>(tableName, { select: '*' }),
      loadSchoolTypeLabels(),
    ]);
    if (!rows.length) return INSTITUTIONS_DATA;
    return groupInstitutionRows(rows, schoolTypeLabels);
  } catch (error) {
    console.warn('Falling back to local institution data.', error);
    return INSTITUTIONS_DATA;
  }
}
