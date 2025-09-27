import WelcomeSection from '../components/WelcomeSection'
import CategoryGrid from '../components/CategoryGrid'
import PopularDestinations from '../components/PopularDestinations'

export default function DashboardPage() {
  const hasOnboardingData = localStorage.getItem('skywalk-onboarding-completed')

  const handleStartProject = () => {
    window.location.href = '/onboarding'
  }

  if (hasOnboardingData) {
    window.location.href = '/personalized'
    return null
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
