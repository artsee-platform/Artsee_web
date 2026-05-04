import { INSTITUTIONS_DATA, Institution, InstitutionData } from '../data/institutions';
import { isSupabaseConfigured, selectFromSupabase } from '../lib/supabaseRest';

type InstitutionRow = Record<string, any>;

const tableName = process.env.SUPABASE_INSTITUTIONS_TABLE || 'schools';

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

const toStringArray = (value: unknown): string[] | undefined => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      // Plain comma-separated strings are handled below.
    }
    return value.split(',').map(item => item.trim()).filter(Boolean);
  }
  return undefined;
};

const toDisplayString = (value: unknown): string | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (Array.isArray(value)) return value.map(String).filter(Boolean).join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
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

const mapInstitutionRow = (row: InstitutionRow): { region: string; institution: Institution } => {
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
  const campusImages = toStringArray(firstValue(row.campus_image_urls, row.campusImageUrls));

  return {
    region,
    institution: {
      id,
      name: String(firstValue(row.name, row.name_zh, row.chinese_name, row.title, '未命名院校')),
      originalName: firstValue(row.originalName, row.original_name, row.en_name, row.english_name, row.name_en) as string | undefined,
      location,
      description: String(firstValue(row.description, row.summary, row.intro, row.overview, '')),
      image: String(firstValue(row.image, row.image_url, row.cover_url, row.cover, campusImages?.[0], row.logo_url, `https://picsum.photos/seed/${id}/800/600`)),
      notableAlumni: toStringArray(firstValue(row.notableAlumni, row.notable_alumni, row.alumni)),
      schoolType: toDisplayString(firstValue(row.schoolType, row.school_type)),
      schoolTier: toDisplayString(firstValue(row.schoolTier, row.school_tier)),
      applicationDeadline: toDisplayString(firstValue(row.applicationDeadline, row.application_deadline, row.deadline)),
      entryScoreRequirements: toDisplayString(firstValue(row.entryScoreRequirements, row.entry_score_requirements)),
      rank: toRank(row),
      admissionDifficulty: toAdmissionDifficulty(row),
      portfolioReq: firstValue(row.portfolioReq, row.portfolio_req, row.portfolio_requirement) as string | undefined,
      annualCost: firstValue(row.annualCost, row.annual_cost, row.tuition, row.cost_text) as string | undefined,
      employmentRate: firstValue(row.employmentRate, row.employment_rate) as string | undefined,
      studentFacultyRatio: firstValue(row.studentFacultyRatio, row.student_faculty_ratio) as string | undefined,
      scholarshipRate: firstValue(row.scholarshipRate, row.scholarship_rate) as string | undefined,
      campusFacility: firstValue(row.campusFacility, row.campus_facility, row.facilities) as string | undefined,
      majorStrengths: toStringArray(firstValue(row.majorStrengths, row.major_strengths, row.strengths, row.strength_disciplines, row.feature_tags, row.tags)),
      alumniNetwork: firstValue(row.alumniNetwork, row.alumni_network) as string | undefined,
      radarData: toRadarData(row),
    },
  };
};

const groupInstitutionRows = (rows: InstitutionRow[]): InstitutionData => {
  return rows.reduce<InstitutionData>((groups, row) => {
    const { region, institution } = mapInstitutionRow(row);
    groups[region] = groups[region] || [];
    groups[region].push(institution);
    return groups;
  }, {});
};

export async function loadInstitutionData(): Promise<InstitutionData> {
  if (!isSupabaseConfigured) return INSTITUTIONS_DATA;

  try {
    const rows = await selectFromSupabase<InstitutionRow>(tableName, { select: '*' });
    if (!rows.length) return INSTITUTIONS_DATA;
    return groupInstitutionRows(rows);
  } catch (error) {
    console.warn('Falling back to local institution data.', error);
    return INSTITUTIONS_DATA;
  }
}
