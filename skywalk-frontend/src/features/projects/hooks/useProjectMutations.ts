import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { expatriationProjectApi } from '../../../api/expatriation-project';
import type {
  CreateExpatriationProjectDto,
  UpdateExpatriationProjectDto,
} from '../../../types/expatriation-project';

interface ApiError {
  response?: { data?: { message?: string } };
  message?: string;
}

export function useProjects(enabled: boolean = true) {
  return useQuery({
    queryKey: ['expatriation-projects'],
    queryFn: expatriationProjectApi.getAll,
    enabled,
  });
}

export function useProject(projectId: number) {
  return useQuery({
    queryKey: ['expatriation-project', projectId],
    queryFn: () => expatriationProjectApi.getById(projectId),
    enabled: !!projectId,
  });
}

export function useProjectCount() {
  return useQuery({
    queryKey: ['expatriation-projects-count'],
    queryFn: expatriationProjectApi.getCount,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreateExpatriationProjectDto) =>
      expatriationProjectApi.create(data),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['expatriation-projects'] });
      queryClient.invalidateQueries({ queryKey: ['expatriation-projects-count'] });
      
      toast.success(t('projectsPage.createSuccess'));
      return newProject;
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || t('projectsPage.createError');
      toast.error(message);
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: number;
      data: UpdateExpatriationProjectDto;
    }) => expatriationProjectApi.update(projectId, data),
    onSuccess: (updatedProject) => {
      queryClient.setQueryData(
        ['expatriation-project', updatedProject.idProject],
        updatedProject,
      );
      
      queryClient.invalidateQueries({ queryKey: ['expatriation-projects'] });
      
      toast.success(t('projectsPage.updateSuccess'));
      return updatedProject;
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || t('projectsPage.updateError');
      toast.error(message);
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (projectId: number) => expatriationProjectApi.delete(projectId),
    onSuccess: (_, projectId) => {
 
      queryClient.removeQueries({ queryKey: ['expatriation-project', projectId] });
      
      queryClient.invalidateQueries({ queryKey: ['expatriation-projects'] });
      queryClient.invalidateQueries({ queryKey: ['expatriation-projects-count'] });
      
      toast.success(t('projectsPage.deleteSuccess'));
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || t('projectsPage.deleteError');
      toast.error(message);
    },
  });
}
