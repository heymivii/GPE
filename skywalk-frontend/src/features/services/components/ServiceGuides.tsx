import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, Lightbulb, HelpCircle } from 'lucide-react';
import type { ServiceGuide } from '../../../data/services-config';

interface ServiceGuidesProps {
  guides: ServiceGuide[];
  tips: string[];
  faq?: {
    question: string;
    answer: string;
  }[];
}

export default function ServiceGuides({ guides, tips, faq }: ServiceGuidesProps) {
  const [openGuideIndex, setOpenGuideIndex] = useState<number | null>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleGuide = (index: number) => {
    setOpenGuideIndex(openGuideIndex === index ? null : index);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <section className="space-y-16">
      {/* Guides */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Guides étape par étape
        </h2>
        <div className="space-y-4">
          {guides.map((guide, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl border transition-all duration-200 ${
                openGuideIndex === index
                  ? 'border-gray-200 shadow-sm'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <button
                onClick={() => toggleGuide(index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-medium text-sm transition-colors ${
                      openGuideIndex === index
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {guide.title}
                  </h3>
                </div>
                <div
                  className={`transition-transform duration-200 ${
                    openGuideIndex === index ? 'rotate-180' : ''
                  }`}
                >
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              </button>

              <div
                className={`transition-all duration-200 ease-in-out overflow-hidden ${
                  openGuideIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-8 pt-0 ml-12 space-y-3">
                  {guide.steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                      <span className="text-gray-600 leading-relaxed">
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      {tips && tips.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Conseils pratiques
          </h2>
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-100">
            <div className="grid gap-4">
              {tips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <Lightbulb className="w-5 h-5 text-gray-400" />
                  </div>
                  <span className="text-gray-600 leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FAQ */}
      {faq && faq.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Questions fréquentes
          </h2>
          <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
            {faq.map((item, index) => (
              <div key={index} className="py-4">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <h3 className="text-base font-medium text-gray-900 group-hover:text-gray-600 transition-colors pr-8">
                    {item.question}
                  </h3>
                  <div
                    className={`flex-shrink-0 transition-transform duration-200 ${
                      openFaqIndex === index ? 'rotate-180' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </button>

                <div
                  className={`transition-all duration-200 ease-in-out overflow-hidden ${
                    openFaqIndex === index ? 'max-h-48 opacity-100 mt-4' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-gray-600 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
