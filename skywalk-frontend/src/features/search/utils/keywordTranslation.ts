interface TranslationMap {
  fr: string;
  en: string;
  de?: string;
  es?: string;
  it?: string;
}

const commonJobTerms: Record<string, TranslationMap> = {
  'développeur': { fr: 'développeur', en: 'developer', de: 'entwickler', es: 'desarrollador', it: 'sviluppatore' },
  'developpeur': { fr: 'developpeur', en: 'developer', de: 'entwickler', es: 'desarrollador', it: 'sviluppatore' },
  'dev': { fr: 'dev', en: 'developer', de: 'entwickler' },
  'ingénieur': { fr: 'ingénieur', en: 'engineer', de: 'ingenieur', es: 'ingeniero', it: 'ingegnere' },
  'ingenieur': { fr: 'ingenieur', en: 'engineer', de: 'ingenieur', es: 'ingeniero', it: 'ingegnere' },
  'programmeur': { fr: 'programmeur', en: 'programmer', de: 'programmierer', es: 'programador' },
  'architecte': { fr: 'architecte', en: 'architect', de: 'architekt', es: 'arquitecto', it: 'architetto' },
  'analyste': { fr: 'analyste', en: 'analyst', de: 'analyst', es: 'analista', it: 'analista' },
  'consultant': { fr: 'consultant', en: 'consultant', de: 'berater', es: 'consultor', it: 'consulente' },
  'technicien': { fr: 'technicien', en: 'technician', de: 'techniker', es: 'técnico' },
  'chef de projet': { fr: 'chef de projet', en: 'project manager', de: 'projektleiter', es: 'jefe de proyecto' },
  'product owner': { fr: 'product owner', en: 'product owner', de: 'product owner' },
  'scrum master': { fr: 'scrum master', en: 'scrum master', de: 'scrum master' },
  'data scientist': { fr: 'data scientist', en: 'data scientist', de: 'datenwissenschaftler', es: 'científico de datos' },
  'data analyst': { fr: 'data analyst', en: 'data analyst', de: 'datenanalyst', es: 'analista de datos' },
  'devops': { fr: 'devops', en: 'devops', de: 'devops' },
  'designer': { fr: 'designer', en: 'designer', de: 'designer', es: 'diseñador', it: 'designer' },
  'ux designer': { fr: 'ux designer', en: 'ux designer', de: 'ux designer' },
  'ui designer': { fr: 'ui designer', en: 'ui designer', de: 'ui designer' },
  'frontend': { fr: 'frontend', en: 'frontend', de: 'frontend' },
  'backend': { fr: 'backend', en: 'backend', de: 'backend' },
  'fullstack': { fr: 'fullstack', en: 'fullstack', de: 'fullstack' },
  'full stack': { fr: 'full stack', en: 'full stack', de: 'full stack' },
  'mobile': { fr: 'mobile', en: 'mobile', de: 'mobil' },
  'web': { fr: 'web', en: 'web', de: 'web' },
  'cloud': { fr: 'cloud', en: 'cloud', de: 'cloud' },
  'cybersécurité': { fr: 'cybersécurité', en: 'cybersecurity', de: 'cybersicherheit', es: 'ciberseguridad' },
  'cybersecurite': { fr: 'cybersecurite', en: 'cybersecurity', de: 'cybersicherheit', es: 'ciberseguridad' },
  'intelligence artificielle': { fr: 'intelligence artificielle', en: 'artificial intelligence', de: 'künstliche intelligenz' },
  'machine learning': { fr: 'machine learning', en: 'machine learning', de: 'maschinelles lernen' },
  'junior': { fr: 'junior', en: 'junior', de: 'junior' },
  'senior': { fr: 'senior', en: 'senior', de: 'senior' },
  'confirmé': { fr: 'confirmé', en: 'experienced', de: 'erfahren' },
  'confirme': { fr: 'confirme', en: 'experienced', de: 'erfahren' },
  'débutant': { fr: 'débutant', en: 'beginner', de: 'anfänger' },
  'debutant': { fr: 'debutant', en: 'beginner', de: 'anfänger' },
  'stagiaire': { fr: 'stagiaire', en: 'intern', de: 'praktikant', es: 'pasante' },
  'alternant': { fr: 'alternant', en: 'apprentice', de: 'auszubildender' },
  'alternance': { fr: 'alternance', en: 'apprenticeship', de: 'ausbildung' },
  'comptable': { fr: 'comptable', en: 'accountant', de: 'buchhalter', es: 'contador' },
  'commercial': { fr: 'commercial', en: 'sales', de: 'vertrieb', es: 'comercial' },
  'vendeur': { fr: 'vendeur', en: 'salesperson', de: 'verkäufer', es: 'vendedor' },
  'vendeuse': { fr: 'vendeuse', en: 'salesperson', de: 'verkäuferin', es: 'vendedora' },
  'marketing': { fr: 'marketing', en: 'marketing', de: 'marketing' },
  'communication': { fr: 'communication', en: 'communication', de: 'kommunikation', es: 'comunicación' },
  'ressources humaines': { fr: 'ressources humaines', en: 'human resources', de: 'personalwesen' },
  'rh': { fr: 'rh', en: 'hr', de: 'hr' },
  'manager': { fr: 'manager', en: 'manager', de: 'manager' },
  'directeur': { fr: 'directeur', en: 'director', de: 'direktor', es: 'director' },
  'directrice': { fr: 'directrice', en: 'director', de: 'direktorin', es: 'directora' },
  'assistant': { fr: 'assistant', en: 'assistant', de: 'assistent', es: 'asistente' },
  'assistante': { fr: 'assistante', en: 'assistant', de: 'assistent', es: 'asistente' },
  'secrétaire': { fr: 'secrétaire', en: 'secretary', de: 'sekretär', es: 'secretario' },
  'secretaire': { fr: 'secretaire', en: 'secretary', de: 'sekretär', es: 'secretario' },
  'réceptionniste': { fr: 'réceptionniste', en: 'receptionist', de: 'empfangsmitarbeiter' },
  'receptionniste': { fr: 'receptionniste', en: 'receptionist', de: 'empfangsmitarbeiter' },
  'infirmier': { fr: 'infirmier', en: 'nurse', de: 'krankenpfleger', es: 'enfermero' },
  'infirmière': { fr: 'infirmière', en: 'nurse', de: 'krankenpfleger', es: 'enfermera' },
  'infirmiere': { fr: 'infirmiere', en: 'nurse', de: 'krankenpfleger', es: 'enfermera' },
  'médecin': { fr: 'médecin', en: 'doctor', de: 'arzt', es: 'médico', it: 'medico' },
  'medecin': { fr: 'medecin', en: 'doctor', de: 'arzt', es: 'médico', it: 'medico' },
  'pharmacien': { fr: 'pharmacien', en: 'pharmacist', de: 'apotheker', es: 'farmacéutico' },
  'pharmacienne': { fr: 'pharmacienne', en: 'pharmacist', de: 'apothekerin', es: 'farmacéutica' },
  'aide-soignant': { fr: 'aide-soignant', en: 'nursing assistant', de: 'pflegehelfer' },
  'aide-soignante': { fr: 'aide-soignante', en: 'nursing assistant', de: 'pflegehelferin' },
  'professeur': { fr: 'professeur', en: 'teacher', de: 'lehrer', es: 'profesor' },
  'enseignant': { fr: 'enseignant', en: 'teacher', de: 'lehrer', es: 'profesor' },
  'enseignante': { fr: 'enseignante', en: 'teacher', de: 'lehrerin', es: 'profesora' },
  'formateur': { fr: 'formateur', en: 'trainer', de: 'ausbilder', es: 'formador' },
  'formatrice': { fr: 'formatrice', en: 'trainer', de: 'ausbilderin', es: 'formadora' },
  'électricien': { fr: 'électricien', en: 'electrician', de: 'elektriker', es: 'electricista' },
  'electricien': { fr: 'electricien', en: 'electrician', de: 'elektriker', es: 'electricista' },
  'plombier': { fr: 'plombier', en: 'plumber', de: 'klempner', es: 'fontanero' },
  'maçon': { fr: 'maçon', en: 'mason', de: 'maurer', es: 'albañil' },
  'macon': { fr: 'macon', en: 'mason', de: 'maurer', es: 'albañil' },
  'menuisier': { fr: 'menuisier', en: 'carpenter', de: 'tischler', es: 'carpintero' },
  'serveur': { fr: 'serveur', en: 'waiter', de: 'kellner', es: 'camarero' },
  'serveuse': { fr: 'serveuse', en: 'waitress', de: 'kellnerin', es: 'camarera' },
  'cuisinier': { fr: 'cuisinier', en: 'cook', de: 'koch', es: 'cocinero' },
  'cuisinière': { fr: 'cuisinière', en: 'cook', de: 'köchin', es: 'cocinera' },
  'cuisiniere': { fr: 'cuisiniere', en: 'cook', de: 'köchin', es: 'cocinera' },
  'chef': { fr: 'chef', en: 'chef', de: 'chefkoch', es: 'chef' },
  'barman': { fr: 'barman', en: 'bartender', de: 'barkeeper', es: 'bartender' },
  'barmaid': { fr: 'barmaid', en: 'bartender', de: 'barkeeper', es: 'bartender' },
  'danseur': { fr: 'danseur', en: 'dancer', de: 'tänzer', es: 'bailarín' },
  'danseuse': { fr: 'danseuse', en: 'dancer', de: 'tänzerin', es: 'bailarina' },
  'danceur': { fr: 'danceur', en: 'dancer', de: 'tänzer', es: 'bailarín' },
  'musicien': { fr: 'musicien', en: 'musician', de: 'musiker', es: 'músico' },
  'musicienne': { fr: 'musicienne', en: 'musician', de: 'musikerin', es: 'música' },
  'acteur': { fr: 'acteur', en: 'actor', de: 'schauspieler', es: 'actor' },
  'actrice': { fr: 'actrice', en: 'actress', de: 'schauspielerin', es: 'actriz' },
  'artiste': { fr: 'artiste', en: 'artist', de: 'künstler', es: 'artista' },
  'photographe': { fr: 'photographe', en: 'photographer', de: 'fotograf', es: 'fotógrafo' },
  'vidéaste': { fr: 'vidéaste', en: 'videographer', de: 'videograf', es: 'videógrafo' },
  'videaste': { fr: 'videaste', en: 'videographer', de: 'videograf', es: 'videógrafo' },
  'journaliste': { fr: 'journaliste', en: 'journalist', de: 'journalist', es: 'periodista' },
  'rédacteur': { fr: 'rédacteur', en: 'writer', de: 'redakteur', es: 'redactor' },
  'redacteur': { fr: 'redacteur', en: 'writer', de: 'redakteur', es: 'redactor' },
  'traducteur': { fr: 'traducteur', en: 'translator', de: 'übersetzer', es: 'traductor' },
  'traductrice': { fr: 'traductrice', en: 'translator', de: 'übersetzerin', es: 'traductora' },
  'interprète': { fr: 'interprète', en: 'interpreter', de: 'dolmetscher', es: 'intérprete' },
  'interprete': { fr: 'interprete', en: 'interpreter', de: 'dolmetscher', es: 'intérprete' },
  'avocat': { fr: 'avocat', en: 'lawyer', de: 'anwalt', es: 'abogado' },
  'avocate': { fr: 'avocate', en: 'lawyer', de: 'anwältin', es: 'abogada' },
  'juriste': { fr: 'juriste', en: 'legal advisor', de: 'jurist', es: 'jurista' },
  'notaire': { fr: 'notaire', en: 'notary', de: 'notar', es: 'notario' },
  'banquier': { fr: 'banquier', en: 'banker', de: 'bankier', es: 'banquero' },
  'financier': { fr: 'financier', en: 'financial analyst', de: 'finanzanalyst', es: 'financiero' },
  'assureur': { fr: 'assureur', en: 'insurance agent', de: 'versicherungsagent', es: 'asegurador' },
  'courtier': { fr: 'courtier', en: 'broker', de: 'makler', es: 'corredor' },
  'agent immobilier': { fr: 'agent immobilier', en: 'real estate agent', de: 'immobilienmakler', es: 'agente inmobiliario' },
  'architecte logiciel': { fr: 'architecte logiciel', en: 'software architect', de: 'softwarearchitekt' },
  'administrateur': { fr: 'administrateur', en: 'administrator', de: 'administrator', es: 'administrador' },
  'administrateur systeme': { fr: 'administrateur systeme', en: 'system administrator', de: 'systemadministrator' },
  'administrateur système': { fr: 'administrateur système', en: 'system administrator', de: 'systemadministrator' },
  'graphiste': { fr: 'graphiste', en: 'graphic designer', de: 'grafikdesigner', es: 'diseñador gráfico' },
  'illustrateur': { fr: 'illustrateur', en: 'illustrator', de: 'illustrator', es: 'ilustrador' },
  'animateur': { fr: 'animateur', en: 'animator', de: 'animator', es: 'animador' },
  'animatrice': { fr: 'animatrice', en: 'animator', de: 'animatorin', es: 'animadora' },
  'coach': { fr: 'coach', en: 'coach', de: 'coach', es: 'coach' },
  'psychologue': { fr: 'psychologue', en: 'psychologist', de: 'psychologe', es: 'psicólogo' },
  'kinésithérapeute': { fr: 'kinésithérapeute', en: 'physiotherapist', de: 'physiotherapeut', es: 'fisioterapeuta' },
  'kinesitherapeute': { fr: 'kinesitherapeute', en: 'physiotherapist', de: 'physiotherapeut', es: 'fisioterapeuta' },
  'ostéopathe': { fr: 'ostéopathe', en: 'osteopath', de: 'osteopath', es: 'osteópata' },
  'osteopathe': { fr: 'osteopathe', en: 'osteopath', de: 'osteopath', es: 'osteópata' },
  'dentiste': { fr: 'dentiste', en: 'dentist', de: 'zahnarzt', es: 'dentista' },
  'vétérinaire': { fr: 'vétérinaire', en: 'veterinarian', de: 'tierarzt', es: 'veterinario' },
  'veterinaire': { fr: 'veterinaire', en: 'veterinarian', de: 'tierarzt', es: 'veterinario' },
  'sage-femme': { fr: 'sage-femme', en: 'midwife', de: 'hebamme', es: 'partera' },
  'chirurgien': { fr: 'chirurgien', en: 'surgeon', de: 'chirurg', es: 'cirujano' },
  'chirurgienne': { fr: 'chirurgienne', en: 'surgeon', de: 'chirurgin', es: 'cirujana' },
  'biologiste': { fr: 'biologiste', en: 'biologist', de: 'biologe', es: 'biólogo' },
  'chimiste': { fr: 'chimiste', en: 'chemist', de: 'chemiker', es: 'químico' },
  'physicien': { fr: 'physicien', en: 'physicist', de: 'physiker', es: 'físico' },
  'chercheur': { fr: 'chercheur', en: 'researcher', de: 'forscher', es: 'investigador' },
  'chercheuse': { fr: 'chercheuse', en: 'researcher', de: 'forscherin', es: 'investigadora' },
  'scientifique': { fr: 'scientifique', en: 'scientist', de: 'wissenschaftler', es: 'científico' },
  'mathématicien': { fr: 'mathématicien', en: 'mathematician', de: 'mathematiker', es: 'matemático' },
  'mathematicien': { fr: 'mathematicien', en: 'mathematician', de: 'mathematiker', es: 'matemático' },
  'statisticien': { fr: 'statisticien', en: 'statistician', de: 'statistiker', es: 'estadístico' },
  'économiste': { fr: 'économiste', en: 'economist', de: 'ökonom', es: 'economista' },
  'economiste': { fr: 'economiste', en: 'economist', de: 'ökonom', es: 'economista' },
  'sociologue': { fr: 'sociologue', en: 'sociologist', de: 'soziologe', es: 'sociólogo' },
  'logisticien': { fr: 'logisticien', en: 'logistics manager', de: 'logistiker', es: 'logístico' },
  'logistique': { fr: 'logistique', en: 'logistics', de: 'logistik', es: 'logística' },
  'chauffeur': { fr: 'chauffeur', en: 'driver', de: 'fahrer', es: 'conductor' },
  'livreur': { fr: 'livreur', en: 'delivery driver', de: 'lieferfahrer', es: 'repartidor' },
  'livreuse': { fr: 'livreuse', en: 'delivery driver', de: 'lieferfahrerin', es: 'repartidora' },
  'mécanicien': { fr: 'mécanicien', en: 'mechanic', de: 'mechaniker', es: 'mecánico' },
  'mecanicien': { fr: 'mecanicien', en: 'mechanic', de: 'mechaniker', es: 'mecánico' },
  'soudeur': { fr: 'soudeur', en: 'welder', de: 'schweißer', es: 'soldador' },
  'peintre': { fr: 'peintre', en: 'painter', de: 'maler', es: 'pintor' },
  'jardinier': { fr: 'jardinier', en: 'gardener', de: 'gärtner', es: 'jardinero' },
  'agriculteur': { fr: 'agriculteur', en: 'farmer', de: 'landwirt', es: 'agricultor' },
  'boulanger': { fr: 'boulanger', en: 'baker', de: 'bäcker', es: 'panadero' },
  'boulangère': { fr: 'boulangère', en: 'baker', de: 'bäckerin', es: 'panadera' },
  'boulangere': { fr: 'boulangere', en: 'baker', de: 'bäckerin', es: 'panadera' },
  'pâtissier': { fr: 'pâtissier', en: 'pastry chef', de: 'konditor', es: 'pastelero' },
  'patissier': { fr: 'patissier', en: 'pastry chef', de: 'konditor', es: 'pastelero' },
  'boucher': { fr: 'boucher', en: 'butcher', de: 'metzger', es: 'carnicero' },
  'poissonnier': { fr: 'poissonnier', en: 'fishmonger', de: 'fischhändler', es: 'pescadero' },
  'fleuriste': { fr: 'fleuriste', en: 'florist', de: 'florist', es: 'florista' },
  'coiffeur': { fr: 'coiffeur', en: 'hairdresser', de: 'friseur', es: 'peluquero' },
  'coiffeuse': { fr: 'coiffeuse', en: 'hairdresser', de: 'friseurin', es: 'peluquera' },
  'esthéticienne': { fr: 'esthéticienne', en: 'beautician', de: 'kosmetikerin', es: 'esteticista' },
  'estheticienne': { fr: 'estheticienne', en: 'beautician', de: 'kosmetikerin', es: 'esteticista' },
  'opticien': { fr: 'opticien', en: 'optician', de: 'optiker', es: 'óptico' },
  'ambulancier': { fr: 'ambulancier', en: 'paramedic', de: 'rettungssanitäter', es: 'paramédico' },
  'pompier': { fr: 'pompier', en: 'firefighter', de: 'feuerwehrmann', es: 'bombero' },
  'policier': { fr: 'policier', en: 'police officer', de: 'polizist', es: 'policía' },
  'gendarme': { fr: 'gendarme', en: 'police officer', de: 'polizist', es: 'policía' },
  'militaire': { fr: 'militaire', en: 'military', de: 'militär', es: 'militar' },
  'douanier': { fr: 'douanier', en: 'customs officer', de: 'zollbeamter', es: 'aduanero' },
  'pilote': { fr: 'pilote', en: 'pilot', de: 'pilot', es: 'piloto' },
  'steward': { fr: 'steward', en: 'flight attendant', de: 'flugbegleiter', es: 'azafato' },
  'hôtesse': { fr: 'hôtesse', en: 'flight attendant', de: 'flugbegleiterin', es: 'azafata' },
  'hotesse': { fr: 'hotesse', en: 'flight attendant', de: 'flugbegleiterin', es: 'azafata' },
  'concierge': { fr: 'concierge', en: 'concierge', de: 'concierge', es: 'conserje' },
  'agent de sécurité': { fr: 'agent de sécurité', en: 'security guard', de: 'sicherheitsbeamter', es: 'guardia de seguridad' },
  'agent de securite': { fr: 'agent de securite', en: 'security guard', de: 'sicherheitsbeamter', es: 'guardia de seguridad' },
  'agent d\'entretien': { fr: 'agent d\'entretien', en: 'janitor', de: 'hausmeister', es: 'conserje' },
  'femme de ménage': { fr: 'femme de ménage', en: 'housekeeper', de: 'haushälterin', es: 'ama de llaves' },
  'femme de menage': { fr: 'femme de menage', en: 'housekeeper', de: 'haushälterin', es: 'ama de llaves' },
  'nourrice': { fr: 'nourrice', en: 'nanny', de: 'kindermädchen', es: 'niñera' },
  'baby-sitter': { fr: 'baby-sitter', en: 'babysitter', de: 'babysitter', es: 'niñera' },
  'éducateur': { fr: 'éducateur', en: 'educator', de: 'erzieher', es: 'educador' },
  'educateur': { fr: 'educateur', en: 'educator', de: 'erzieher', es: 'educador' },
  'bibliothécaire': { fr: 'bibliothécaire', en: 'librarian', de: 'bibliothekar', es: 'bibliotecario' },
  'bibliothecaire': { fr: 'bibliothecaire', en: 'librarian', de: 'bibliothekar', es: 'bibliotecario' },
  'archiviste': { fr: 'archiviste', en: 'archivist', de: 'archivar', es: 'archivista' },
  'urbaniste': { fr: 'urbaniste', en: 'urban planner', de: 'stadtplaner', es: 'urbanista' },
  'géomètre': { fr: 'géomètre', en: 'surveyor', de: 'vermesser', es: 'topógrafo' },
  'geometre': { fr: 'geometre', en: 'surveyor', de: 'vermesser', es: 'topógrafo' },
  'topographe': { fr: 'topographe', en: 'surveyor', de: 'vermesser', es: 'topógrafo' },
  'charpentier': { fr: 'charpentier', en: 'carpenter', de: 'zimmermann', es: 'carpintero' },
  'carreleur': { fr: 'carreleur', en: 'tiler', de: 'fliesenleger', es: 'alicatador' },
  'couvreur': { fr: 'couvreur', en: 'roofer', de: 'dachdecker', es: 'techador' },
  'serrurier': { fr: 'serrurier', en: 'locksmith', de: 'schlosser', es: 'cerrajero' },
  'vitrier': { fr: 'vitrier', en: 'glazier', de: 'glaser', es: 'vidriero' },
  'couturier': { fr: 'couturier', en: 'tailor', de: 'schneider', es: 'sastre' },
  'couturière': { fr: 'couturière', en: 'seamstress', de: 'schneiderin', es: 'costurera' },
  'couturiere': { fr: 'couturiere', en: 'seamstress', de: 'schneiderin', es: 'costurera' },
  'styliste': { fr: 'styliste', en: 'fashion designer', de: 'modedesigner', es: 'estilista' },
  'mannequin': { fr: 'mannequin', en: 'model', de: 'model', es: 'modelo' },
  'producteur': { fr: 'producteur', en: 'producer', de: 'produzent', es: 'productor' },
  'réalisateur': { fr: 'réalisateur', en: 'director', de: 'regisseur', es: 'director' },
  'realisateur': { fr: 'realisateur', en: 'director', de: 'regisseur', es: 'director' },
  'cadreur': { fr: 'cadreur', en: 'camera operator', de: 'kameramann', es: 'camarógrafo' },
  'monteur': { fr: 'monteur', en: 'editor', de: 'cutter', es: 'montador' },
  'ingénieur du son': { fr: 'ingénieur du son', en: 'sound engineer', de: 'tontechniker', es: 'ingeniero de sonido' },
  'ingenieur du son': { fr: 'ingenieur du son', en: 'sound engineer', de: 'tontechniker', es: 'ingeniero de sonido' },
  'technicien du son': { fr: 'technicien du son', en: 'sound technician', de: 'tontechniker', es: 'técnico de sonido' },
  'community manager': { fr: 'community manager', en: 'community manager', de: 'community manager' },
  'webmaster': { fr: 'webmaster', en: 'webmaster', de: 'webmaster' },
  'référenceur': { fr: 'référenceur', en: 'seo specialist', de: 'seo-spezialist' },
  'referenceur': { fr: 'referenceur', en: 'seo specialist', de: 'seo-spezialist' },
  'seo': { fr: 'seo', en: 'seo', de: 'seo' },
  'testeur': { fr: 'testeur', en: 'tester', de: 'tester', es: 'tester' },
  'qa': { fr: 'qa', en: 'qa', de: 'qa' },
  'intégrateur': { fr: 'intégrateur', en: 'integrator', de: 'integrator' },
  'integrateur': { fr: 'integrateur', en: 'integrator', de: 'integrator' },
  'responsable': { fr: 'responsable', en: 'manager', de: 'verantwortlicher', es: 'responsable' },
  'superviseur': { fr: 'superviseur', en: 'supervisor', de: 'supervisor', es: 'supervisor' },
  'coordinateur': { fr: 'coordinateur', en: 'coordinator', de: 'koordinator', es: 'coordinador' },
  'coordinatrice': { fr: 'coordinatrice', en: 'coordinator', de: 'koordinatorin', es: 'coordinadora' },
  'chargé de clientèle': { fr: 'chargé de clientèle', en: 'account manager', de: 'kundenbetreuer' },
  'charge de clientele': { fr: 'charge de clientele', en: 'account manager', de: 'kundenbetreuer' },
  'téléconseiller': { fr: 'téléconseiller', en: 'call center agent', de: 'callcenter-agent' },
  'teleconseiller': { fr: 'teleconseiller', en: 'call center agent', de: 'callcenter-agent' },
  'caissier': { fr: 'caissier', en: 'cashier', de: 'kassierer', es: 'cajero' },
  'caissière': { fr: 'caissière', en: 'cashier', de: 'kassiererin', es: 'cajera' },
  'caissiere': { fr: 'caissiere', en: 'cashier', de: 'kassiererin', es: 'cajera' },
  'magasinier': { fr: 'magasinier', en: 'warehouse worker', de: 'lagerarbeiter', es: 'almacenero' },
  'manutentionnaire': { fr: 'manutentionnaire', en: 'warehouse handler', de: 'lagerarbeiter', es: 'manipulador' },
  'cariste': { fr: 'cariste', en: 'forklift operator', de: 'gabelstaplerfahrer', es: 'carretillero' },
  'ouvrier': { fr: 'ouvrier', en: 'worker', de: 'arbeiter', es: 'obrero' },
  'ouvrière': { fr: 'ouvrière', en: 'worker', de: 'arbeiterin', es: 'obrera' },
  'ouvriere': { fr: 'ouvriere', en: 'worker', de: 'arbeiterin', es: 'obrera' },
  'opérateur': { fr: 'opérateur', en: 'operator', de: 'bediener', es: 'operador' },
  'operateur': { fr: 'operateur', en: 'operator', de: 'bediener', es: 'operador' },
  'conducteur': { fr: 'conducteur', en: 'driver', de: 'fahrer', es: 'conductor' },
  'routier': { fr: 'routier', en: 'truck driver', de: 'lkw-fahrer', es: 'camionero' },
  'camionneur': { fr: 'camionneur', en: 'truck driver', de: 'lkw-fahrer', es: 'camionero' },
  'taxi': { fr: 'taxi', en: 'taxi driver', de: 'taxifahrer', es: 'taxista' },
  'guide touristique': { fr: 'guide touristique', en: 'tour guide', de: 'reiseführer', es: 'guía turístico' },
  'guide': { fr: 'guide', en: 'guide', de: 'führer', es: 'guía' },
  'agent de voyage': { fr: 'agent de voyage', en: 'travel agent', de: 'reisebürokaufmann', es: 'agente de viajes' },
  'hôtelier': { fr: 'hôtelier', en: 'hotel manager', de: 'hotelier', es: 'hotelero' },
  'hotelier': { fr: 'hotelier', en: 'hotel manager', de: 'hotelier', es: 'hotelero' },
  'restaurateur': { fr: 'restaurateur', en: 'restaurant owner', de: 'gastronom', es: 'restaurador' },
  'sommelier': { fr: 'sommelier', en: 'sommelier', de: 'sommelier', es: 'sumiller' },
  'diététicien': { fr: 'diététicien', en: 'dietitian', de: 'ernährungsberater', es: 'dietista' },
  'dieteticien': { fr: 'dieteticien', en: 'dietitian', de: 'ernährungsberater', es: 'dietista' },
  'nutritionniste': { fr: 'nutritionniste', en: 'nutritionist', de: 'ernährungswissenschaftler', es: 'nutricionista' },
  'préparateur': { fr: 'préparateur', en: 'preparer', de: 'vorbereiter', es: 'preparador' },
  'preparateur': { fr: 'preparateur', en: 'preparer', de: 'vorbereiter', es: 'preparador' },
  'laborantin': { fr: 'laborantin', en: 'lab technician', de: 'laborant', es: 'laboratorista' },
  'technicien de laboratoire': { fr: 'technicien de laboratoire', en: 'lab technician', de: 'labortechniker' },
  'radiologue': { fr: 'radiologue', en: 'radiologist', de: 'radiologe', es: 'radiólogo' },
  'anesthésiste': { fr: 'anesthésiste', en: 'anesthesiologist', de: 'anästhesist', es: 'anestesiólogo' },
  'anesthesiste': { fr: 'anesthesiste', en: 'anesthesiologist', de: 'anästhesist', es: 'anestesiólogo' },
  'orthophoniste': { fr: 'orthophoniste', en: 'speech therapist', de: 'logopäde', es: 'logopeda' },
  'ergothérapeute': { fr: 'ergothérapeute', en: 'occupational therapist', de: 'ergotherapeut', es: 'terapeuta ocupacional' },
  'ergotherapeute': { fr: 'ergotherapeute', en: 'occupational therapist', de: 'ergotherapeut', es: 'terapeuta ocupacional' },
  'podologue': { fr: 'podologue', en: 'podiatrist', de: 'podologe', es: 'podólogo' },
  'ophtalmologue': { fr: 'ophtalmologue', en: 'ophthalmologist', de: 'augenarzt', es: 'oftalmólogo' },
  'dermatologue': { fr: 'dermatologue', en: 'dermatologist', de: 'hautarzt', es: 'dermatólogo' },
  'cardiologue': { fr: 'cardiologue', en: 'cardiologist', de: 'kardiologe', es: 'cardiólogo' },
  'pédiatre': { fr: 'pédiatre', en: 'pediatrician', de: 'kinderarzt', es: 'pediatra' },
  'pediatre': { fr: 'pediatre', en: 'pediatrician', de: 'kinderarzt', es: 'pediatra' },
  'gynécologue': { fr: 'gynécologue', en: 'gynecologist', de: 'gynäkologe', es: 'ginecólogo' },
  'gynecologue': { fr: 'gynecologue', en: 'gynecologist', de: 'gynäkologe', es: 'ginecólogo' },
  'urologue': { fr: 'urologue', en: 'urologist', de: 'urologe', es: 'urólogo' },
  'oncologue': { fr: 'oncologue', en: 'oncologist', de: 'onkologe', es: 'oncólogo' },
  'psychiatre': { fr: 'psychiatre', en: 'psychiatrist', de: 'psychiater', es: 'psiquiatra' },
  'neurologue': { fr: 'neurologue', en: 'neurologist', de: 'neurologe', es: 'neurólogo' },
  'généraliste': { fr: 'généraliste', en: 'general practitioner', de: 'allgemeinmediziner', es: 'médico general' },
  'generaliste': { fr: 'generaliste', en: 'general practitioner', de: 'allgemeinmediziner', es: 'médico general' },
  'spécialiste': { fr: 'spécialiste', en: 'specialist', de: 'spezialist', es: 'especialista' },
  'specialiste': { fr: 'specialiste', en: 'specialist', de: 'spezialist', es: 'especialista' },
  'expert': { fr: 'expert', en: 'expert', de: 'experte', es: 'experto' },
  'audit': { fr: 'audit', en: 'audit', de: 'audit', es: 'auditoría' },
  'auditeur': { fr: 'auditeur', en: 'auditor', de: 'prüfer', es: 'auditor' },
  'contrôleur': { fr: 'contrôleur', en: 'controller', de: 'controller', es: 'controlador' },
  'controleur': { fr: 'controleur', en: 'controller', de: 'controller', es: 'controlador' },
  'acheteur': { fr: 'acheteur', en: 'buyer', de: 'einkäufer', es: 'comprador' },
  'acheteuse': { fr: 'acheteuse', en: 'buyer', de: 'einkäuferin', es: 'compradora' },
  'import': { fr: 'import', en: 'import', de: 'import', es: 'importación' },
  'export': { fr: 'export', en: 'export', de: 'export', es: 'exportación' },
  'qualité': { fr: 'qualité', en: 'quality', de: 'qualität', es: 'calidad' },
  'qualite': { fr: 'qualite', en: 'quality', de: 'qualität', es: 'calidad' },
  'sécurité': { fr: 'sécurité', en: 'security', de: 'sicherheit', es: 'seguridad' },
  'securite': { fr: 'securite', en: 'security', de: 'sicherheit', es: 'seguridad' },
  'maintenance': { fr: 'maintenance', en: 'maintenance', de: 'wartung', es: 'mantenimiento' },
  'production': { fr: 'production', en: 'production', de: 'produktion', es: 'producción' },
  'recherche': { fr: 'recherche', en: 'research', de: 'forschung', es: 'investigación' },
  'développement': { fr: 'développement', en: 'development', de: 'entwicklung', es: 'desarrollo' },
  'developpement': { fr: 'developpement', en: 'development', de: 'entwicklung', es: 'desarrollo' },
  'vente': { fr: 'vente', en: 'sales', de: 'verkauf', es: 'ventas' },
  'achat': { fr: 'achat', en: 'purchasing', de: 'einkauf', es: 'compras' },
  'comptabilité': { fr: 'comptabilité', en: 'accounting', de: 'buchhaltung', es: 'contabilidad' },
  'comptabilite': { fr: 'comptabilite', en: 'accounting', de: 'buchhaltung', es: 'contabilidad' },
  'finance': { fr: 'finance', en: 'finance', de: 'finanzen', es: 'finanzas' },
  'informatique': { fr: 'informatique', en: 'IT', de: 'informatik', es: 'informática' },
  'télécommunication': { fr: 'télécommunication', en: 'telecommunications', de: 'telekommunikation', es: 'telecomunicaciones' },
  'telecommunication': { fr: 'telecommunication', en: 'telecommunications', de: 'telekommunikation', es: 'telecomunicaciones' },
  'santé': { fr: 'santé', en: 'health', de: 'gesundheit', es: 'salud' },
  'sante': { fr: 'sante', en: 'health', de: 'gesundheit', es: 'salud' },
  'éducation': { fr: 'éducation', en: 'education', de: 'bildung', es: 'educación' },
  'education': { fr: 'education', en: 'education', de: 'bildung', es: 'educación' },
  'immobilier': { fr: 'immobilier', en: 'real estate', de: 'immobilien', es: 'inmobiliario' },
  'tourisme': { fr: 'tourisme', en: 'tourism', de: 'tourismus', es: 'turismo' },
  'hôtellerie': { fr: 'hôtellerie', en: 'hospitality', de: 'hotellerie', es: 'hostelería' },
  'hotellerie': { fr: 'hotellerie', en: 'hospitality', de: 'hotellerie', es: 'hostelería' },
  'restauration': { fr: 'restauration', en: 'catering', de: 'gastronomie', es: 'restauración' },
  'agriculture': { fr: 'agriculture', en: 'agriculture', de: 'landwirtschaft', es: 'agricultura' },
  'environnement': { fr: 'environnement', en: 'environment', de: 'umwelt', es: 'medio ambiente' },
  'énergie': { fr: 'énergie', en: 'energy', de: 'energie', es: 'energía' },
  'energie': { fr: 'energie', en: 'energy', de: 'energie', es: 'energía' },
  'transport': { fr: 'transport', en: 'transport', de: 'transport', es: 'transporte' },
  'aéronautique': { fr: 'aéronautique', en: 'aerospace', de: 'luftfahrt', es: 'aeronáutica' },
  'aeronautique': { fr: 'aeronautique', en: 'aerospace', de: 'luftfahrt', es: 'aeronáutica' },
  'automobile': { fr: 'automobile', en: 'automotive', de: 'automobil', es: 'automóvil' },
  'bâtiment': { fr: 'bâtiment', en: 'construction', de: 'bau', es: 'construcción' },
  'batiment': { fr: 'batiment', en: 'construction', de: 'bau', es: 'construcción' },
  'construction': { fr: 'construction', en: 'construction', de: 'bau', es: 'construcción' },
  'travaux publics': { fr: 'travaux publics', en: 'public works', de: 'tiefbau', es: 'obras públicas' },
  'textile': { fr: 'textile', en: 'textile', de: 'textil', es: 'textil' },
  'mode': { fr: 'mode', en: 'fashion', de: 'mode', es: 'moda' },
  'luxe': { fr: 'luxe', en: 'luxury', de: 'luxus', es: 'lujo' },
  'sport': { fr: 'sport', en: 'sports', de: 'sport', es: 'deporte' },
  'loisir': { fr: 'loisir', en: 'leisure', de: 'freizeit', es: 'ocio' },
  'culture': { fr: 'culture', en: 'culture', de: 'kultur', es: 'cultura' },
  'média': { fr: 'média', en: 'media', de: 'medien', es: 'medios' },
  'media': { fr: 'media', en: 'media', de: 'medien', es: 'medios' },
  'presse': { fr: 'presse', en: 'press', de: 'presse', es: 'prensa' },
  'édition': { fr: 'édition', en: 'publishing', de: 'verlag', es: 'edición' },
  'edition': { fr: 'edition', en: 'publishing', de: 'verlag', es: 'edición' },
  'cinéma': { fr: 'cinéma', en: 'cinema', de: 'kino', es: 'cine' },
  'cinema': { fr: 'cinema', en: 'cinema', de: 'kino', es: 'cine' },
  'musique': { fr: 'musique', en: 'music', de: 'musik', es: 'música' },
  'danse': { fr: 'danse', en: 'dance', de: 'tanz', es: 'danza' },
  'théâtre': { fr: 'théâtre', en: 'theater', de: 'theater', es: 'teatro' },
  'theatre': { fr: 'theatre', en: 'theater', de: 'theater', es: 'teatro' },
  'nettoyage': { fr: 'nettoyage', en: 'cleaning', de: 'reinigung', es: 'limpieza' },
  'ménage': { fr: 'ménage', en: 'housekeeping', de: 'haushalt', es: 'limpieza' },
  'menage': { fr: 'menage', en: 'housekeeping', de: 'haushalt', es: 'limpieza' },
  'garde d\'enfant': { fr: 'garde d\'enfant', en: 'childcare', de: 'kinderbetreuung', es: 'cuidado de niños' },
  'aide à domicile': { fr: 'aide à domicile', en: 'home care', de: 'häusliche pflege', es: 'ayuda a domicilio' },
  'aide a domicile': { fr: 'aide a domicile', en: 'home care', de: 'häusliche pflege', es: 'ayuda a domicilio' },
  'travail social': { fr: 'travail social', en: 'social work', de: 'sozialarbeit', es: 'trabajo social' },
  'assistant social': { fr: 'assistant social', en: 'social worker', de: 'sozialarbeiter', es: 'trabajador social' },
  'assistante sociale': { fr: 'assistante sociale', en: 'social worker', de: 'sozialarbeiterin', es: 'trabajadora social' },
}

const englishToFrenchKey: Record<string, string> = {};
for (const [frKey, tr] of Object.entries(commonJobTerms)) {
  const enLower = tr.en.toLowerCase();
  if (!englishToFrenchKey[enLower]) {
    englishToFrenchKey[enLower] = frKey;
  }
}

export interface EnhancedKeywordResult {
  keyword: string
  remainingWords: string
}

export function enhanceSearchKeyword(keyword: string, _country?: string, locale: string = 'fr'): EnhancedKeywordResult {
  if (!keyword || !keyword.trim()) {
    return { keyword: '', remainingWords: '' };
  }
  
  const lowerKeyword = keyword.toLowerCase().trim();

  if (locale === 'fr') {
    if (commonJobTerms[lowerKeyword]) {
      const translations = commonJobTerms[lowerKeyword];
      return { keyword: translations.en, remainingWords: '' };
    }

    const sortedEntries = Object.entries(commonJobTerms).sort(
      ([a], [b]) => b.length - a.length
    )
    for (const [frenchTerm, translations] of sortedEntries) {
      if (lowerKeyword.includes(frenchTerm)) {
        const translated = translations.en
        const remaining = lowerKeyword.replace(frenchTerm, '').trim()
        return { keyword: translated, remainingWords: remaining };
      }
    }

    return { keyword, remainingWords: '' };
  }

  if (englishToFrenchKey[lowerKeyword]) {
    const frKey = englishToFrenchKey[lowerKeyword];
    const translations = commonJobTerms[frKey];
    return { keyword: translations.en, remainingWords: '' };
  }

  const sortedEnEntries = Object.entries(commonJobTerms).sort(
    ([, a], [, b]) => b.en.length - a.en.length
  )
  for (const [, translations] of sortedEnEntries) {
    if (lowerKeyword.includes(translations.en.toLowerCase())) {
      const remaining = lowerKeyword.replace(translations.en.toLowerCase(), '').trim()
      return { keyword: translations.en, remainingWords: remaining };
    }
  }

  return { keyword, remainingWords: '' };
}

export function isFrenchKeyword(keyword: string): boolean {
  if (!keyword) return false;
  
  const lowerKeyword = keyword.toLowerCase();
  
  for (const frenchTerm of Object.keys(commonJobTerms)) {
    if (lowerKeyword.includes(frenchTerm)) {
      return true;
    }
  }
  
  return false;
}

export function getEnglishTranslation(frenchTerm: string): string | undefined {
  const translations = commonJobTerms[frenchTerm.toLowerCase()];
  return translations?.en;
}
