import WelcomeSection from '../components/WelcomeSection'
import CategoryGrid from '../components/CategoryGrid'
import PopularDestinations from '../components/PopularDestinations'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../../projects/hooks/useProjectMutations'
import { useEffect } from 'react'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data: projects, isLoading } = useProjects()

  const handleStartProject = () => {
    navigate('/onboarding')
  }

  useEffect(() => {
    if (!isLoading && projects && projects.length > 0) {
      navigate('/dashboard/personalized', { replace: true })
    }
  }, [projects, isLoading, navigate])

  if (isLoading || (projects && projects.length > 0)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <WelcomeSection 
        isProfileComplete={false} 
        onStartProject={handleStartProject}
      />
      
      <CategoryGrid />
      
      <PopularDestinations />
    </div>
  )
}
