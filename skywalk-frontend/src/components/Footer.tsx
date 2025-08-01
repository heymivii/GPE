export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-600 py-6 mt-10 border-t">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} MonApp. Tous droits réservés.
        </p>
        <div className="mt-2 space-x-4 text-sm">
          <a href="/mentions-legales" className="hover:text-black">Mentions légales</a>
          <a href="/confidentialite" className="hover:text-black">Politique de confidentialité</a>
        </div>
      </div>
    </footer>
  );
}