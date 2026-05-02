import { INSTITUTIONS_DATA, Institution, InstitutionData } from '../data/institutions';
import { isSupabaseConfigured, selectFromSupabase } from '../lib/supabaseRest';

type InstitutionRow = Record<string, any>;

const tableName = process.env.SUPABASE_INSTITUTIONS_TABLE || 'schools';

const firstValue = (...values: unknown[]) => {
  return values.find(value => value !== undefined && value !== null && value !== '');
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
  const region = String(firstValue(row.region, row.area, row.market, row.region_tag, row.regionTag, row.raw_country, row.rawCountry, country, '其他'));
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
      rank: toRank(row),
      admissionDifficulty: toAdmissionDifficulty(row),
      portfolioReq: firstValue(row.portfolioReq, row.portfolio_req, row.portfolio_requirement, row.entry_score_requirements) as string | undefined,
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
