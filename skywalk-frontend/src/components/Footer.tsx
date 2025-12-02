import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

export default function Footer() {
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
              Votre compagnon d'expatriation pour une nouvelle vie à l'étranger. Guides, outils et communauté pour réussir votre projet.
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
            <h3 className="text-white font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/services/emploi" className="hover:text-[#5EA3C0] transition-colors">
                  Trouver un emploi
                </Link>
              </li>
              <li>
                <Link to="/services/logement" className="hover:text-[#5EA3C0] transition-colors">
                  Trouver un logement
                </Link>
              </li>
              <li>
                <Link to="/services/transport" className="hover:text-[#5EA3C0] transition-colors">
                  Se déplacer
                </Link>
              </li>
              <li>
                <Link to="/services/sante" className="hover:text-[#5EA3C0] transition-colors">
                  Santé et bien-être
                </Link>
              </li>
              <li>
                <Link to="/services/demarches" className="hover:text-[#5EA3C0] transition-colors">
                  Démarches administratives
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#5EA3C0] transition-colors">
                  Tous les services
                </Link>
              </li>
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Ressources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/destinations" className="hover:text-[#5EA3C0] transition-colors">
                  Destinations
                </Link>
              </li>
              <li>
                <Link to="/forum" className="hover:text-[#5EA3C0] transition-colors">
                  Forum communauté
                </Link>
              </li>
              <li>
                <Link to="/guides" className="hover:text-[#5EA3C0] transition-colors">
                  Guides pratiques
                </Link>
              </li>
              <li>
                <Link to="/experiences" className="hover:text-[#5EA3C0] transition-colors">
                  Témoignages
                </Link>
              </li>
              <li>
                <Link to="/comparison" className="hover:text-[#5EA3C0] transition-colors">
                  Comparateur pays
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-[#5EA3C0] transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact</h3>
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
                À propos
              </Link>
              <Link to="/legal" className="block hover:text-[#5EA3C0] transition-colors">
                Mentions légales
              </Link>
              <Link to="/privacy" className="block hover:text-[#5EA3C0] transition-colors">
                Confidentialité
              </Link>
              <Link to="/terms" className="block hover:text-[#5EA3C0] transition-colors">
                CGU
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
              &copy; {currentYear} SkyWalk. Tous droits réservés.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>Service en ligne</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}