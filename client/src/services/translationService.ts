// Translation Service - Système de traduction statique pour remplacer Google Translate
// Translations pour les éléments principaux du site Amon Tour

export interface Translations {
  // Navigation
  nav: {
    experiences: string;
    cruise: string;
    customTrip: string;
    blog: string;
    contact: string;
  };
  // Hero Section
  hero: {
    title: string;
    subtitle: string;
    thailand: string;
    description: string;
    seeOffers: string;
    customTrip: string;
  };
  // Common elements
  common: {
    loading: string;
    error: string;
    tryAgain: string;
    learnMore: string;
    viewDetails: string;
    bookNow: string;
  };
  // Tours page
  tours: {
    title: string;
    description: string;
    duration: string;
    participants: string;
    price: string;
    featured: string;
  };
  // Home page sections
  home: {
    // Intro section
    introTitle: string;
    introDescription: string;
    
    // Custom trip form
    customTripTitle: string;
    customTripSubtitle: string;
    customTripDescription: string;
    fullName: string;
    email: string;
    countryCode: string;
    whatsappNumber: string;
    numberOfAdults: string;
    numberOfKids: string;
    numberOfKidsLabel: string;
    datesOfTrip: string;
    approximateDuration: string;
    tripTypes: string;
    destinations: string;
    describeIdealTrip: string;
    sendRequest: string;
    
    // Trip type options
    cultureHistory: string;
    natureAdventure: string;
    beachesIslands: string;
    familyTrip: string;
    groupTrip: string;
    weddingHoneymoon: string;
    
    // Destination options
    khaoSok: string;
    bangkok: string;
    krabi: string;
    chiangMai: string;
    kohMook: string;
    othersDestinations: string;
    
    // Some Ideas section
    someIdeasTitle: string;
    someIdeasDescription: string;
    
    // Why Choose Us section
    whyChooseTitle: string;
    whyChooseDescription: string;
    privateTours: string;
    privateToursDesc: string;
    customizedItineraries: string;
    customizedItinerariesDesc: string;
    authenticExperiences: string;
    authenticExperiencesDesc: string;
    privateCar: string;
    guide: string;
    safety: string;
    customRoute: string;
    flexibleTime: string;
    yourPace: string;
    localFood: string;
    localPeople: string;
    culture: string;
    
    // Who We Are section
    whoWeAreTitle: string;
    whoWeAreDescription: string;
    whoWeAreStory: string;
    
    // Deep Local Roots section
    deepLocalRootsTitle: string;
    deepLocalRootsDescription: string;
    deepLocalRootsExplanation: string;
    
    // Our Concept section
    ourConceptTitle: string;
    ourConceptDescription: string;
    
    // Testimonials section
    testimonialsTitle: string;
    testimonialsDescription: string;
    basedOnReviews: string;
    
    // Action buttons
    contactUs: string;
    createYourJourney: string;
  };
  // Footer
  footer: {
    contact: string;
    usefulLinks: string;
    newsletter: string;
    aboutUs: string;
    followUs: string;
    privacyPolicy: string;
    terms: string;
    subscribeNewsletter: string;
    privacyRespect: string;
    ourBrochure: string;
    krabiCelebration: string;
    funGarden: string;
    villasInKrabi: string;
    becomePartner: string;
    groupCorporate: string;
    legalNotice: string;
    allRightsReserved: string;
  };
}

const translations: Record<string, Translations> = {
  en: {
    nav: {
      experiences: "Experiences",
      cruise: "Cruise",
      customTrip: "Custom Trip",
      blog: "Blog",
      contact: "Contact"
    },
    hero: {
      title: "Your exclusive experiences",
      subtitle: "in Krabi",
      thailand: "THAILAND",
      description: "Discover amazing places away from mass tourism in Krabi. And also Khao Sok, Koh Mook and many more destinations.",
      seeOffers: "See our offers",
      customTrip: "Custom your trip"
    },
    common: {
      loading: "Loading...",
      error: "Error",
      tryAgain: "Try again",
      learnMore: "Learn more",
      viewDetails: "View details",
      bookNow: "Book now"
    },
    tours: {
      title: "Tours & Experiences",
      description: "Explore our curated selection of unique experiences in Thailand",
      duration: "Duration",
      participants: "Max participants", 
      price: "From",
      featured: "Featured Tours"
    },
    home: {
      introTitle: "When expats welcome you in their host country",
      introDescription: "This is a family-run travel agency that combines the organization of exclusive activities with the creation of tailor-made trips throughout the country. Our goal is to offer an immersive experience, far from mass tourism, with personalized service for every traveler — as if we were welcoming our own family or friends.",
      
      customTripTitle: "Create Your Custom Trip",
      customTripSubtitle: "Your travel story starts with your dreams -",
      customTripDescription: "let us write the rest.",
      fullName: "Full Name",
      email: "Email",
      countryCode: "Country Code",
      whatsappNumber: "WhatsApp Number",
      numberOfAdults: "Number of adults",
      numberOfKids: "Number of kids (under 12 years old)",
      numberOfKidsLabel: "Number of kids",
      datesOfTrip: "Dates of trip",
      approximateDuration: "Or approximate duration",
      tripTypes: "Trip Types",
      destinations: "Destinations",
      describeIdealTrip: "Describe your ideal trip",
      sendRequest: "Send my request",
      
      cultureHistory: "Culture & History",
      natureAdventure: "Nature & Adventure", 
      beachesIslands: "Beaches & Islands",
      familyTrip: "Family trip",
      groupTrip: "Group trip",
      weddingHoneymoon: "Wedding & Honeymoon",
      
      khaoSok: "Khao Sok",
      bangkok: "Bangkok",
      krabi: "Krabi",
      chiangMai: "Chiang Mai",
      kohMook: "Koh Mook",
      othersDestinations: "Others destinations",
      
      someIdeasTitle: "Some Ideas For Your Next Trip",
      someIdeasDescription: "Get inspired by our custom-designed travel experiences.",
      
      whyChooseTitle: "Why Choose Us",
      whyChooseDescription: "Experience an exclusive private day trip with our English or French-speaking and certified guides.",
      privateTours: "Private Tours",
      privateToursDesc: "Experience an exclusive day trip with our professional guides and private vehicles.",
      customizedItineraries: "Customized Itineraries",
      customizedItinerariesDesc: "Create your own journey based on your desires, your pace, and your interests.",
      authenticExperiences: "Authentic Experiences",
      authenticExperiencesDesc: "Discover destinations off the beaten path and immerse yourself in the local culture.",
      privateCar: "Private Car",
      guide: "Guide",
      safety: "Safety",
      customRoute: "Custom Route",
      flexibleTime: "Flexible Time",
      yourPace: "Your Pace",
      localFood: "Local Food",
      localPeople: "Local People",
      culture: "Culture",
      
      whoWeAreTitle: "Who We Are",
      whoWeAreDescription: "We are Eric, Margaux, Gabriel, and Raphaël, a French family living in Krabi, southern Thailand, since 2013.",
      whoWeAreStory: "From our life here, we created Amon Tour — a small, independent travel agency built on a simple idea: personally welcome our travelers to Krabi and offer them a different way to experience Thailand.",
      
      deepLocalRootsTitle: "Deep Local Roots",
      deepLocalRootsDescription: "We live here year-round, in the heart of the region we love. This close connection to the destination allows us to offer exclusive experiences in Krabi, designed and guided by our team of professional local guides or trusted partners.",
      deepLocalRootsExplanation: "You're not booking a generic tour — you're being welcomed, guided, and cared for by people who live here, who know the tides, the seasons, the crowds to avoid, and the hidden gems worth discovering.",
      
      ourConceptTitle: "Our Concept",
      ourConceptDescription: "Combine the warmth and proximity of a local agency in Krabi with the expertise of a tailor-made travel designer for all of Thailand. At Amon Tour, you're supported before, during, and after your trip. You're in contact with real people – a face, a voice, a team – not a call center or an algorithm. We're here, on the ground, to make your trip a seamless, personal, and unforgettable experience.",
      
      testimonialsTitle: "Our Travelers' Reviews",
      testimonialsDescription: "Discover the authentic experiences of our clients during their journeys with Amon Tour in Thailand.",
      basedOnReviews: "Based on 80 reviews",
      
      contactUs: "Contact Us",
      createYourJourney: "Create Your Journey"
    },
    footer: {
      contact: "Contact",
      usefulLinks: "Useful Links",
      newsletter: "Newsletter",
      aboutUs: "About Us",
      followUs: "Follow Us",
      privacyPolicy: "Privacy Policy", 
      terms: "Terms & Conditions",
      subscribeNewsletter: "Subscribe to receive our special offers and travel tips.",
      privacyRespect: "We respect your privacy. Unsubscribe at any time.",
      ourBrochure: "Our brochure",
      krabiCelebration: "Krabi Celebration",
      funGarden: "Fun Garden",
      villasInKrabi: "Villas in Krabi",
      becomePartner: "Become Partner",
      groupCorporate: "Group & Corporate",
      legalNotice: "Legal Notice",
      allRightsReserved: "All rights reserved."
    }
  },
  fr: {
    nav: {
      experiences: "Expériences",
      cruise: "Croisière",
      customTrip: "Voyage Sur Mesure",
      blog: "Blog",
      contact: "Contact"
    },
    hero: {
      title: "Vos expériences exclusives",
      subtitle: "à Krabi",
      thailand: "THAÏLANDE",
      description: "Découvrez des lieux extraordinaires loin du tourisme de masse à Krabi. Ainsi que Khao Sok, Koh Mook et bien d'autres destinations.",
      seeOffers: "Voir nos offres",
      customTrip: "Personnalisez votre voyage"
    },
    common: {
      loading: "Chargement...",
      error: "Erreur",
      tryAgain: "Réessayer",
      learnMore: "En savoir plus",
      viewDetails: "Voir les détails",
      bookNow: "Réserver"
    },
    tours: {
      title: "Tours & Expériences",
      description: "Explorez notre sélection d'expériences uniques en Thaïlande",
      duration: "Durée",
      participants: "Participants max",
      price: "À partir de",
      featured: "Tours Vedettes"
    },
    home: {
      introTitle: "Quand des expats vous accueillent dans leur pays d'adoption",
      introDescription: "Il s'agit d'une agence de voyage familiale qui combine l'organisation d'activités exclusives avec la création de voyages sur mesure à travers le pays. Notre objectif est d'offrir une expérience immersive, loin du tourisme de masse, avec un service personnalisé pour chaque voyageur — comme si nous accueillions notre propre famille ou nos amis.",
      
      customTripTitle: "Créez Votre Voyage Sur Mesure",
      customTripSubtitle: "Votre aventure commence par vos rêves -",
      customTripDescription: "laissez-nous écrire la suite.",
      fullName: "Nom complet",
      email: "Email",
      countryCode: "Code pays",
      whatsappNumber: "Numéro WhatsApp",
      numberOfAdults: "Nombre d'adultes",
      numberOfKids: "Nombre d'enfants (moins de 12 ans)",
      numberOfKidsLabel: "Nombre d'enfants",
      datesOfTrip: "Dates du voyage",
      approximateDuration: "Ou durée approximative",
      tripTypes: "Types de voyage",
      destinations: "Destinations",
      describeIdealTrip: "Décrivez votre voyage idéal",
      sendRequest: "Envoyer ma demande",
      
      cultureHistory: "Culture et Histoire",
      natureAdventure: "Nature et Aventure",
      beachesIslands: "Plages et Îles",
      familyTrip: "Voyage en famille",
      groupTrip: "Voyage de groupe",
      weddingHoneymoon: "Mariage et Lune de miel",
      
      khaoSok: "Khao Sok",
      bangkok: "Bangkok",
      krabi: "Krabi",
      chiangMai: "Chiang Mai",
      kohMook: "Koh Mook",
      othersDestinations: "Autres destinations",
      
      someIdeasTitle: "Quelques Idées Pour Votre Prochain Voyage",
      someIdeasDescription: "Inspirez-vous de nos expériences de voyage conçues sur mesure.",
      
      whyChooseTitle: "Pourquoi Nous Choisir",
      whyChooseDescription: "Vivez une excursion privée exclusive avec nos guides certifiés francophones ou anglophones.",
      privateTours: "Tours Privés",
      privateToursDesc: "Vivez une excursion exclusive avec nos guides professionnels et véhicules privés.",
      customizedItineraries: "Itinéraires Personnalisés",
      customizedItinerariesDesc: "Créez votre propre voyage selon vos désirs, votre rythme et vos intérêts.",
      authenticExperiences: "Expériences Authentiques",
      authenticExperiencesDesc: "Découvrez des destinations hors des sentiers battus et immergez-vous dans la culture locale.",
      privateCar: "Voiture Privée",
      guide: "Guide",
      safety: "Sécurité",
      customRoute: "Itinéraire Personnalisé",
      flexibleTime: "Horaires Flexibles",
      yourPace: "À Votre Rythme",
      localFood: "Cuisine Locale",
      localPeople: "Population Locale",
      culture: "Culture",
      
      whoWeAreTitle: "Qui Sommes-Nous",
      whoWeAreDescription: "Nous sommes Eric, Margaux, Gabriel et Raphaël, une famille française vivant à Krabi, dans le sud de la Thaïlande, depuis 2013.",
      whoWeAreStory: "De notre vie ici, nous avons créé Amon Tour — une petite agence de voyage indépendante basée sur une idée simple : accueillir personnellement nos voyageurs à Krabi et leur offrir une façon différente de découvrir la Thaïlande.",
      
      deepLocalRootsTitle: "Des Racines Locales Profondes",
      deepLocalRootsDescription: "Nous vivons ici toute l'année, au cœur de la région que nous aimons. Cette proximité avec la destination nous permet de proposer des expériences exclusives à Krabi, conçues et guidées par notre équipe de guides locaux professionnels ou partenaires de confiance.",
      deepLocalRootsExplanation: "Vous ne réservez pas un tour générique — vous êtes accueillis, guidés et pris en charge par des gens qui vivent ici, qui connaissent les marées, les saisons, les foules à éviter, et les trésors cachés qui valent le détour.",
      
      ourConceptTitle: "Notre Concept",
      ourConceptDescription: "Combiner la chaleur et la proximité d'une agence locale à Krabi avec l'expertise d'un concepteur de voyages sur mesure pour toute la Thaïlande. Chez Amon Tour, vous êtes accompagnés avant, pendant et après votre voyage. Vous êtes en contact avec de vraies personnes – un visage, une voix, une équipe – pas un centre d'appels ou un algorithme. Nous sommes là, sur le terrain, pour faire de votre voyage une expérience fluide, personnelle et inoubliable.",
      
      testimonialsTitle: "Les Avis de Nos Voyageurs",
      testimonialsDescription: "Découvrez les expériences authentiques de nos clients lors de leurs voyages avec Amon Tour en Thaïlande.",
      basedOnReviews: "Basé sur 80 avis",
      
      contactUs: "Contactez-Nous",
      createYourJourney: "Créez Votre Voyage"
    },
    footer: {
      contact: "Contact",
      usefulLinks: "Liens Utiles",
      newsletter: "Newsletter",
      aboutUs: "À Propos",
      followUs: "Suivez-Nous",
      privacyPolicy: "Politique de Confidentialité",
      terms: "Conditions Générales",
      subscribeNewsletter: "Abonnez-vous pour recevoir nos offres spéciales et conseils voyage.",
      privacyRespect: "Nous respectons votre vie privée. Désabonnez-vous à tout moment.",
      ourBrochure: "Notre brochure",
      krabiCelebration: "Krabi Celebration",
      funGarden: "Fun Garden",
      villasInKrabi: "Villas à Krabi",
      becomePartner: "Devenir Partenaire",
      groupCorporate: "Groupe & Entreprise",
      legalNotice: "Mentions Légales",
      allRightsReserved: "Tous droits réservés."
    }
  },
  es: {
    nav: {
      experiences: "Experiencias",
      cruise: "Crucero",
      customTrip: "Viaje Personalizado",
      blog: "Blog",
      contact: "Contacto"
    },
    hero: {
      title: "Tus experiencias exclusivas",
      subtitle: "en Krabi",
      thailand: "TAILANDIA", 
      description: "Descubre lugares increíbles lejos del turismo masivo en Krabi. Y también Khao Sok, Koh Mook y muchos más destinos.",
      seeOffers: "Ver nuestras ofertas",
      customTrip: "Personaliza tu viaje"
    },
    common: {
      loading: "Cargando...",
      error: "Error",
      tryAgain: "Intentar de nuevo",
      learnMore: "Saber más",
      viewDetails: "Ver detalles",
      bookNow: "Reservar"
    },
    tours: {
      title: "Tours y Experiencias",
      description: "Explora nuestra selección de experiencias únicas en Tailandia",
      duration: "Duración",
      participants: "Participantes máx",
      price: "Desde",
      featured: "Tours Destacados"
    },
    home: {
      introTitle: "Cuando expatriados te reciben en su país de acogida",
      introDescription: "Esta es una agencia de viajes familiar que combina la organización de actividades exclusivas con la creación de viajes a medida por todo el país. Nuestro objetivo es ofrecer una experiencia inmersiva, lejos del turismo de masas, con un servicio personalizado para cada viajero — como si estuviéramos recibiendo a nuestra propia familia o amigos.",
      
      customTripTitle: "Crea Tu Viaje Personalizado",
      customTripSubtitle: "Tu historia de viaje comienza con tus sueños -",
      customTripDescription: "déjanos escribir el resto.",
      fullName: "Nombre completo",
      email: "Email",
      countryCode: "Código de país",
      whatsappNumber: "Número de WhatsApp",
      numberOfAdults: "Número de adultos",
      numberOfKids: "Número de niños (menores de 12 años)",
      numberOfKidsLabel: "Número de niños",
      datesOfTrip: "Fechas del viaje",
      approximateDuration: "O duración aproximada",
      tripTypes: "Tipos de viaje",
      destinations: "Destinos",
      describeIdealTrip: "Describe tu viaje ideal",
      sendRequest: "Enviar mi solicitud",
      
      cultureHistory: "Cultura e Historia",
      natureAdventure: "Naturaleza y Aventura",
      beachesIslands: "Playas e Islas",
      familyTrip: "Viaje familiar",
      groupTrip: "Viaje en grupo",
      weddingHoneymoon: "Boda y Luna de miel",
      
      khaoSok: "Khao Sok",
      bangkok: "Bangkok",
      krabi: "Krabi",
      chiangMai: "Chiang Mai",
      kohMook: "Koh Mook",
      othersDestinations: "Otros destinos",
      
      someIdeasTitle: "Algunas Ideas Para Tu Próximo Viaje",
      someIdeasDescription: "Inspírate con nuestras experiencias de viaje diseñadas a medida.",
      
      whyChooseTitle: "Por Qué Elegirnos",
      whyChooseDescription: "Vive una excursión privada exclusiva con nuestros guías certificados de habla inglesa o francesa.",
      privateTours: "Tours Privados",
      privateToursDesc: "Vive una excursión exclusiva con nuestros guías profesionales y vehículos privados.",
      customizedItineraries: "Itinerarios Personalizados",
      customizedItinerariesDesc: "Crea tu propio viaje basado en tus deseos, tu ritmo y tus intereses.",
      authenticExperiences: "Experiencias Auténticas",
      authenticExperiencesDesc: "Descubre destinos fuera de los caminos trillados y sumérgete en la cultura local.",
      privateCar: "Coche Privado",
      guide: "Guía",
      safety: "Seguridad",
      customRoute: "Ruta Personalizada",
      flexibleTime: "Horario Flexible",
      yourPace: "A Tu Ritmo",
      localFood: "Comida Local",
      localPeople: "Gente Local",
      culture: "Cultura",
      
      whoWeAreTitle: "Quiénes Somos",
      whoWeAreDescription: "Somos Eric, Margaux, Gabriel y Raphaël, una familia francesa viviendo en Krabi, sur de Tailandia, desde 2013.",
      whoWeAreStory: "De nuestra vida aquí, creamos Amon Tour — una pequeña agencia de viajes independiente construida sobre una idea simple: recibir personalmente a nuestros viajeros en Krabi y ofrecerles una manera diferente de experimentar Tailandia.",
      
      deepLocalRootsTitle: "Raíces Locales Profundas",
      deepLocalRootsDescription: "Vivimos aquí todo el año, en el corazón de la región que amamos. Esta estrecha conexión con el destino nos permite ofrecer experiencias exclusivas en Krabi, diseñadas y guiadas por nuestro equipo de guías locales profesionales o socios de confianza.",
      deepLocalRootsExplanation: "No estás reservando un tour genérico — estás siendo recibido, guiado y cuidado por personas que viven aquí, que conocen las mareas, las estaciones, las multitudes que evitar, y las gemas ocultas que vale la pena descubrir.",
      
      ourConceptTitle: "Nuestro Concepto",
      ourConceptDescription: "Combinar la calidez y proximidad de una agencia local en Krabi con la experiencia de un diseñador de viajes a medida para toda Tailandia. En Amon Tour, tienes apoyo antes, durante y después de tu viaje. Estás en contacto con personas reales – una cara, una voz, un equipo – no un centro de llamadas o un algoritmo. Estamos aquí, sobre el terreno, para hacer de tu viaje una experiencia fluida, personal e inolvidable.",
      
      testimonialsTitle: "Reseñas de Nuestros Viajeros",
      testimonialsDescription: "Descubre las experiencias auténticas de nuestros clientes durante sus viajes con Amon Tour en Tailandia.",
      basedOnReviews: "Basado en 80 reseñas",
      
      contactUs: "Contáctanos",
      createYourJourney: "Crea Tu Viaje"
    },
    footer: {
      contact: "Contacto",
      usefulLinks: "Enlaces Útiles",
      newsletter: "Newsletter",
      aboutUs: "Acerca de Nosotros",
      followUs: "Síguenos",
      privacyPolicy: "Política de Privacidad",
      terms: "Términos y Condiciones",
      subscribeNewsletter: "Suscríbete para recibir nuestras ofertas especiales y consejos de viaje.",
      privacyRespect: "Respetamos tu privacidad. Cancela la suscripción en cualquier momento.",
      ourBrochure: "Nuestro folleto",
      krabiCelebration: "Krabi Celebration",
      funGarden: "Fun Garden",
      villasInKrabi: "Villas en Krabi",
      becomePartner: "Convertirse en Socio",
      groupCorporate: "Grupo y Empresarial",
      legalNotice: "Aviso Legal",
      allRightsReserved: "Todos los derechos reservados."
    }
  }
};

export class TranslationService {
  private currentLanguage: string = 'en';
  
  constructor() {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && translations[savedLanguage]) {
      this.currentLanguage = savedLanguage;
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  setLanguage(language: string): boolean {
    if (translations[language]) {
      this.currentLanguage = language;
      localStorage.setItem('preferred-language', language);
      return true;
    }
    return false;
  }

  getTranslations(): Translations {
    return translations[this.currentLanguage] || translations.en;
  }

  // Helper methods for specific sections
  getNav() {
    return this.getTranslations().nav;
  }

  getHero() {
    return this.getTranslations().hero;
  }

  getCommon() {
    return this.getTranslations().common;
  }

  getTours() {
    return this.getTranslations().tours;
  }

  getHome() {
    return this.getTranslations().home;
  }

  getFooter() {
    return this.getTranslations().footer;
  }

  // Method to translate a specific key path
  translate(keyPath: string): string {
    const keys = keyPath.split('.');
    let value: any = this.getTranslations();
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        // Return the key if translation not found
        return keyPath;
      }
    }
    
    return typeof value === 'string' ? value : keyPath;
  }
}

// Create global translation service instance
export const translationService = new TranslationService();
export const t = (key: string) => translationService.translate(key);