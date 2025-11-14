import { Check } from 'lucide-react'

export interface Step {
  id: number
  label: string
  state: 'todo' | 'current' | 'done'
}

interface StepperProps {
  steps: Step[]
  onStepClick?: (id: number) => void
}

export default function Stepper({ steps, onStepClick }: StepperProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex-1 flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => onStepClick?.(step.id)}
                disabled={step.state === 'todo'}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200
                  ${step.state === 'done' 
                    ? 'bg-emerald-600 text-white' 
                    : step.state === 'current'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                  }
                  ${(step.state === 'current' || step.state === 'done') && onStepClick 
                    ? 'hover:opacity-80 cursor-pointer' 
                    : step.state === 'todo' 
                    ? 'cursor-not-allowed' 
                    : ''
                  }
                `}
              >
                {step.state === 'done' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.id
                )}
              </button>
              
              {/* Step label */}
              <span className={`
                mt-2 text-xs font-light text-center max-w-20
                ${step.state === 'current' 
                  ? 'text-blue-600 font-medium' 
                  : step.state === 'done'
                  ? 'text-emerald-600'
                  : 'text-gray-500'
                }
              `}>
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className={`
                flex-1 h-0.5 mx-4 transition-colors duration-200
                ${steps[index + 1].state !== 'todo' 
                  ? 'bg-emerald-300' 
                  : 'bg-gray-200'
                }
              `} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}