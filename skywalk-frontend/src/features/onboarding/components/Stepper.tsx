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
    <div className="w-full max-w-4xl mx-auto py-4 sm:py-6 overflow-x-auto scrollbar-hide">
      <div className="flex items-start justify-between min-w-[max-content] sm:min-w-0 px-4 sm:px-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start flex-1 last:flex-none">
            <div className="flex flex-col items-center shrink-0 w-24">
              <button
                onClick={() => onStepClick?.(step.id)}
                disabled={step.state === 'todo'}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200 relative z-10
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

              <span className={`
                mt-2 text-[11px] sm:text-xs font-medium text-center w-full break-words px-1
                ${step.state === 'current'
                  ? 'text-blue-600'
                  : step.state === 'done'
                    ? 'text-emerald-600'
                    : 'text-gray-500 font-normal'
                }
              `}>
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className={`
                flex-1 h-0.5 mt-4 min-w-[1rem] sm:min-w-[2rem] transition-colors duration-200 relative z-0
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