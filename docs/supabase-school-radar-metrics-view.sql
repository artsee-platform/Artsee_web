-- Creates the frontend-facing radar metrics view for the school comparison center.
--
-- Expected upstream tables from the data pipeline:
--   public.schools
--   public.school_comparison_rollups
--   public.school_resource_metrics
--
-- The React app reads this view through the Supabase REST API using:
--   SUPABASE_SCHOOL_RADAR_METRICS_TABLE=school_radar_metrics
--
-- Scoring convention:
--   Every *_score column is normalized to 0-100.
--   Higher is always better. For cost, higher means more affordable.

create or replace view public.school_radar_metrics as
with source as (
  select
    s.id as school_id,
    s.qs_overall_rank,
    s.qs_art_humanities_rank,
    s.qs_architecture_built_environment_rank,
    s.qs_art_design_rank,
    s.qs_history_of_art_rank,
    substring(s.school_tier from '([0-9]+(?:\.[0-9]+)?)')::numeric as school_tier,
    s.feature_tags,
    s.strength_disciplines,
    s.international_students_page,
    scr.median_application_difficulty_score,
    scr.median_international_tuition_fee,
    scr.tuition_dominant_currency_code,
    scr.programs_with_international_fee_count,
    scr.intl_fee_mixed_currency,
    scr.career_paths_total_entries,
    scr.notable_alumni_count,
    scr.career_signal_score,
    scr.min_ielts_overall,
    scr.min_toefl_ibt,
    scr.programs_with_admissions_count,
    scr.has_international_students_page,
    srm.student_faculty_ratio_text,
    srm.scholarship_ratio_pct,
    srm.campus_facilities_summary,
    srm.resource_notes,
    srm.raw_evidence_json
  from public.schools s
  left join public.school_comparison_rollups scr on scr.school_id = s.id
  left join public.school_resource_metrics srm on srm.school_id = s.id
),
normalized as (
  select
    *,
    (
      select min(rank_value)
      from (
        values
          (qs_overall_rank),
          (qs_art_humanities_rank),
          (qs_architecture_built_environment_rank),
          (qs_art_design_rank),
          (qs_history_of_art_rank)
      ) as ranks(rank_value)
    ) as best_qs_rank,
    case upper(tuition_dominant_currency_code)
      when 'USD' then median_international_tuition_fee
      when 'GBP' then median_international_tuition_fee * 1.27
      when 'EUR' then median_international_tuition_fee * 1.08
      when 'AUD' then median_international_tuition_fee * 0.66
      when 'CAD' then median_international_tuition_fee * 0.73
      when 'HKD' then median_international_tuition_fee * 0.13
      when 'SGD' then median_international_tuition_fee * 0.74
      when 'JPY' then median_international_tuition_fee * 0.0067
      when 'KRW' then median_international_tuition_fee * 0.00074
      when 'CNY' then median_international_tuition_fee * 0.14
      else null
    end as estimated_tuition_usd,
    substring(student_faculty_ratio_text from '([0-9]+(?:\.[0-9]+)?)')::numeric as parsed_student_faculty_ratio
  from source
),
scored as (
  select
    school_id,

    greatest(0, least(100, round(
      coalesce(
        100 - ((best_qs_rank - 1) * 0.35),
        case
          when school_tier = 1 then 88
          when school_tier = 2 then 76
          when school_tier = 3 then 64
          else 55
        end
      )
    ))) as academic_score,

    greatest(0, least(100, round(
      coalesce(career_signal_score * 20, 0)
      + least(coalesce(career_paths_total_entries, 0), 20) * 1.2
      + least(coalesce(notable_alumni_count, 0), 20) * 0.8
    ))) as employment_score,

    greatest(0, least(100, round(
      35
      + case
          when parsed_student_faculty_ratio is null then 0
          when parsed_student_faculty_ratio <= 8 then 25
          when parsed_student_faculty_ratio <= 12 then 20
          when parsed_student_faculty_ratio <= 18 then 12
          else 5
        end
      + least(coalesce(scholarship_ratio_pct, 0), 50) * 0.5
      + case when nullif(campus_facilities_summary, '') is not null then 15 else 0 end
      + case when raw_evidence_json is not null then 5 else 0 end
    ))) as facility_score,

    greatest(0, least(100, round(
      case
        when estimated_tuition_usd is null or intl_fee_mixed_currency is true then 50
        when estimated_tuition_usd <= 15000 then 95
        when estimated_tuition_usd >= 85000 then 30
        else 95 - ((estimated_tuition_usd - 15000) * 65 / 70000)
      end
    ))) as cost_score,

    greatest(0, least(100, round(
      coalesce(
        92 - ((best_qs_rank - 1) * 0.28),
        case
          when school_tier = 1 then 84
          when school_tier = 2 then 72
          when school_tier = 3 then 60
          else 50
        end
      )
      + least(coalesce(notable_alumni_count, 0), 20) * 0.8
    ))) as reputation_score,

    greatest(0, least(100, round(
      45
      + least(coalesce(array_length(feature_tags, 1), 0), 8) * 4
      + least(coalesce(array_length(strength_disciplines, 1), 0), 8) * 3
      + coalesce(career_signal_score, 0) * 4
      + case when has_international_students_page or nullif(international_students_page, '') is not null then 5 else 0 end
    ))) as innovation_score,

    median_application_difficulty_score,
    median_international_tuition_fee,
    tuition_dominant_currency_code,
    estimated_tuition_usd,
    career_signal_score,
    career_paths_total_entries,
    notable_alumni_count,
    min_ielts_overall,
    min_toefl_ibt,
    programs_with_admissions_count,
    programs_with_international_fee_count,
    scholarship_ratio_pct,
    student_faculty_ratio_text,
    campus_facilities_summary,
    resource_notes
  from normalized
)
select
  school_id,
  academic_score,
  employment_score,
  facility_score,
  cost_score,
  reputation_score,
  innovation_score,
  jsonb_build_object(
    'academic', academic_score,
    'employment', employment_score,
    'facility', facility_score,
    'cost', cost_score,
    'reputation', reputation_score,
    'innovation', innovation_score
  ) as radar_data,
  median_application_difficulty_score,
  median_international_tuition_fee,
  tuition_dominant_currency_code,
  estimated_tuition_usd,
  career_signal_score,
  career_paths_total_entries,
  notable_alumni_count,
  min_ielts_overall,
  min_toefl_ibt,
  programs_with_admissions_count,
  programs_with_international_fee_count,
  scholarship_ratio_pct,
  student_faculty_ratio_text,
  campus_facilities_summary,
  resource_notes
from scored;

comment on view public.school_radar_metrics is
  'Frontend-facing 0-100 radar metrics for the artiqore school comparison center.';
