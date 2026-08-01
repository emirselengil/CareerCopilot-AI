import { useMemo, useRef } from 'react';
import type { ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useCVBuilderStore } from '@/store/cvBuilderStore';
import { generateCV } from '@/api/cv';
import { getApiErrorMessage } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { tr } from '@/i18n/tr';
import { AboutSection } from '@/components/cv/sections/AboutSection';
import { EducationSection } from '@/components/cv/sections/EducationSection';
import { ExperienceSection } from '@/components/cv/sections/ExperienceSection';
import { SkillsSection } from '@/components/cv/sections/SkillsSection';
import { LanguagesSection } from '@/components/cv/sections/LanguagesSection';
import { CertificatesSection } from '@/components/cv/sections/CertificatesSection';
import { InterestsSection } from '@/components/cv/sections/InterestsSection';
import { ProjectsSection } from '@/components/cv/sections/ProjectsSection';
import { CoursesSection } from '@/components/cv/sections/CoursesSection';
import { AwardsSection } from '@/components/cv/sections/AwardsSection';
import { OrganisationsSection } from '@/components/cv/sections/OrganisationsSection';
import { PublicationsSection } from '@/components/cv/sections/PublicationsSection';
import { ReferencesSection } from '@/components/cv/sections/ReferencesSection';
import { DeclarationSection } from '@/components/cv/sections/DeclarationSection';
import { CustomSection } from '@/components/cv/sections/CustomSection';
import type { SectionFormHandle } from '@/components/cv/sections/types';
import type { CVSection, SectionContent, SectionType } from '@/types/cv';

/**
 * Her bölüm component'i kendi özel content tipini (örn. `EducationContent`) ve
 * `forwardRef` ile `SectionFormHandle`'ı bekler. 14 farklı component'i tek bir
 * haritada tutmak TypeScript'in statik olarak ifade edemeyeceği bir varyans
 * gerektirdiğinden, bu harita bilinçli olarak `ComponentType<any>` ile gevşetilir;
 * gerçek tip güvenliği her component'in kendi dosyasında sağlanır.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySectionComponent = ComponentType<any>;

const sectionComponents: Record<SectionType, AnySectionComponent> = {
  about: AboutSection,
  education: EducationSection,
  experience: ExperienceSection,
  skills: SkillsSection,
  languages: LanguagesSection,
  certificates: CertificatesSection,
  interests: InterestsSection,
  projects: ProjectsSection,
  courses: CoursesSection,
  awards: AwardsSection,
  organisations: OrganisationsSection,
  publications: PublicationsSection,
  references: ReferencesSection,
  declaration: DeclarationSection,
  custom: CustomSection,
};

export function CVBuilderFormPage() {
  const navigate = useNavigate();
  const personal = useCVBuilderStore((state) => state.personal);
  const sections = useCVBuilderStore((state) => state.sections);
  const githubProjectsImported = useCVBuilderStore((state) => state.githubProjectsImported);
  const updateSection = useCVBuilderStore((state) => state.updateSection);
  const reorderSections = useCVBuilderStore((state) => state.reorderSections);
  const setDraftId = useCVBuilderStore((state) => state.setDraftId);

  const orderedSections = useMemo(
    () => [...sections].sort((a, b) => a.order - b.order),
    [sections],
  );

  const refsMap = useRef(new Map<SectionType, SectionFormHandle<SectionContent> | null>());

  const mutation = useMutation({
    mutationFn: generateCV,
    onSuccess: (data) => {
      setDraftId(data.draft_id);
      toast.success(tr.cvBuilder.generateSuccess);
      navigate(`/cv/builder/editor/${data.draft_id}`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error) || tr.cvBuilder.generateError);
    },
  });

  async function handleSubmit() {
    if (!personal.name || !personal.email) {
      toast.error(tr.cvBuilder.fullNameRequired);
      navigate('/cv/builder/sections');
      return;
    }

    const collected: CVSection[] = [];
    for (const section of orderedSections) {
      const handle = refsMap.current.get(section.type);
      const content = await handle?.validate();
      if (!content) {
        toast.error(tr.cvBuilder.requiredField);
        return;
      }
      collected.push({ ...section, content });
      updateSection(section.type, content);
    }

    mutation.mutate({
      form_data: {
        personal,
        selected_sections: orderedSections.map((s) => s.type),
        sections: collected,
        github_projects_imported: githubProjectsImported,
      },
      output_language: 'tr',
    });
  }

  if (orderedSections.length === 0) {
    return (
      <EmptyState
        title={tr.cvBuilder.noSectionSelected}
        action={
          <Button onClick={() => navigate('/cv/builder/sections')}>
            {tr.cvBuilder.sectionSelectTitle}
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-semibold text-default">{tr.cvBuilder.formTitle}</h1>
        <p className="mt-1 text-sm text-faint">{tr.cvBuilder.formSubtitle}</p>
      </div>

      {orderedSections.map((section, index) => {
        const Component = sectionComponents[section.type];
        return (
          <div key={section.type} className="card">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-semibold text-default">
                {tr.cvBuilder.sections[section.type]}
              </h2>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => reorderSections(section.type, 'up')}
                  className="rounded-md border border-border px-2 py-1 text-xs text-muted hover:bg-surface-2 disabled:opacity-30"
                  aria-label={tr.common.moveUp}
                >
                  <ChevronUp aria-hidden="true" className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={index === orderedSections.length - 1}
                  onClick={() => reorderSections(section.type, 'down')}
                  className="rounded-md border border-border px-2 py-1 text-xs text-muted hover:bg-surface-2 disabled:opacity-30"
                  aria-label={tr.common.moveDown}
                >
                  <ChevronDown aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            </div>
            <Component
              defaultContent={section.content}
              ref={(instance: SectionFormHandle<SectionContent> | null) => {
                refsMap.current.set(section.type, instance ?? null);
              }}
            />
          </div>
        );
      })}

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-surface/95 p-4 shadow-lg backdrop-blur-md lg:pl-64">
        <div className="mx-auto flex max-w-4xl justify-end gap-3">
          <Button variant="secondary" onClick={() => navigate('/cv/builder/sections')}>
            {tr.common.back}
          </Button>
          <Button onClick={handleSubmit} isLoading={mutation.isPending}>
            {mutation.isPending ? tr.cvBuilder.generating : tr.cvBuilder.generateCv}
          </Button>
        </div>
      </div>
    </div>
  );
}
