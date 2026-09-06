import { ArrowRightIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useTranslation } from 'react-i18next';

export default function MiddleCtaBanner() {
    const { isAuthenticated } = useAuth();
    const { t } = useTranslation();

    return (
        <section className="w-full bg-black relative overflow-hidden py-24 sm:py-32">
            <div className="absolute inset-0 overflow-hidden pointer-events-none flex justify-center mt-[-10%]">
                <div className="w-[80%] h-[50%] bg-gradient-to-b from-white/5 to-transparent blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 flex flex-col items-center text-center">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight font-outfit text-white mb-6">
                    {t('landing.ctaBanner.title')}
                </h2>
                <p className="text-xl sm:text-2xl text-ink-muted max-w-3xl mb-12 font-medium">
                    {t('landing.ctaBanner.description')}
                </p>

                <Link
                    to={isAuthenticated ? "/onboarding" : "/auth/register?redirect=/onboarding"}
                    className="group inline-flex items-center gap-4 bg-white hover:bg-gray-100 text-[#1d1d1f] text-lg font-medium rounded-full pl-8 pr-4 py-4 transition-all duration-300 hover:scale-[1.02] shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                >
                    {t('landing.ctaBanner.cta')}
                    <div className="bg-[#f5f5f7] rounded-full p-2 text-[#1d1d1f] group-hover:translate-x-1 transition-transform">
                        <ArrowRightIcon className="w-4 h-4" strokeWidth={2} />
                    </div>
                </Link>
            </div>
        </section>
    );
}
