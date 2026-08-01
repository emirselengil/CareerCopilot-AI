/** API_CONTRACT.md §4 CV Generate / Writer */

export type OutputLanguage = 'tr';

export type CVDraftStatus = 'draft' | 'generated' | 'exported';

export type SectionType =
  | 'about'
  | 'education'
  | 'experience'
  | 'skills'
  | 'languages'
  | 'certificates'
  | 'interests'
  | 'projects'
  | 'courses'
  | 'awards'
  | 'organisations'
  | 'publications'
  | 'references'
  | 'declaration'
  | 'custom';

export interface PersonalInfo {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
}

export interface AboutContent {
  text: string;
}

export interface EducationItem {
  degree: string;
  institution: string;
  year: number;
  gpa?: string;
}
export interface EducationContent {
  items: EducationItem[];
}

export interface ExperienceItem {
  title: string;
  company: string;
  start_date: string;
  end_date: string;
  description: string;
}
export interface ExperienceContent {
  items: ExperienceItem[];
}

export interface SkillsContent {
  languages: string[];
  frameworks: string[];
  tools: string[];
}

export interface LanguageItem {
  language: string;
  level: string;
}
export interface LanguagesContent {
  items: LanguageItem[];
}

export interface CertificateItem {
  name: string;
  issuer: string;
  date: string;
}
export interface CertificatesContent {
  items: CertificateItem[];
}

export interface InterestsContent {
  items: string[];
}

export interface ProjectItem {
  name: string;
  description: string;
  tech_stack: string[];
  repo_url?: string;
}
export interface ProjectsContent {
  items: ProjectItem[];
}

/** GET /github/projects öğesi — bkz. API_CONTRACT.md §8 */
export interface GithubProjectImport {
  name: string;
  description: string;
  tech_stack: string[];
  repo_url?: string;
}

export interface CourseItem {
  name: string;
  platform: string;
  completion_date: string;
}
export interface CoursesContent {
  items: CourseItem[];
}

export interface AwardItem {
  name: string;
  issuer: string;
  year: number;
  description?: string;
}
export interface AwardsContent {
  items: AwardItem[];
}

export interface OrganisationItem {
  name: string;
  role: string;
  start_date: string;
  end_date: string;
}
export interface OrganisationsContent {
  items: OrganisationItem[];
}

export interface PublicationItem {
  title: string;
  venue: string;
  date: string;
  url?: string;
}
export interface PublicationsContent {
  items: PublicationItem[];
}

export interface ReferenceItem {
  name: string;
  title: string;
  company: string;
  contact: string;
}
export interface ReferencesContent {
  items: ReferenceItem[];
}

export interface DeclarationContent {
  text: string;
}

export interface CustomContent {
  text: string;
}

export type SectionContent =
  | AboutContent
  | EducationContent
  | ExperienceContent
  | SkillsContent
  | LanguagesContent
  | CertificatesContent
  | InterestsContent
  | ProjectsContent
  | CoursesContent
  | AwardsContent
  | OrganisationsContent
  | PublicationsContent
  | ReferencesContent
  | DeclarationContent
  | CustomContent;

export interface CVSection {
  type: SectionType;
  order: number;
  title: string;
  content: SectionContent;
}

export interface CVFormData {
  personal: PersonalInfo;
  selected_sections: SectionType[];
  sections: CVSection[];
  github_projects_imported: boolean;
}

export interface GenerateCVRequest {
  form_data: CVFormData;
  output_language: OutputLanguage;
}

export interface GenerateCVResponse {
  task_id: string;
  draft_id: string;
  status: 'queued';
}

export interface CVJson {
  personal: Partial<PersonalInfo>;
  sections: Array<{ type: SectionType; title: string; content: SectionContent }>;
}

export interface CVDraft {
  draft_id: string;
  user_id: string;
  form_data: CVFormData;
  cv_json: CVJson | null;
  text_tr: string | null;
  text_en: string | null;
  user_edited_text: string | null;
  output_language: OutputLanguage;
  status: CVDraftStatus;
  uploaded_document_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateCVDraftRequest {
  user_edited_text: string;
}

export interface CVDraftListItem {
  draft_id: string;
  status: CVDraftStatus;
  output_language: OutputLanguage;
  created_at: string;
  updated_at: string;
  personal_name: string;
}

export interface CVDraftListResponse {
  items: CVDraftListItem[];
  total: number;
}

export interface ExportPdfRequest {
  draft_id: string;
  language: 'tr';
}

export interface ExportPdfResponse {
  document_id: string;
  draft_id: string;
  download_url: string;
  document_type: 'generated_cv';
  status: 'exported';
}
