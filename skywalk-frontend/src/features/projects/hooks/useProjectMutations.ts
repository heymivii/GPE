import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { expatriationProjectApi } from '../../../api/expatriation-project';
import type {
  ExpatriationProject,
  CreateExpatriationProjectDto,
  UpdateExpatriationProjectDto,
} from '../../../types/expatriation-project';

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

  return useMutation({
    mutationFn: (data: CreateExpatriationProjectDto) =>
      expatriationProjectApi.create(data),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['expatriation-projects'] });
      queryClient.invalidateQueries({ queryKey: ['expatriation-projects-count'] });
      
      toast.success('Projet créé avec succès !');
      return newProject;
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la création du projet';
      toast.error(message);
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

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
      
      toast.success('Projet mis à jour avec succès !');
      return updatedProject;
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(message);
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: number) => expatriationProjectApi.delete(projectId),
    onSuccess: (_, projectId) => {
 
      queryClient.removeQueries({ queryKey: ['expatriation-project', projectId] });
      
      queryClient.invalidateQueries({ queryKey: ['expatriation-projects'] });
      queryClient.invalidateQueries({ queryKey: ['expatriation-projects-count'] });
      
      toast.success('Projet supprimé avec succès !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(message);
    },
  });
}
