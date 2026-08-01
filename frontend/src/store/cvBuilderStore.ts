import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { tr } from '@/i18n/tr';
import type {
  CVSection,
  GithubProjectImport,
  OutputLanguage,
  PersonalInfo,
  SectionContent,
  SectionType,
} from '@/types/cv';

const emptyPersonal: PersonalInfo = {
  name: '',
  email: '',
  phone: '',
  location: '',
  linkedin_url: '',
  github_url: '',
};

function nextOrder(sections: CVSection[]): number {
  return sections.reduce((max, s) => Math.max(max, s.order), 0) + 1;
}

function defaultContentForSection(type: SectionType): SectionContent {
  switch (type) {
    case 'about':
      return { text: '' };
    case 'education':
      return { items: [] };
    case 'experience':
      return { items: [] };
    case 'skills':
      return { languages: [], frameworks: [], tools: [] };
    case 'languages':
      return { items: [] };
    case 'certificates':
      return { items: [] };
    case 'interests':
      return { items: [] };
    case 'projects':
      return { items: [] };
    case 'courses':
      return { items: [] };
    case 'awards':
      return { items: [] };
    case 'organisations':
      return { items: [] };
    case 'publications':
      return { items: [] };
    case 'references':
      return { items: [] };
    case 'declaration':
      return { text: '' };
    case 'custom':
      return { text: '' };
    default:
      return { items: [] };
  }
}

interface CVBuilderState {
  personal: PersonalInfo;
  selectedSections: SectionType[];
  sections: CVSection[];
  outputLanguage: OutputLanguage;
  githubProjectsImported: boolean;
  draftId: string | null;

  setPersonal: (personal: Partial<PersonalInfo>) => void;
  toggleSection: (type: SectionType) => void;
  updateSection: (type: SectionType, content: SectionContent) => void;
  reorderSections: (type: SectionType, direction: 'up' | 'down') => void;
  setOutputLanguage: (language: OutputLanguage) => void;
  importGithubProjects: (projects: GithubProjectImport[]) => void;
  setDraftId: (draftId: string | null) => void;
  reset: () => void;
}

const initialState = {
  personal: emptyPersonal,
  selectedSections: [] as SectionType[],
  sections: [] as CVSection[],
  outputLanguage: 'tr' as OutputLanguage,
  githubProjectsImported: false,
  draftId: null as string | null,
};

/**
 * CV Builder wizard durumu (bkz. ARCHITECTURE.md §8.3).
 * SectionSelectPage -> CVBuilderFormPage -> CVBuilderEditorPage arasında paylaşılır.
 */
export const useCVBuilderStore = create<CVBuilderState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setPersonal: (personal) =>
        set((state) => ({ personal: { ...state.personal, ...personal } })),

      toggleSection: (type) => {
        const { selectedSections, sections } = get();
        const isSelected = selectedSections.includes(type);

        if (isSelected) {
          set({
            selectedSections: selectedSections.filter((t) => t !== type),
            sections: sections.filter((s) => s.type !== type),
          });
          return;
        }

        const newSection: CVSection = {
          type,
          order: nextOrder(sections),
          title: tr.cvBuilder.sections[type],
          content: defaultContentForSection(type),
        };

        set({
          selectedSections: [...selectedSections, type],
          sections: [...sections, newSection],
        });
      },

      updateSection: (type, content) =>
        set((state) => ({
          sections: state.sections.map((s) => (s.type === type ? { ...s, content } : s)),
        })),

      reorderSections: (type, direction) => {
        const { sections } = get();
        const ordered = [...sections].sort((a, b) => a.order - b.order);
        const index = ordered.findIndex((s) => s.type === type);
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (index === -1 || targetIndex < 0 || targetIndex >= ordered.length) return;

        const temp = ordered[index];
        ordered[index] = ordered[targetIndex];
        ordered[targetIndex] = temp;

        const reNumbered = ordered.map((s, i) => ({ ...s, order: i + 1 }));
        set({ sections: reNumbered });
      },

      setOutputLanguage: (language) => set({ outputLanguage: language }),

      importGithubProjects: (projects) => {
        const { sections, selectedSections } = get();
        const content: SectionContent = {
          items: projects.map((p) => ({
            name: p.name,
            description: p.description,
            tech_stack: p.tech_stack,
            repo_url: p.repo_url,
          })),
        };

        const exists = sections.some((s) => s.type === 'projects');
        const nextSections = exists
          ? sections.map((s) => (s.type === 'projects' ? { ...s, content } : s))
          : [
              ...sections,
              {
                type: 'projects' as SectionType,
                order: nextOrder(sections),
                title: tr.cvBuilder.sections.projects,
                content,
              },
            ];

        set({
          sections: nextSections,
          selectedSections: exists
            ? selectedSections
            : [...selectedSections, 'projects' as SectionType],
          githubProjectsImported: true,
        });
      },

      setDraftId: (draftId) => set({ draftId }),

      reset: () => set({ ...initialState }),
    }),
    {
      name: 'careercopilot-cv-builder',
    },
  ),
);
