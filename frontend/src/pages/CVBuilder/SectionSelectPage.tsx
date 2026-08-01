import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookMarked,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  Circle,
  FileCheck2,
  FileText,
  FolderKanban,
  GraduationCap,
  Heart,
  Languages,
  Layers,
  Star,
  User,
  Users,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useCVBuilderStore } from '@/store/cvBuilderStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { tr } from '@/i18n/tr';
import type { SectionType } from '@/types/cv';

const sectionOrder: SectionType[] = [
  'about',
  'education',
  'experience',
  'skills',
  'languages',
  'certificates',
  'interests',
  'projects',
  'courses',
  'awards',
  'organisations',
  'publications',
  'references',
  'declaration',
  'custom',
];

const sectionIcons: Record<SectionType, LucideIcon> = {
  about: FileText,
  education: GraduationCap,
  experience: Briefcase,
  skills: Zap,
  languages: Languages,
  certificates: BadgeCheck,
  interests: Heart,
  projects: FolderKanban,
  courses: BookOpen,
  awards: Award,
  organisations: Building2,
  publications: BookMarked,
  references: Users,
  declaration: FileCheck2,
  custom: Star,
};

const personalSchema = z.object({
  name: z.string().min(1, tr.cvBuilder.fullNameRequired),
  email: z
    .string()
    .min(1, tr.cvBuilder.emailRequired)
    .email(tr.cvBuilder.emailInvalid),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin_url: z.string().optional(),
  github_url: z.string().optional(),
});

type PersonalFormValues = z.infer<typeof personalSchema>;

export function SectionSelectPage() {
  const navigate = useNavigate();
  const personal = useCVBuilderStore((state) => state.personal);
  const selectedSections = useCVBuilderStore((state) => state.selectedSections);
  const toggleSection = useCVBuilderStore((state) => state.toggleSection);
  const setPersonal = useCVBuilderStore((state) => state.setPersonal);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalFormValues>({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      name: personal.name,
      email: personal.email,
      phone: personal.phone ?? '',
      location: personal.location ?? '',
      linkedin_url: personal.linkedin_url ?? '',
      github_url: personal.github_url ?? '',
    },
  });

  function onSubmit(values: PersonalFormValues) {
    if (selectedSections.length === 0) {
      toast.error(tr.cvBuilder.noSectionSelected);
      return;
    }
    setPersonal(values);
    navigate('/cv/builder/form');
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-default">{tr.cvBuilder.sectionSelectTitle}</h1>
        <p className="mt-1 text-sm text-faint">{tr.cvBuilder.sectionSelectSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400">
              <User aria-hidden="true" className="h-5 w-5" />
            </span>
            <h2 className="text-base font-semibold text-default">{tr.cvBuilder.personalInfo}</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={tr.cvBuilder.fullName}
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label={tr.cvBuilder.email}
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label={`${tr.cvBuilder.phone} ${tr.common.optional}`}
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label={`${tr.cvBuilder.location} ${tr.common.optional}`}
              error={errors.location?.message}
              {...register('location')}
            />
            <Input
              label={`${tr.cvBuilder.linkedinUrl} ${tr.common.optional}`}
              error={errors.linkedin_url?.message}
              {...register('linkedin_url')}
            />
            <Input
              label={`${tr.cvBuilder.githubUrl} ${tr.common.optional}`}
              error={errors.github_url?.message}
              {...register('github_url')}
            />
          </div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-400">
              <Layers aria-hidden="true" className="h-5 w-5" />
            </span>
            <h2 className="text-base font-semibold text-default">{tr.cvBuilder.sectionsHeading}</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {sectionOrder.map((type) => {
              const Icon = sectionIcons[type];
              const selected = selectedSections.includes(type);
              return (
                <label
                  key={type}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    selected
                      ? 'border-primary-400 bg-primary-50 text-primary-700 dark:border-primary-500/60 dark:bg-primary-500/10 dark:text-primary-300'
                      : 'border-border text-muted hover:border-primary-300 hover:bg-primary-50/40 dark:hover:bg-primary-500/10'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                    {tr.cvBuilder.sections[type]}
                  </span>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selected}
                    onChange={() => toggleSection(type)}
                  />
                  {selected ? (
                    <CheckCircle2
                      aria-hidden="true"
                      className="h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400"
                    />
                  ) : (
                    <Circle aria-hidden="true" className="h-5 w-5 shrink-0 text-faint" />
                  )}
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="gap-2 !rounded-2xl !px-8 !py-3 font-bold">
            {tr.cvBuilder.continueToForm}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
