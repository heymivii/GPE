import { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../lib/api';

export default function NewsletterCTA() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        setErrorMessage('');

        try {
            await apiClient.post('/newsletter/subscribe', {
                email,
                source: 'landing_page'
            });
            setStatus('success');
            setEmail('');
        } catch (error: any) {
            setStatus('error');
            setErrorMessage(error.response?.data?.message || t('landing.newsletter.error'));
        }
    };

    return (
        <section className="bg-white py-20 sm:py-32 px-4 sm:px-8 border-t border-gray-100/50">
            <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center justify-center p-4 bg-[#f5f5f7] rounded-[1.5rem] mb-8">
                    <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-[#1d1d1f]" strokeWidth={1.5} />
                </div>

                <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight font-outfit text-[#1d1d1f] mb-4">
                    {t('landing.newsletter.title')}
                </h2>
                <p className="text-ink-muted text-lg sm:text-xl mb-12 max-w-2xl mx-auto font-medium">
                    {t('landing.newsletter.description')}
                </p>

                {status === 'success' ? (
                    <div className="flex flex-col items-center justify-center gap-4 animate-fade-in p-8 bg-[#f5f5f7] rounded-[2rem] max-w-md mx-auto">
                        <CheckCircle2 className="w-12 h-12 text-[#1d1d1f]" strokeWidth={1.5} />
                        <div className="space-y-1">
                            <p className="text-[#1d1d1f] font-semibold text-lg">{t('landing.newsletter.successTitle')}</p>
                            <p className="text-ink-muted">{t('landing.newsletter.successDescription')}</p>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-xl mx-auto space-y-4">
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                            <div className="relative w-full flex-1">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('landing.newsletter.placeholder')}
                                    className={`w-full pl-13 pr-6 py-4 rounded-full border focus:ring-1 transition-all outline-none bg-white placeholder-gray-400 shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-lg ${status === 'error'
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500 text-red-900 bg-red-50/50'
                                        : 'border-gray-200/60 focus:border-[#1d1d1f] focus:ring-[#1d1d1f] text-[#1d1d1f]'
                                        }`}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-[#1d1d1f] text-white font-medium rounded-full hover:bg-black transition-all shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none whitespace-nowrap text-lg"
                            >
                                {status === 'loading' ? t('landing.newsletter.subscribing') : t('landing.newsletter.subscribe')}
                            </button>
                        </form>
                        {status === 'error' && (
                            <div className="flex items-center justify-center gap-2 text-red-500 animate-fade-in text-sm font-medium">
                                <AlertCircle className="w-4 h-4" />
                                <p>{errorMessage}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
