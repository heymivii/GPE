export interface DestinationCardProps {
  image: string
  countryName: string
  flag: string
  description: string
  size?: 'large' | 'small'
  className?: string
}

export default function DestinationCard({
  image,
  countryName,
  flag,
  description,
  size = 'small',
  className = ''
}: DestinationCardProps) {
  const heightClasses = size === 'large' 
    ? 'h-80 lg:h-full min-h-[300px]' 
    : 'h-64 md:h-72'

  return (
    <div className={`relative ${heightClasses} ${className} rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-lg`}>
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${image})` }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-90" />
      
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
        <div className="flex items-center mb-3">
          <img src={flag} alt={countryName} className="w-8 h-6 object-cover rounded shadow-sm mr-3" />
          <h3 className={`font-bold font-outfit ${size === 'large' ? 'text-3xl' : 'text-xl'}`}>
            {countryName}
          </h3>
        </div>
        
        <p className={`text-gray-100 font-light leading-relaxed mb-4 ${size === 'large' ? 'text-lg line-clamp-3' : 'text-sm line-clamp-2'}`}>
          {description}
        </p>
        
        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
          <div className="inline-flex items-center text-sm font-bold uppercase tracking-wider text-[#5EA3C0] bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 hover:bg-white hover:text-[#5EA3C0] transition-colors">
            <span>Explorer</span>
            <svg className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}