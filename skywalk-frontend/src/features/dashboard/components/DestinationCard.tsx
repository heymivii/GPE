export interface DestinationCardProps {
  image: string
  countryName: string
  flag: string
  description: string
  size?: 'large' | 'small'
}

export default function DestinationCard({
  image,
  countryName,
  flag,
  description,
  size = 'small'
}: DestinationCardProps) {
  const cardClasses = size === 'large' 
    ? 'h-80 md:h-96' 
    : 'h-64 md:h-72'

  return (
    <div className={`relative ${cardClasses} rounded-lg overflow-hidden group cursor-pointer transition-transform duration-300 hover:scale-105 shadow-lg hover:shadow-xl`}>
      {/* Image de fond */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundImage: `url(${image})` }}
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      
      {/* Contenu */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="flex items-center mb-3">
          <span className="text-2xl mr-3">{flag}</span>
          <h3 className={`font-bold ${size === 'large' ? 'text-2xl' : 'text-xl'}`}>
            {countryName}
          </h3>
        </div>
        
        <p className={`text-gray-200 ${size === 'large' ? 'text-base' : 'text-sm'}`}>
          {description}
        </p>
        
        {/* Indicateur hover */}
        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="inline-flex items-center text-sm font-medium">
            <span>Découvrir</span>
            <svg className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}