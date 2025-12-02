import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { expatriationProjectApi } from '../../../api/expatriation-project';
import type {
  ExpatriationProject,
  CreateExpatriationProjectDto,
  UpdateExpatriationProjectDto,
} from '../../../types/expatriation-project';

/**
 * Hook to fetch all projects for the authenticated user
 */
export function useProjects(enabled: boolean = true) {
  return useQuery({
    queryKey: ['expatriation-projects'],
    queryFn: expatriationProjectApi.getAll,
    enabled,
  });
}

/**
 * Hook to fetch a single project by ID
 */
export function useProject(projectId: number) {
  return useQuery({
    queryKey: ['expatriation-project', projectId],
    queryFn: () => expatriationProjectApi.getById(projectId),
    enabled: !!projectId,
  });
}

/**
 * Hook to get project count
 */
export function useProjectCount() {
  return useQuery({
    queryKey: ['expatriation-projects-count'],
    queryFn: expatriationProjectApi.getCount,
  });
}

/**
 * Hook to create a new project
 */
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

/**
 * Hook to update an existing project
 */
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

/**
 * Hook to delete a project
 */
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
