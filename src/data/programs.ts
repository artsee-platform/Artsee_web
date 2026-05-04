export interface InstitutionProgram {
  id: string;
  schoolId: string;
  schoolKeys?: string[];
  name: string;
  originalName?: string;
  description?: string;
  degree?: string;
  degreeType?: string;
  degreeFullName?: string;
  category?: string;
  programCode?: string;
  ucasCode?: string;
  duration?: string;
  durationMonths?: number;
  language?: string;
  studyMode?: string;
  intakeMonths?: string[];
  requiresPortfolio?: boolean;
  requiresInterview?: boolean;
  requiresPersonalStatement?: boolean;
  minimumEducation?: string;
  overview?: string;
  highlights?: string[];
  accreditationInfo?: string;
  coreCourses?: string[];
  careerPaths?: string[];
  admissionSummary?: string;
  coverImageUrl?: string;
  status?: string;
  isRecommended?: boolean;
  tags?: string[];
}

export type ProgramsByInstitution = Record<string, InstitutionProgram[]>;

export interface ProgramDisplayText {
  id?: string;
  name?: string;
  degreeBadge?: string;
  degreeFullName?: string;
  category?: string;
  duration?: string;
  studyMode?: string;
  intakeMonths?: string[];
  summary?: string;
  overview?: string;
  highlights?: string[];
  admissionSummary?: string;
  minimumEducation?: string;
  careerPaths?: string[];
}
