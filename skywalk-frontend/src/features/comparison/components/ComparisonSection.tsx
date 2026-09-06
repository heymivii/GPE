import React from 'react'

export function ComparisonSection({
    title,
    icon,
    children
}: {
    title: string
    icon: React.ReactNode
    children: React.ReactNode
}) {
    return (
        <div className="bg-transparent sm:bg-white rounded-none sm:rounded-2xl shadow-none sm:shadow-sm border-0 sm:border sm:border-gray-100 sm:overflow-hidden transition-shadow duration-300 sm:hover:shadow-md">
            <div className="bg-white sm:bg-gray-50/30 px-4 sm:px-8 py-3 sm:py-4 border border-gray-100 sm:border-0 sm:border-b sm:border-gray-100 mb-6 sm:mb-0 rounded-2xl shadow-sm sm:shadow-none sm:rounded-none">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg text-brand-ink shadow-sm border border-gray-100">
                        {icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                </div>
            </div>
            <div className="flex flex-col gap-8 sm:block sm:divide-y sm:divide-gray-50 pb-4 sm:pb-0">
                {children}
            </div>
        </div>
    )
}
