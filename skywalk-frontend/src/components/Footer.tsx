import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">SkyWalk</h3>
            <p className="text-sm leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#5EA3C0] transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#5EA3C0] transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#5EA3C0] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#5EA3C0] transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#5EA3C0] transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">{t('footer.services')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/services/emploi" className="hover:text-[#5EA3C0] transition-colors">
                  {t('footer.findJob')}
                </Link>
              </li>
              <li>
                <Link to="/services/logement" className="hover:text-[#5EA3C0] transition-colors">
                  {t('footer.findHousing')}
                </Link>
              </li>
              <li>
                <Link to="/services/transport" className="hover:text-[#5EA3C0] transition-colors">
                  {t('footer.getAround')}
                </Link>
              </li>
              <li>
                <Link to="/services/sante" className="hover:text-[#5EA3C0] transition-colors">
                  {t('footer.healthWellbeing')}
                </Link>
              </li>
              <li>
                <Link to="/services/demarches" className="hover:text-[#5EA3C0] transition-colors">
                  {t('footer.adminProcedures')}
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#5EA3C0] transition-colors">
                  {t('footer.allServices')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">{t('footer.resources')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/destinations" className="hover:text-[#5EA3C0] transition-colors">
                  {t('footer.destinations')}
                </Link>
              </li>
              <li>
                <Link to="/forum" className="hover:text-[#5EA3C0] transition-colors">
                  {t('footer.communityForum')}
                </Link>
              </li>
              <li>
                <Link to="/guides" className="hover:text-[#5EA3C0] transition-colors">
                  {t('footer.practicalGuides')}
                </Link>
              </li>
              <li>
                <Link to="/experiences" className="hover:text-[#5EA3C0] transition-colors">
                  {t('footer.testimonials')}
                </Link>
              </li>
              <li>
                <Link to="/comparison" className="hover:text-[#5EA3C0] transition-colors">
                  {t('footer.countryComparator')}
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-[#5EA3C0] transition-colors">
                  {t('footer.blog')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <Mail className="w-4 h-4 mt-1 flex-shrink-0" />
                <a href="mailto:contact@skywalk.com" className="hover:text-[#5EA3C0] transition-colors">
                  contact@skywalk.com
                </a>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="w-4 h-4 mt-1 flex-shrink-0" />
                <a href="tel:+33123456789" className="hover:text-[#5EA3C0] transition-colors">
                  +33 1 23 45 67 89
                </a>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>Paris, France</span>
              </li>
            </ul>
            <div className="mt-6 space-y-2 text-sm">
              <Link to="/about" className="block hover:text-[#5EA3C0] transition-colors">
                {t('footer.about')}
              </Link>
              <Link to="/legal" className="block hover:text-[#5EA3C0] transition-colors">
                {t('footer.legalNotice')}
              </Link>
              <Link to="/privacy" className="block hover:text-[#5EA3C0] transition-colors">
                {t('footer.privacy')}
              </Link>
              <Link to="/terms" className="block hover:text-[#5EA3C0] transition-colors">
                {t('footer.terms')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              &copy; {currentYear} SkyWalk. {t('footer.allRightsReserved')}
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>{t('footer.serviceOnline')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}