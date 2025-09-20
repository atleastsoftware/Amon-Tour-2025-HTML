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
    orContactDirectly: string;
    contactWhatsApp: string;
    
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
    
    // Tailor-made trips section
    tailorMadeTitle: string;
    tailorMadeDescription: string;
    
    // Action buttons
    contactUs: string;
    createYourJourney: string;
  };
  // Footer
  footer: {
    contact: string;
    usefulLinks: string;
    newsletter: string;
    defaultNewsletterTitle: string;
    defaultNewsletterDescription: string;
    defaultPrivacyText: string;
    copyright: string;
    legalNotice: string;
    privacyPolicy: string;
    termsConditions: string;
  };
  // Cruise page
  cruise: {
    title: string;
    subtitle: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    numberOfPassengers: string;
    maximumPassengers: string;
    desiredDuration: string;
    chooseDuration: string;
    preferredDates: string;
    approximateBudget: string;
    selectSeason: string;
    preferredDestinations: string;
    specialRequests: string;
    
    // Duration options
    oneDay: string;
    twoDays: string;
    threeFourDays: string;
    fiveSixDays: string;
    sevenPlusDays: string;
    
    // Season options
    lowSeasonOption: string;
    highSeasonOption: string;
    veryHighSeasonOption: string;
    
    // Placeholders
    fullNamePlaceholder: string;
    emailPlaceholder: string;
    phonePlaceholder: string;
    datesPlaceholder: string;
    destinationsPlaceholder: string;
    specialRequestsPlaceholder: string;
    
    // Messages
    requestSent: string;
    contactShortly: string;
    error: string;
    errorMessage: string;
    sending: string;
    sendRequest: string;
    orContactDirectly: string;
    contactWhatsApp: string;

    // Main cruise page content
    freedomExclusivity: string;
    freedomDescription: string;
    tailorMadeRoutes: string;
    tailorMadeDesc: string;
    expertCrew: string;
    expertCrewDesc: string;
    totalFreedom: string;
    totalFreedomDesc: string;
    lagoonCatamaran: string;
    lagoonDesc1: string;
    lagoonDesc2: string;
    lagoonDesc3: string;
    routeSuggestions: string;
    routeDescription: string;
    oneDayRoute: string;
    twoDaysRoute: string;
    threeFourDaysRoute: string;
    fiveSixDaysRoute: string;
    sevenPlusDaysRoute: string;
    
    // Pricing section
    seasonalPricing: string;
    perfectForHolidays: string;
    veryHighSeason: string;
    highSeason: string;
    lowSeason: string;
    peakPeriodRates: string;
    premiumPeriodRates: string;
    bestValueRates: string;
    perDay: string;
    period: string;
    dailyRateMinimum: string;
    fromTubkeak: string;
    fromThalane: string;
    fromAoNang: string;
    fromKlongMueang: string;
    fromRailay: string;
    noExtraFee: string;
    includedInPrice: string;
    includedDescription: string;
    notIncludedInPrice: string;
    notIncludedDescription: string;
  };
  // Custom Tour page
  customTour: {
    title: string;
    subtitle: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    whyChoose: string;
    whyChooseDescription: string;
    flexibleItinerary: string;
    flexibleItineraryDescription: string;
    tailoredAccommodations: string;
    tailoredAccommodationsDescription: string;
    personalizedSupport: string;
    personalizedSupportDescription: string;
  };
  // Page Headers - Headers for all pages
  pageHeaders: {
    contact: {
      title: string;
      subtitle: string;
      getInTouch: string;
      readyToExplore: string;
      email: string;
      phone: string;
      location: string;
      whatsapp: string;
      line: string;
    };
    experiences: {
      title: string;
      subtitle: string;
      searchPlaceholder: string;
      organizeDreamTrip: string;
    };
    blog: {
      title: string;
      subtitle: string;
    };
    tours: {
      title: string;
      subtitle: string;
    };
    krabiCelebration: {
      title: string;
      subtitle: string;
    };
    becomePartner: {
      title: string;
      subtitle: string;
    };
    groupCorporate: {
      title: string;
      subtitle: string;
    };
    villasKrabi: {
      title: string;
      subtitle: string;
    };
    brochure: {
      title: string;
      subtitle: string;
    };
  };
  // Messages - General content messages
  messages: {
    missingInformation: string;
    missingInformationDesc: string;
    redirectingWhatsApp: string;
    redirectingWhatsAppDesc: string;
    formSubmitted: string;
    formSubmittedDesc: string;
    errorOccurred: string;
    errorOccurredDesc: string;
  };
  // Buttons - Button texts for public interface
  buttons: {
    viewDetails: string;
    bookNow: string;
    seeOffers: string;
    customTrip: string;
    exploreTours: string;
    createJourney: string;
    sendRequest: string;
    contactWhatsApp: string;
    backToTours: string;
    home: string;
    subscribe: string;
    copyLink: string;
    shareLink: string;
    downloadPdf: string;
    clearFilters: string;
    contactUs: string;
    aboutUs: string;
    // Nouvelles traductions ajoutées
    searchArticles: string;
    allTags: string;
    allCategories: string;
    chatWhatsApp: string;
    sendEmail: string;
    close: string;
    cancel: string;
    confirm: string;
    accept: string;
    reject: string;
    customize: string;
    acceptAll: string;
    rejectAll: string;
    readMore: string;
  };
  // Toast Messages - Success/error messages
  toasts: {
    subscriptionSuccess: string;
    subscriptionSuccessDesc: string;
    subscriptionFailed: string;
    emailAlreadyExists: string;
    invalidEmail: string;
    tooManyAttempts: string;
    linkCopied: string;
    linkCopyFailed: string;
    requestSent: string;
    requestSentDesc: string;
    requestFailed: string;
    requestFailedDesc: string;
  };
  // SEO defaults
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    defaultKeywords: string;
  };
  // Notification bar
  notifications: {
    welcomeBar: string;
  };
  // Cookie consent
  cookies: {
    title: string;
    description: string;
    acceptAll: string;
    rejectAll: string;
    customize: string;
    privacyNotice: string;
  };
  // Blog interface
  blog: {
    title: string;
    subtitle: string;
    tags: string;
    categories: string;
    allTags: string;
    allCategories: string;
    searchPlaceholder: string;
    noResults: string;
    loading: string;
  };
  // SEO for all pages
  seoMeta: {
    // Contact page
    contactTitle: string;
    contactDescription: string;
    contactKeywords: string;
    // Experiences page
    experiencesTitle: string;
    experiencesDescription: string;
    experiencesKeywords: string;
    // Blog page
    blogTitle: string;
    blogDescription: string;
    blogKeywords: string;
    // Brochure page
    brochureTitle: string;
    brochureDescription: string;
    brochureKeywords: string;
    // Group corporate page
    groupCorporateTitle: string;
    groupCorporateDescription: string;
    groupCorporateKeywords: string;
  };
  // Error pages and messages
  errors: {
    notFound: string;
    tourNotFound: string;
    articleNotFound: string;
    pageNotFound: string;
    somethingWentWrong: string;
    tryAgain: string;
    backToHome: string;
    backToTours: string;
    backToBlog: string;
    loading: string;
    noImage: string;
    imageLoadFailed: string;
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
      description: "Explore our finest experiences in Krabi, all guaranteed off the beaten path: private and semi-private sea tours, unique land excursions (kayaking through mangroves, waterfalls, tropical jungle, centuries-old trees, temples, karst caves, natural pools), and exclusive 2-day / 1-night packages.",
      duration: "Duration",
      participants: "Max participants", 
      price: "From",
      featured: "Our exclusive experiences"
    },
    home: {
      introTitle: "When expats welcome you in their host country",
      introDescription: "Since 2013, our family-run travel agency has been curating exclusive activities around Krabi and designing tailor-made trips all across Thailand. We aim to deliver immersive travel experiences, away from mass tourism, with personalized service for every traveler — welcoming you as part of our family or close friends.",
      
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
      orContactDirectly: "Or contact us directly via WhatsApp",
      contactWhatsApp: "Contact via WhatsApp",
      
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
      
      tailorMadeTitle: "Our Tailor-made trips",
      tailorMadeDescription: "Design your own journey through Thailand with our tailor-made stays: from cultural discoveries and family adventures to romantic getaways and island escapes. Every itinerary is crafted to match your wishes, offering authentic experiences, quality services, and a unique immersion far from mass tourism.",
      
      contactUs: "Contact Us",
      createYourJourney: "Create Your Journey"
    },
    cruise: {
      title: "Custom Quote Request",
      subtitle: "Fill out the form below and we will contact you within 24 hours.",
      fullName: "Full Name",
      email: "Email",
      phoneNumber: "Phone Number (Optional)",
      numberOfPassengers: "Number of Passengers",
      maximumPassengers: "Maximum 8 passengers",
      desiredDuration: "Desired Duration",
      chooseDuration: "Choose a duration",
      preferredDates: "Preferred Dates (Optional)",
      approximateBudget: "Approximate Budget (Optional)",
      selectSeason: "Select a season",
      preferredDestinations: "Preferred Destinations (Optional)",
      specialRequests: "Special Requests (Optional)",
      
      // Duration options
      oneDay: "1 day",
      twoDays: "2 days",
      threeFourDays: "3-4 days",
      fiveSixDays: "5-6 days",
      sevenPlusDays: "7 days and more",
      
      // Season options
      lowSeasonOption: "Low season (28,000 THB/day)",
      highSeasonOption: "High season (31,000 THB/day)",
      veryHighSeasonOption: "Very high season (39,000 THB/day)",
      
      // Placeholders
      fullNamePlaceholder: "Your full name",
      emailPlaceholder: "your@email.com",
      phonePlaceholder: "+66 XX XXX XXXX",
      datesPlaceholder: "Ex: January 15-20, 2025",
      destinationsPlaceholder: "Ex: Koh Phi Phi, Koh Hong...",
      specialRequestsPlaceholder: "Dietary requirements, birthday celebration, etc.",
      
      // Messages
      requestSent: "Request sent!",
      contactShortly: "We will contact you shortly.",
      error: "Error",
      errorMessage: "An error occurred. Please try again.",
      sending: "Sending...",
      sendRequest: "Send Request",
    orContactDirectly: "Or contact us directly via WhatsApp",
    contactWhatsApp: "Contact via WhatsApp",

      // Main cruise page content
      freedomExclusivity: "Freedom and Exclusivity",
      freedomDescription: "Navigate towards exclusivity aboard one of the rare catamaran cruises departing from Krabi. Explore the Andaman Sea as few travelers have the chance to do: in complete freedom, away from tourist circuits, with an itinerary designed entirely for you.",
      
      tailorMadeRoutes: "Tailor-made routes",
      tailorMadeDesc: "We compose your itinerary to reveal the best of the region, prioritizing preserved sites and exceptional moments.",
      expertCrew: "Expert crew", 
      expertCrewDesc: "Our captains have perfect mastery of these waters. They optimize each navigation by adapting to weather conditions, tides and winds to maximize your pleasure.",
      totalFreedom: "Total freedom",
      totalFreedomDesc: "Deserted beaches, turquoise lagoons, snorkeling in crystal-clear waters... Your cruise evolves according to your preferences.",
      
      lagoonCatamaran: "A Lagoon 470 Catamaran",
      lagoonDesc1: "Built in 1999 and constantly improved since 2023, combines comfort and character. It has 4 double cabins with private bathrooms: two cabins with queen-size beds (160 cm) and two with double beds (140 cm). Each cabin is equipped with fans, 220V sockets and large storage spaces.",
      lagoonDesc2: "Spacious and well-designed, the Lagoon offers seamless flow between the interior and exterior living spaces: large, bright living room, equipped kitchen, shaded cockpit, sunbathing area at the front, etc. The discreet engine ensures peaceful navigation.",
      lagoonDesc3: "Perfect for holidays with family, friends or private charter, this boat guarantees your comfort, privacy and freedom to explore the most beautiful islands of the Andaman Sea.",
      
      routeSuggestions: "Route suggestions",
      routeDescription: "Each itinerary adapts to the season and natural conditions to guarantee you an optimal experience.",
      oneDayRoute: "Local islands of Ao Nang or Koh Hong archipelago",
      twoDaysRoute: "Head towards Koh Hong or the legendary Koh Phi Phi",
      threeFourDaysRoute: "Combined Phang Nga Bay and Koh Phi Phi",
      fiveSixDaysRoute: "Getaway to the preserved waters of Koh Rok and Koh Mook",
      sevenPlusDaysRoute: "Odyssey to the paradise islands of Koh Lipe or Similan",
      
      // Pricing section
      seasonalPricing: "Seasonal Pricing",
      perfectForHolidays: "Perfect for holidays with family, friends or private charter",
      veryHighSeason: "Very High Season",
      highSeason: "High Season",
      lowSeason: "Low Season",
      peakPeriodRates: "Peak period rates",
      premiumPeriodRates: "Premium period rates", 
      bestValueRates: "Best value rates",
      perDay: "per day",
      period: "Period:",
      dailyRateMinimum: "Daily rate for minimum 2 days and one night. Capacity 8 adults max.",
      
      fromTubkeak: "from Tubkeak",
      fromThalane: "from Thalane", 
      fromAoNang: "from Ao Nang",
      fromKlongMueang: "from Klong Mueang",
      fromRailay: "from Railay",
      noExtraFee: "No extra fee",
      
      includedInPrice: "Included in Price",
      includedDescription: "Boat rental with captain, assistant and professional English-speaking guide, fuel, semi-rigid dinghy for 5 to 6 people with an 18 HP engine, BBQ, fishing equipment and a paddleboard, fresh fruit, sodas, water. Breakfast (tea, coffee, toast, omelet).",
      notIncludedInPrice: "Not Included in Price", 
      notIncludedDescription: "Transfers (on request), national park fees (depending on the itinerary), beer, wine, spirits. Lunch and dinner (Thai cuisine): 500 Baht per person per meal. Please let us know your preferences and we will provision the boat accordingly."
    },
    customTour: {
      title: "Create Your Custom Tour",
      subtitle: "Tell us what you'd like to discover, and we'll create your personalized itinerary.",
      seoTitle: "Create Your Custom Thailand Experience",
      seoDescription: "Design your own personalized Thailand tour. Tell us your preferences, and our local experts will craft a customized itinerary just for you.",
      seoKeywords: "custom thailand tour, personalized travel, tailor-made itinerary, private guide thailand, custom travel experience",
      whyChoose: "Why Choose a Custom Tour?",
      whyChooseDescription: "A personalized journey offers a unique experience tailored to your desires, pace, and budget.",
      flexibleItinerary: "Flexible Itinerary",
      flexibleItineraryDescription: "Choose the destinations that interest you and set your own travel pace.",
      tailoredAccommodations: "Tailored Accommodations",
      tailoredAccommodationsDescription: "Select accommodations that match your preferences and budget.",
      personalizedSupport: "Personalized Support",
      personalizedSupportDescription: "Benefit from expert advice and an English-speaking guide for an authentic experience."
    },
    pageHeaders: {
      contact: {
        title: "Contact Us",
        subtitle: "We're here to help you plan the perfect experience in Krabi.",
        getInTouch: "Get In Touch",
        readyToExplore: "Ready to explore Krabi? Contact us through any of the methods below. Our friendly team is here to answer your questions and help you plan an unforgettable experience.",
        email: "Email",
        phone: "Phone",
        location: "Location",
        whatsapp: "WhatsApp",
        line: "Line"
      },
      experiences: {
        title: "Discover Thailand Experiences",
        subtitle: "Immerse yourself in authentic Thai culture with our unique experiences",
        searchPlaceholder: "Search experiences...",
        organizeDreamTrip: "Contact us to organize your dream trip to Thailand."
      },
      blog: {
        title: "Travel Blog",
        subtitle: "Discover the best of Krabi through our travel guides, tips, and local insights."
      },
      tours: {
        title: "Our Experiences",
        subtitle: "Discover the exceptional beauty of Krabi and southern Thailand."
      },
      krabiCelebration: {
        title: "Krabi Celebration",
        subtitle: "Unique Moments in Exceptional Settings"
      },
      becomePartner: {
        title: "Become Our Partner",
        subtitle: "Join our network of trusted local partners"
      },
      groupCorporate: {
        title: "Group & Corporate Travel",
        subtitle: "Tailored Experiences in Krabi"
      },
      villasKrabi: {
        title: "Villas in Krabi",
        subtitle: "Curated Villa Selection"
      },
      brochure: {
        title: "Our Brochure",
        subtitle: "Amon Tour Travel Guide"
      }
    },
    messages: {
      missingInformation: "Missing Information",
      missingInformationDesc: "Please fill in all required fields before proceeding.",
      redirectingWhatsApp: "Redirecting to WhatsApp",
      redirectingWhatsAppDesc: "We've prepared your message for you!",
      formSubmitted: "Request Sent",
      formSubmittedDesc: "We will contact you shortly.",
      errorOccurred: "Error Occurred",
      errorOccurredDesc: "An error occurred. Please try again."
    },
    buttons: {
      viewDetails: "View details",
      bookNow: "Book Now",
      seeOffers: "See our offers",
      customTrip: "Custom your trip",
      exploreTours: "Explore Our Tours", 
      createJourney: "Create Your Journey",
      sendRequest: "Send Request",
      contactWhatsApp: "Contact via WhatsApp",
      backToTours: "Back to tours",
      home: "Home",
      subscribe: "Subscribe",
      copyLink: "Copy Link",
      shareLink: "Share",
      downloadPdf: "Download PDF",
      clearFilters: "Clear filters",
      contactUs: "Contact us",
      aboutUs: "About us",
      // Nouvelles traductions ajoutées
      searchArticles: "Search articles",
      allTags: "All Tags",
      allCategories: "All Categories",
      chatWhatsApp: "Chat on WhatsApp",
      sendEmail: "Send Email",
      close: "Close",
      cancel: "Cancel",
      confirm: "Confirm",
      accept: "Accept",
      reject: "Reject",
      customize: "Customize",
      acceptAll: "Accept All",
      rejectAll: "Reject All",
      readMore: "Read More"
    },
    toasts: {
      subscriptionSuccess: "Subscription Successful!",
      subscriptionSuccessDesc: "Thank you for subscribing! You have been successfully added to our newsletter.",
      subscriptionFailed: "Subscription Failed",
      emailAlreadyExists: "This email is already registered to our newsletter.",
      invalidEmail: "Please enter a valid email address.",
      tooManyAttempts: "Too many attempts. Please try again in a few minutes.",
      linkCopied: "Link Copied",
      linkCopyFailed: "Failed to copy link",
      requestSent: "Request Sent",
      requestSentDesc: "We will respond to your inquiry as soon as possible.",
      requestFailed: "Request Failed",
      requestFailedDesc: "There was a problem sending your message. Please try again."
    },
    seo: {
      defaultTitle: "Amon Tour - Authentic Thailand Travel Experiences",
      defaultDescription: "Plan your perfect Thailand vacation with Amon Tour - expert-guided private tours, cultural experiences & custom itineraries. Explore Bangkok, Phuket, Krabi & hidden gems. Family-run agency since 2017.",
      defaultKeywords: "thailand tours, bangkok travel, phuket tours, krabi tours, private tours thailand, custom thailand itinerary, thailand vacation planner, authentic thai experiences, cultural tours thailand, family travel agency, thailand trip planning, best thailand tours, thailand travel guide"
    },
    notifications: {
      welcomeBar: "Welcome to Amon Tour! Discover authentic Thailand experiences 🇹🇭"
    },
    cookies: {
      title: "We use cookies",
      description: "We use cookies to enhance your experience and analyze site usage. By continuing to use this site, you agree to our use of cookies.",
      acceptAll: "Accept All",
      rejectAll: "Reject All",
      customize: "Customize",
      privacyNotice: "Privacy Notice"
    },
    blog: {
      title: "Travel Blog",
      subtitle: "Discover Thailand through our expert insights and travel guides",
      tags: "Tags",
      categories: "Categories",
      allTags: "All Tags",
      allCategories: "All Categories",
      searchPlaceholder: "Search articles...",
      noResults: "No articles found",
      loading: "Loading articles..."
    },
    seoMeta: {
      contactTitle: "Contact Amon Tour - Plan Your Thailand Adventure",
      contactDescription: "Get in touch with Amon Tour for personalized Thailand travel planning. Expert guidance for Krabi, Bangkok, Phuket tours and custom itineraries.",
      contactKeywords: "contact amon tour, thailand travel planner, krabi tour agency, custom thailand tours, thailand travel consultation",
      experiencesTitle: "Thailand Tours & Experiences - Amon Tour",
      experiencesDescription: "Explore our authentic Thailand tours and experiences. Private tours, cultural adventures, and off-the-beaten-path discoveries in Krabi and beyond.",
      experiencesKeywords: "thailand tours, krabi experiences, private thailand tours, cultural tours thailand, authentic travel experiences",
      blogTitle: "Thailand Travel Blog - Amon Tour Insights",
      blogDescription: "Discover Thailand through our travel blog. Expert tips, cultural insights, and travel guides for Bangkok, Phuket, Krabi and hidden gems.",
      blogKeywords: "thailand travel blog, thailand travel tips, krabi travel guide, bangkok insights, phuket recommendations",
      brochureTitle: "Thailand Travel Brochure - Amon Tour",
      brochureDescription: "Download our comprehensive Thailand travel brochure with tour details, itineraries, and planning information for your perfect vacation.",
      brochureKeywords: "thailand travel brochure, tour catalog, thailand vacation planning, travel itineraries",
      groupCorporateTitle: "Corporate & Group Tours Thailand - Amon Tour",
      groupCorporateDescription: "Specialized corporate and group travel services in Thailand. Team building, incentive trips, and customized group experiences.",
      groupCorporateKeywords: "corporate tours thailand, group travel thailand, team building thailand, incentive travel"
    },
    errors: {
      notFound: "Not Found",
      tourNotFound: "Tour not found",
      articleNotFound: "Article not found",
      pageNotFound: "Page not found",
      somethingWentWrong: "Something went wrong",
      tryAgain: "Try again",
      backToHome: "Back to Home",
      backToTours: "Back to Tours",
      backToBlog: "Back to Blog",
      loading: "Loading...",
      noImage: "No image available",
      imageLoadFailed: "Failed to load image"
    },
    footer: {
      contact: "Contact",
      usefulLinks: "Useful Links", 
      newsletter: "Newsletter",
      defaultNewsletterTitle: "Newsletter",
      defaultNewsletterDescription: "Subscribe to receive our special offers and travel tips.",
      defaultPrivacyText: "We respect your privacy. Unsubscribe at any time.",
      copyright: "All rights reserved.",
      legalNotice: "Legal Notice",
      privacyPolicy: "Privacy Policy",
      termsConditions: "Terms & Conditions"
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
      description: "Naviguez parmi nos plus belles expériences à Krabi, toutes garanties hors du tourisme de masse : croisières en mer privées et semi-privées, excursions terrestres uniques (kayak dans la mangrove, cascades, jungle tropicale, arbres centenaires, temples, grottes karstiques, piscines naturelles) et formules exclusives de 2 jours / 1 nuit.",
      duration: "Durée",
      participants: "Participants max",
      price: "À partir de",
      featured: "Nos expériences exclusives"
    },
    home: {
      introTitle: "Quand des expats vous reçoivent dans leurs pays d'accueil",
      introDescription: "Depuis 2023, notre agence de voyage familiale conçoit des activités exclusives autour de Krabi et des séjours sur mesure à travers toute la Thaïlande. Notre ambition est d'offrir des expériences de voyage immersives, loin du tourisme de masse, avec un service personnalisé pour chaque voyageur — comme si nous vous accueillions en famille ou entre amis.",
      
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
      orContactDirectly: "Ou contactez-nous directement via WhatsApp",
      contactWhatsApp: "Contacter via WhatsApp",
      
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
      
      tailorMadeTitle: "Nos séjours personnalisés",
      tailorMadeDescription: "Créez votre propre voyage en Thaïlande grâce à nos séjours personnalisés : découvertes culturelles, aventures en famille, escapades romantiques ou séjours insulaires. Chaque itinéraire est conçu selon vos envies, pour offrir des expériences authentiques, des services de qualité et une immersion unique, loin du tourisme de masse.",
      
      contactUs: "Contactez-Nous",
      createYourJourney: "Créez Votre Voyage"
    },
    cruise: {
      title: "Demande de Devis Personnalisé",
      subtitle: "Remplissez le formulaire ci-dessous et nous vous contacterons sous 24 heures.",
      fullName: "Nom complet",
      email: "Email",
      phoneNumber: "Numéro de téléphone (Optionnel)",
      numberOfPassengers: "Nombre de passagers",
      maximumPassengers: "Maximum 8 passagers",
      desiredDuration: "Durée souhaitée",
      chooseDuration: "Choisissez une durée",
      preferredDates: "Dates préférées (Optionnel)",
      approximateBudget: "Budget approximatif (Optionnel)",
      selectSeason: "Sélectionnez une saison",
      preferredDestinations: "Destinations préférées (Optionnel)",
      specialRequests: "Demandes spéciales (Optionnel)",
      
      // Duration options
      oneDay: "1 jour",
      twoDays: "2 jours",
      threeFourDays: "3-4 jours",
      fiveSixDays: "5-6 jours",
      sevenPlusDays: "7 jours et plus",
      
      // Season options
      lowSeasonOption: "Basse saison (28 000 THB/jour)",
      highSeasonOption: "Haute saison (31 000 THB/jour)",
      veryHighSeasonOption: "Très haute saison (39 000 THB/jour)",
      
      // Placeholders
      fullNamePlaceholder: "Votre nom complet",
      emailPlaceholder: "votre@email.com",
      phonePlaceholder: "+66 XX XXX XXXX",
      datesPlaceholder: "Ex: 15-20 janvier 2025",
      destinationsPlaceholder: "Ex: Koh Phi Phi, Koh Hong...",
      specialRequestsPlaceholder: "Exigences alimentaires, célébration d'anniversaire, etc.",
      
      // Messages
      requestSent: "Demande envoyée !",
      contactShortly: "Nous vous contacterons sous peu.",
      error: "Erreur",
      errorMessage: "Une erreur s'est produite. Veuillez réessayer.",
      sending: "Envoi en cours...",
      sendRequest: "Envoyer la demande",
    orContactDirectly: "Ou contactez-nous directement via WhatsApp",
    contactWhatsApp: "Contacter via WhatsApp",

      // Main cruise page content
      freedomExclusivity: "Liberté et Exclusivité",
      freedomDescription: "Naviguez vers l'exclusivité à bord de l'une des rares croisières en catamaran au départ de Krabi. Explorez la mer d'Andaman comme peu de voyageurs ont la chance de le faire : en toute liberté, loin des circuits touristiques, avec un itinéraire conçu entièrement pour vous.",
      
      tailorMadeRoutes: "Parcours sur mesure",
      tailorMadeDesc: "Nous composons votre itinéraire pour révéler le meilleur de la région, en privilégiant les sites préservés et les moments d'exception.",
      expertCrew: "Équipage expert",
      expertCrewDesc: "Nos capitaines ont une parfaite maîtrise de ces eaux. Ils optimisent chaque navigation en s'adaptant aux conditions météorologiques, aux marées et aux vents pour maximiser votre plaisir.",
      totalFreedom: "Liberté totale",
      totalFreedomDesc: "Plages désertes, lagons turquoise, snorkeling dans des eaux cristallines... Votre croisière évolue selon vos préférences.",
      
      lagoonCatamaran: "Un Catamaran Lagoon 470",
      lagoonDesc1: "Construit en 1999 et constamment amélioré depuis 2023, allie confort et caractère. Il dispose de 4 cabines doubles avec salles de bain privées : deux cabines avec lits queen-size (160 cm) et deux avec lits doubles (140 cm). Chaque cabine est équipée de ventilateurs, prises 220V et grands espaces de rangement.",
      lagoonDesc2: "Spacieux et bien conçu, le Lagoon offre une circulation fluide entre les espaces de vie intérieurs et extérieurs : grand salon lumineux, cuisine équipée, cockpit ombragé, zone de bronzage à l'avant, etc. Le moteur discret assure une navigation paisible.",
      lagoonDesc3: "Parfait pour des vacances en famille, entre amis ou en charter privé, ce bateau garantit votre confort, votre intimité et votre liberté d'explorer les plus belles îles de la mer d'Andaman.",
      
      routeSuggestions: "Suggestions d'itinéraires",
      routeDescription: "Chaque itinéraire s'adapte à la saison et aux conditions naturelles pour vous garantir une expérience optimale.",
      oneDayRoute: "Îles locales d'Ao Nang ou archipel de Koh Hong",
      twoDaysRoute: "Direction Koh Hong ou le légendaire Koh Phi Phi",
      threeFourDaysRoute: "Baie de Phang Nga et Koh Phi Phi combinés",
      fiveSixDaysRoute: "Escapade vers les eaux préservées de Koh Rok et Koh Mook",
      sevenPlusDaysRoute: "Odyssée vers les îles paradisiaques de Koh Lipe ou Similan",
      
      // Pricing section
      seasonalPricing: "Tarification Saisonnière",
      perfectForHolidays: "Parfait pour des vacances en famille, entre amis ou en charter privé",
      veryHighSeason: "Très Haute Saison",
      highSeason: "Haute Saison",
      lowSeason: "Basse Saison",
      peakPeriodRates: "Tarifs période de pointe",
      premiumPeriodRates: "Tarifs période premium",
      bestValueRates: "Tarifs meilleur rapport qualité-prix",
      perDay: "par jour",
      period: "Période :",
      dailyRateMinimum: "Tarif journalier pour un minimum de 2 jours et une nuit. Capacité 8 adultes max.",
      
      fromTubkeak: "depuis Tubkeak",
      fromThalane: "depuis Thalane",
      fromAoNang: "depuis Ao Nang",
      fromKlongMueang: "depuis Klong Mueang",
      fromRailay: "depuis Railay",
      noExtraFee: "Pas de supplément",
      
      includedInPrice: "Inclus dans le Prix",
      includedDescription: "Location bateau avec capitaine, assistant et guide anglophone professionnel, carburant, annexe semi-rigide pour 5 à 6 personnes avec moteur 18 CV, BBQ, équipement de pêche et paddle, fruits frais, sodas, eau. Petit-déjeuner (thé, café, toast, omelette).",
      notIncludedInPrice: "Non Inclus dans le Prix",
      notIncludedDescription: "Transferts (sur demande), frais de parcs nationaux (selon l'itinéraire), bière, vin, spiritueux. Déjeuner et dîner (cuisine thaï) : 500 Baht par personne par repas. Merci de nous faire connaître vos préférences et nous approvisionnerons le bateau en conséquence."
    },
    customTour: {
      title: "Créez Votre Voyage Sur Mesure",
      subtitle: "Dites-nous ce que vous aimeriez découvrir, et nous créerons votre itinéraire personnalisé.",
      seoTitle: "Créez Votre Expérience Thaïlandaise Sur Mesure",
      seoDescription: "Concevez votre propre voyage personnalisé en Thaïlande. Dites-nous vos préférences et nos experts locaux créeront un itinéraire sur mesure rien que pour vous.",
      seoKeywords: "voyage sur mesure thailande, voyage personnalisé, itinéraire sur mesure, guide privé thailande, expérience voyage personnalisée",
      whyChoose: "Pourquoi Choisir un Voyage Sur Mesure ?",
      whyChooseDescription: "Un voyage personnalisé offre une expérience unique adaptée à vos envies, votre rythme et votre budget.",
      flexibleItinerary: "Itinéraire Flexible",
      flexibleItineraryDescription: "Choisissez les destinations qui vous intéressent et définissez votre propre rythme de voyage.",
      tailoredAccommodations: "Hébergements Sur Mesure",
      tailoredAccommodationsDescription: "Sélectionnez des hébergements qui correspondent à vos préférences et votre budget.",
      personalizedSupport: "Support Personnalisé",
      personalizedSupportDescription: "Bénéficiez des conseils d'experts et d'un guide anglophone pour une expérience authentique."
    },
    pageHeaders: {
      contact: {
        title: "Nous Contacter",
        subtitle: "Nous sommes là pour vous aider à planifier la parfaite expérience à Krabi.",
        getInTouch: "Prenez Contact",
        readyToExplore: "Prêt à explorer Krabi ? Contactez-nous par n'importe laquelle des méthodes ci-dessous. Notre équipe amicale est là pour répondre à vos questions et vous aider à planifier une expérience inoubliable.",
        email: "Email",
        phone: "Téléphone",
        location: "Emplacement",
        whatsapp: "WhatsApp",
        line: "Line"
      },
      experiences: {
        title: "Découvrez les Expériences de Thaïlande",
        subtitle: "Immergez-vous dans la culture thaï authentique avec nos expériences uniques",
        searchPlaceholder: "Rechercher des expériences...",
        organizeDreamTrip: "Contactez-nous pour organiser le voyage de vos rêves en Thaïlande."
      },
      blog: {
        title: "Blog de Voyage",
        subtitle: "Découvrez le meilleur de Krabi à travers nos guides de voyage, conseils et aperçus locaux."
      },
      tours: {
        title: "Nos Expériences",
        subtitle: "Découvrez la beauté exceptionnelle de Krabi et du sud de la Thaïlande."
      },
      krabiCelebration: {
        title: "Krabi Celebration",
        subtitle: "Moments Uniques dans des Cadres Exceptionnels"
      },
      becomePartner: {
        title: "Devenez Notre Partenaire",
        subtitle: "Rejoignez notre réseau de partenaires locaux de confiance"
      },
      groupCorporate: {
        title: "Voyages de Groupe et d'Entreprise",
        subtitle: "Expériences Sur Mesure à Krabi"
      },
      villasKrabi: {
        title: "Villas à Krabi",
        subtitle: "Sélection de Villas Choisies"
      },
      brochure: {
        title: "Notre Brochure",
        subtitle: "Guide de Voyage Amon Tour"
      }
    },
    messages: {
      missingInformation: "Informations Manquantes",
      missingInformationDesc: "Veuillez remplir tous les champs obligatoires avant de continuer.",
      redirectingWhatsApp: "Redirection vers WhatsApp",
      redirectingWhatsAppDesc: "Nous avons préparé votre message pour vous !",
      formSubmitted: "Demande Envoyée",
      formSubmittedDesc: "Nous vous contacterons sous peu.",
      errorOccurred: "Erreur Survenue",
      errorOccurredDesc: "Une erreur s'est produite. Veuillez réessayer."
    },
    buttons: {
      viewDetails: "Voir les détails",
      bookNow: "Réserver",
      seeOffers: "Voir nos offres",
      customTrip: "Personnalisez votre voyage",
      exploreTours: "Explorer Nos Tours",
      createJourney: "Créez Votre Voyage",
      sendRequest: "Envoyer ma demande",
      contactWhatsApp: "Contacter via WhatsApp",
      backToTours: "Retour aux tours",
      home: "Accueil",
      subscribe: "S'abonner",
      copyLink: "Copier le lien",
      shareLink: "Partager",
      downloadPdf: "Télécharger PDF",
      clearFilters: "Effacer les filtres",
      contactUs: "Nous contacter",
      aboutUs: "À propos",
      // Nouvelles traductions ajoutées
      searchArticles: "Rechercher articles",
      allTags: "Tous les Tags",
      allCategories: "Toutes les Catégories",
      chatWhatsApp: "Chatter sur WhatsApp",
      sendEmail: "Envoyer Email",
      close: "Fermer",
      cancel: "Annuler",
      confirm: "Confirmer",
      accept: "Accepter",
      reject: "Refuser",
      customize: "Personnaliser",
      acceptAll: "Tout Accepter",
      rejectAll: "Tout Refuser",
      readMore: "Lire Plus"
    },
    toasts: {
      subscriptionSuccess: "Inscription réussie !",
      subscriptionSuccessDesc: "Merci de vous être abonné ! Vous avez été ajouté avec succès à notre newsletter.",
      subscriptionFailed: "Échec de l'inscription",
      emailAlreadyExists: "Cette adresse email est déjà inscrite à notre newsletter.",
      invalidEmail: "Veuillez entrer une adresse email valide.",
      tooManyAttempts: "Trop de tentatives. Veuillez réessayer dans quelques minutes.",
      linkCopied: "Lien copié",
      linkCopyFailed: "Impossible de copier le lien",
      requestSent: "Demande envoyée",
      requestSentDesc: "Nous répondrons à votre demande dès que possible.",
      requestFailed: "Échec de la demande",
      requestFailedDesc: "Il y a eu un problème lors de l'envoi de votre message. Veuillez réessayer."
    },
    seo: {
      defaultTitle: "Amon Tour - Expériences Authentiques de Voyage en Thaïlande",
      defaultDescription: "Planifiez vos vacances parfaites en Thaïlande avec Amon Tour - tours privés avec guides experts, expériences culturelles et itinéraires sur mesure. Explorez Bangkok, Phuket, Krabi et joyaux cachés. Agence familiale depuis 2017.",
      defaultKeywords: "tours thaïlande, voyage bangkok, tours phuket, tours krabi, tours privés thaïlande, itinéraire sur mesure thaïlande, planificateur vacances thaïlande, expériences authentiques thaï, tours culturels thaïlande, agence voyage familiale, planification voyage thaïlande, meilleurs tours thaïlande, guide voyage thaïlande"
    },
    notifications: {
      welcomeBar: "Bienvenue chez Amon Tour ! Découvrez des expériences authentiques en Thaïlande 🇹🇭"
    },
    cookies: {
      title: "Nous utilisons des cookies",
      description: "Nous utilisons des cookies pour améliorer votre expérience et analyser l'utilisation du site. En continuant à utiliser ce site, vous acceptez notre utilisation des cookies.",
      acceptAll: "Tout Accepter",
      rejectAll: "Tout Refuser",
      customize: "Personnaliser",
      privacyNotice: "Notice de Confidentialité"
    },
    blog: {
      title: "Blog de Voyage",
      subtitle: "Découvrez la Thaïlande à travers nos conseils d'experts et guides de voyage",
      tags: "Tags",
      categories: "Catégories",
      allTags: "Tous les Tags",
      allCategories: "Toutes les Catégories",
      searchPlaceholder: "Rechercher des articles...",
      noResults: "Aucun article trouvé",
      loading: "Chargement des articles..."
    },
    seoMeta: {
      contactTitle: "Contactez Amon Tour - Planifiez Votre Aventure en Thaïlande",
      contactDescription: "Contactez Amon Tour pour la planification personnalisée de voyages en Thaïlande. Conseils d'experts pour les tours de Krabi, Bangkok, Phuket et itinéraires sur mesure.",
      contactKeywords: "contact amon tour, planificateur voyage thaïlande, agence tour krabi, tours sur mesure thaïlande, consultation voyage thaïlande",
      experiencesTitle: "Tours et Expériences en Thaïlande - Amon Tour",
      experiencesDescription: "Explorez nos tours et expériences authentiques en Thaïlande. Tours privés, aventures culturelles et découvertes hors des sentiers battus à Krabi et au-delà.",
      experiencesKeywords: "tours thaïlande, expériences krabi, tours privés thaïlande, tours culturels thaïlande, expériences voyage authentiques",
      blogTitle: "Blog Voyage Thaïlande - Conseils Amon Tour",
      blogDescription: "Découvrez la Thaïlande à travers notre blog voyage. Conseils d'experts, aperçus culturels et guides de voyage pour Bangkok, Phuket, Krabi et joyaux cachés.",
      blogKeywords: "blog voyage thaïlande, conseils voyage thaïlande, guide krabi, conseils bangkok, recommandations phuket",
      brochureTitle: "Brochure Voyage Thaïlande - Amon Tour",
      brochureDescription: "Téléchargez notre brochure complète de voyage en Thaïlande avec détails des tours, itinéraires et informations de planification pour vos vacances parfaites.",
      brochureKeywords: "brochure voyage thaïlande, catalogue tours, planification vacances thaïlande, itinéraires voyage",
      groupCorporateTitle: "Tours Corporatifs et Groupes Thaïlande - Amon Tour",
      groupCorporateDescription: "Services spécialisés de voyage corporatif et groupe en Thaïlande. Team building, voyages incitation et expériences personnalisées pour groupes.",
      groupCorporateKeywords: "tours corporatifs thaïlande, voyage groupe thaïlande, team building thaïlande, voyage incitation"
    },
    errors: {
      notFound: "Non Trouvé",
      tourNotFound: "Tour non trouvé",
      articleNotFound: "Article non trouvé",
      pageNotFound: "Page non trouvée",
      somethingWentWrong: "Quelque chose s'est mal passé",
      tryAgain: "Réessayer",
      backToHome: "Retour à l'Accueil",
      backToTours: "Retour aux Tours",
      backToBlog: "Retour au Blog",
      loading: "Chargement...",
      noImage: "Aucune image disponible",
      imageLoadFailed: "Échec du chargement de l'image"
    },
    footer: {
      contact: "Contact",
      usefulLinks: "Liens Utiles",
      newsletter: "Newsletter",
      defaultNewsletterTitle: "Newsletter",
      defaultNewsletterDescription: "Abonnez-vous pour recevoir nos offres spéciales et conseils voyage.",
      defaultPrivacyText: "Nous respectons votre vie privée. Désabonnez-vous à tout moment.",
      copyright: "Tous droits réservés.",
      legalNotice: "Mentions Légales",
      privacyPolicy: "Politique de Confidentialité",
      termsConditions: "Conditions Générales"
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
      description: "Explora nuestras mejores experiencias en Krabi, todas garantizadas fuera del camino trillado: excursiones privadas y semiprivadas por el mar, excursiones terrestres únicas (kayak por manglares, cascadas, selva tropical, árboles centenarios, templos, cuevas kársticas, piscinas naturales), y paquetes exclusivos de 2 días / 1 noche.",
      duration: "Duración",
      participants: "Participantes máx",
      price: "Desde",
      featured: "Nuestras experiencias exclusivas"
    },
    home: {
      introTitle: "Cuando expatriados te reciben en su país de acogida",
      introDescription: "Desde 2013, nuestra agencia de viajes familiar ha estado organizando actividades exclusivas alrededor de Krabi y diseñando viajes a medida por toda Tailandia. Buscamos ofrecer experiencias de viaje inmersivas, lejos del turismo de masas, con un servicio personalizado para cada viajero — recibiéndote como parte de nuestra familia o amigos cercanos.",
      
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
      orContactDirectly: "O contáctanos directamente a través de WhatsApp",
      contactWhatsApp: "Contactar vía WhatsApp",
      
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
      
      tailorMadeTitle: "Nuestros viajes personalizados",
      tailorMadeDescription: "Crea tu propio viaje por Tailandia con nuestras estancias personalizadas: desde descubrimientos culturales y aventuras familiares hasta escapadas románticas y retiros insulares. Cada itinerario está diseñado según tus deseos, ofreciendo experiencias auténticas, servicios de calidad y una inmersión única, lejos del turismo de masas.",
      
      contactUs: "Contáctanos",
      createYourJourney: "Crea Tu Viaje"
    },
    cruise: {
      title: "Solicitud de Cotización Personalizada",
      subtitle: "Complete el formulario a continuación y nos pondremos en contacto con usted en 24 horas.",
      fullName: "Nombre completo",
      email: "Email",
      phoneNumber: "Número de teléfono (Opcional)",
      numberOfPassengers: "Número de pasajeros",
      maximumPassengers: "Máximo 8 pasajeros",
      desiredDuration: "Duración deseada",
      chooseDuration: "Elija una duración",
      preferredDates: "Fechas preferidas (Opcional)",
      approximateBudget: "Presupuesto aproximado (Opcional)",
      selectSeason: "Seleccione una temporada",
      preferredDestinations: "Destinos preferidos (Opcional)",
      specialRequests: "Solicitudes especiales (Opcional)",
      
      // Duration options
      oneDay: "1 día",
      twoDays: "2 días",
      threeFourDays: "3-4 días",
      fiveSixDays: "5-6 días",
      sevenPlusDays: "7 días y más",
      
      // Season options
      lowSeasonOption: "Temporada baja (28,000 THB/día)",
      highSeasonOption: "Temporada alta (31,000 THB/día)",
      veryHighSeasonOption: "Temporada muy alta (39,000 THB/día)",
      
      // Placeholders
      fullNamePlaceholder: "Su nombre completo",
      emailPlaceholder: "su@email.com",
      phonePlaceholder: "+66 XX XXX XXXX",
      datesPlaceholder: "Ej: 15-20 enero 2025",
      destinationsPlaceholder: "Ej: Koh Phi Phi, Koh Hong...",
      specialRequestsPlaceholder: "Requisitos dietéticos, celebración de cumpleaños, etc.",
      
      // Messages
      requestSent: "¡Solicitud enviada!",
      contactShortly: "Nos pondremos en contacto pronto.",
      error: "Error",
      errorMessage: "Ocurrió un error. Por favor intente de nuevo.",
      sending: "Enviando...",
      sendRequest: "Enviar solicitud",
    orContactDirectly: "O contáctanos directamente a través de WhatsApp",
    contactWhatsApp: "Contactar vía WhatsApp",

      // Main cruise page content
      freedomExclusivity: "Libertad y Exclusividad",
      freedomDescription: "Navegue hacia la exclusividad a bordo de uno de los raros cruceros en catamarán que parten de Krabi. Explore el Mar de Andamán como pocos viajeros tienen la oportunidad de hacerlo: en completa libertad, lejos de los circuitos turísticos, con un itinerario diseñado completamente para usted.",
      
      tailorMadeRoutes: "Rutas a medida",
      tailorMadeDesc: "Componemos su itinerario para revelar lo mejor de la región, priorizando sitios preservados y momentos excepcionales.",
      expertCrew: "Tripulación experta",
      expertCrewDesc: "Nuestros capitanes tienen un dominio perfecto de estas aguas. Optimizan cada navegación adaptándose a las condiciones meteorológicas, mareas y vientos para maximizar su placer.",
      totalFreedom: "Libertad total",
      totalFreedomDesc: "Playas desiertas, lagunas turquesas, snorkel en aguas cristalinas... Su crucero evoluciona según sus preferencias.",
      
      lagoonCatamaran: "Un Catamarán Lagoon 470",
      lagoonDesc1: "Construido en 1999 y constantemente mejorado desde 2023, combina comodidad y carácter. Tiene 4 cabinas dobles con baños privados: dos cabinas con camas queen-size (160 cm) y dos con camas dobles (140 cm). Cada cabina está equipada con ventiladores, enchufes de 220V y grandes espacios de almacenamiento.",
      lagoonDesc2: "Espacioso y bien diseñado, el Lagoon ofrece un flujo perfecto entre los espacios de vida interiores y exteriores: sala de estar grande y luminosa, cocina equipada, cabina sombreada, área de bronceado en el frente, etc. El motor discreto asegura una navegación tranquila.",
      lagoonDesc3: "Perfecto para vacaciones en familia, con amigos o charter privado, este barco garantiza su comodidad, privacidad y libertad para explorar las islas más hermosas del Mar de Andamán.",
      
      routeSuggestions: "Sugerencias de rutas",
      routeDescription: "Cada itinerario se adapta a la estación y condiciones naturales para garantizarle una experiencia óptima.",
      oneDayRoute: "Islas locales de Ao Nang o archipiélago de Koh Hong",
      twoDaysRoute: "Dirección hacia Koh Hong o la legendaria Koh Phi Phi",
      threeFourDaysRoute: "Bahía de Phang Nga y Koh Phi Phi combinadas",
      fiveSixDaysRoute: "Escapada a las aguas preservadas de Koh Rok y Koh Mook",
      sevenPlusDaysRoute: "Odisea a las islas paradisíacas de Koh Lipe o Similan",
      
      // Pricing section
      seasonalPricing: "Precios Estacionales",
      perfectForHolidays: "Perfecto para vacaciones en familia, con amigos o charter privado",
      veryHighSeason: "Temporada Muy Alta",
      highSeason: "Temporada Alta",
      lowSeason: "Temporada Baja",
      peakPeriodRates: "Tarifas período pico",
      premiumPeriodRates: "Tarifas período premium",
      bestValueRates: "Tarifas mejor valor",
      perDay: "por día",
      period: "Período:",
      dailyRateMinimum: "Tarifa diaria por mínimo 2 días y una noche. Capacidad 8 adultos máx.",
      
      fromTubkeak: "desde Tubkeak",
      fromThalane: "desde Thalane",
      fromAoNang: "desde Ao Nang",
      fromKlongMueang: "desde Klong Mueang",
      fromRailay: "desde Railay",
      noExtraFee: "Sin cargo extra",
      
      includedInPrice: "Incluido en el Precio",
      includedDescription: "Alquiler de barco con capitán, asistente y guía profesional de habla inglesa, combustible, bote semirrígido para 5 a 6 personas con motor de 18 HP, BBQ, equipo de pesca y paddleboard, frutas frescas, refrescos, agua. Desayuno (té, café, tostadas, tortilla).",
      notIncludedInPrice: "No Incluido en el Precio",
      notIncludedDescription: "Traslados (bajo pedido), tarifas de parques nacionales (según el itinerario), cerveza, vino, licores. Almuerzo y cena (cocina tailandesa): 500 Baht por persona por comida. Por favor háganos saber sus preferencias y abasteceremos el barco en consecuencia."
    },
    customTour: {
      title: "Cree Su Tour Personalizado",
      subtitle: "Díganos qué le gustaría descubrir, y crearemos su itinerario personalizado.",
      seoTitle: "Cree Su Experiencia Tailandesa Personalizada",
      seoDescription: "Diseñe su propio tour personalizado por Tailandia. Díganos sus preferencias y nuestros expertos locales crearán un itinerario personalizado solo para usted.",
      seoKeywords: "tour personalizado tailandia, viaje personalizado, itinerario a medida, guía privado tailandia, experiencia de viaje personalizada",
      whyChoose: "¿Por Qué Elegir un Tour Personalizado?",
      whyChooseDescription: "Un viaje personalizado ofrece una experiencia única adaptada a sus deseos, ritmo y presupuesto.",
      flexibleItinerary: "Itinerario Flexible",
      flexibleItineraryDescription: "Elija los destinos que le interesen y establezca su propio ritmo de viaje.",
      tailoredAccommodations: "Alojamientos Personalizados",
      tailoredAccommodationsDescription: "Seleccione alojamientos que coincidan con sus preferencias y presupuesto.",
      personalizedSupport: "Soporte Personalizado",
      personalizedSupportDescription: "Benefíciese del consejo experto y un guía de habla inglesa para una experiencia auténtica."
    },
    pageHeaders: {
      contact: {
        title: "Contáctanos",
        subtitle: "Estamos aquí para ayudarte a planificar la experiencia perfecta en Krabi.",
        getInTouch: "Ponte en Contacto",
        readyToExplore: "¿Listo para explorar Krabi? Contáctanos por cualquiera de los métodos a continuación. Nuestro equipo amigable está aquí para responder tus preguntas y ayudarte a planificar una experiencia inolvidable.",
        email: "Email",
        phone: "Teléfono",
        location: "Ubicación",
        whatsapp: "WhatsApp",
        line: "Line"
      },
      experiences: {
        title: "Descubre las Experiencias de Tailandia",
        subtitle: "Sumérgete en la cultura tailandesa auténtica con nuestras experiencias únicas",
        searchPlaceholder: "Buscar experiencias...",
        organizeDreamTrip: "Contáctanos para organizar el viaje de tus sueños a Tailandia."
      },
      blog: {
        title: "Blog de Viajes",
        subtitle: "Descubre lo mejor de Krabi a través de nuestras guías de viaje, consejos y perspectivas locales."
      },
      tours: {
        title: "Nuestras Experiencias",
        subtitle: "Descubre la belleza excepcional de Krabi y el sur de Tailandia."
      },
      krabiCelebration: {
        title: "Krabi Celebration",
        subtitle: "Momentos Únicos en Entornos Excepcionales"
      },
      becomePartner: {
        title: "Conviértete en Nuestro Socio",
        subtitle: "Únete a nuestra red de socios locales de confianza"
      },
      groupCorporate: {
        title: "Viajes de Grupo y Corporativos",
        subtitle: "Experiencias Personalizadas en Krabi"
      },
      villasKrabi: {
        title: "Villas en Krabi",
        subtitle: "Selección Curada de Villas"
      },
      brochure: {
        title: "Nuestro Folleto",
        subtitle: "Guía de Viaje Amon Tour"
      }
    },
    messages: {
      missingInformation: "Información Faltante",
      missingInformationDesc: "Por favor complete todos los campos obligatorios antes de continuar.",
      redirectingWhatsApp: "Redirigiendo a WhatsApp",
      redirectingWhatsAppDesc: "¡Hemos preparado tu mensaje para ti!",
      formSubmitted: "Solicitud Enviada",
      formSubmittedDesc: "Te contactaremos pronto.",
      errorOccurred: "Ocurrió un Error",
      errorOccurredDesc: "Ocurrió un error. Por favor intenta de nuevo."
    },
    buttons: {
      viewDetails: "Ver detalles",
      bookNow: "Reservar",
      seeOffers: "Ver nuestras ofertas",
      customTrip: "Personaliza tu viaje",
      exploreTours: "Explorar Nuestros Tours",
      createJourney: "Crea Tu Viaje",
      sendRequest: "Enviar solicitud",
      contactWhatsApp: "Contactar vía WhatsApp",
      backToTours: "Volver a tours",
      home: "Inicio",
      subscribe: "Suscribirse",
      copyLink: "Copiar enlace",
      shareLink: "Compartir",
      downloadPdf: "Descargar PDF",
      clearFilters: "Limpiar filtros",
      contactUs: "Contáctanos",
      aboutUs: "Acerca de nosotros",
      // Nuevas traducciones añadidas
      searchArticles: "Buscar artículos",
      allTags: "Todos los Tags",
      allCategories: "Todas las Categorías",
      chatWhatsApp: "Chat en WhatsApp",
      sendEmail: "Enviar Email",
      close: "Cerrar",
      cancel: "Cancelar",
      confirm: "Confirmar",
      accept: "Aceptar",
      reject: "Rechazar",
      customize: "Personalizar",
      acceptAll: "Aceptar Todo",
      rejectAll: "Rechazar Todo",
      readMore: "Leer Más"
    },
    toasts: {
      subscriptionSuccess: "¡Suscripción exitosa!",
      subscriptionSuccessDesc: "¡Gracias por suscribirte! Has sido añadido exitosamente a nuestro boletín.",
      subscriptionFailed: "Suscripción fallida",
      emailAlreadyExists: "Este email ya está registrado en nuestro boletín.",
      invalidEmail: "Por favor ingresa una dirección de email válida.",
      tooManyAttempts: "Demasiados intentos. Por favor intenta de nuevo en unos minutos.",
      linkCopied: "Enlace copiado",
      linkCopyFailed: "Error al copiar enlace",
      requestSent: "Solicitud enviada",
      requestSentDesc: "Responderemos a tu consulta lo antes posible.",
      requestFailed: "Solicitud fallida",
      requestFailedDesc: "Hubo un problema enviando tu mensaje. Por favor intenta de nuevo."
    },
    seo: {
      defaultTitle: "Amon Tour - Experiencias Auténticas de Viaje en Tailandia",
      defaultDescription: "Planifica tus vacaciones perfectas en Tailandia con Amon Tour - tours privados con guías expertos, experiencias culturales e itinerarios personalizados. Explora Bangkok, Phuket, Krabi y gemas ocultas. Agencia familiar desde 2017.",
      defaultKeywords: "tours tailandia, viaje bangkok, tours phuket, tours krabi, tours privados tailandia, itinerario personalizado tailandia, planificador vacaciones tailandia, experiencias auténticas tailandesas, tours culturales tailandia, agencia viajes familiar, planificación viaje tailandia, mejores tours tailandia, guía viaje tailandia"
    },
    notifications: {
      welcomeBar: "¡Bienvenido a Amon Tour! Descubre experiencias auténticas en Tailandia 🇹🇭"
    },
    cookies: {
      title: "Usamos cookies",
      description: "Utilizamos cookies para mejorar tu experiencia y analizar el uso del sitio. Al continuar usando este sitio, aceptas nuestro uso de cookies.",
      acceptAll: "Aceptar Todo",
      rejectAll: "Rechazar Todo",
      customize: "Personalizar",
      privacyNotice: "Aviso de Privacidad"
    },
    blog: {
      title: "Blog de Viajes",
      subtitle: "Descubre Tailandia a través de nuestros consejos expertos y guías de viaje",
      tags: "Tags",
      categories: "Categorías",
      allTags: "Todos los Tags",
      allCategories: "Todas las Categorías",
      searchPlaceholder: "Buscar artículos...",
      noResults: "No se encontraron artículos",
      loading: "Cargando artículos..."
    },
    seoMeta: {
      contactTitle: "Contacta Amon Tour - Planifica Tu Aventura en Tailandia",
      contactDescription: "Ponte en contacto con Amon Tour para planificación personalizada de viajes en Tailandia. Orientación experta para tours de Krabi, Bangkok, Phuket e itinerarios personalizados.",
      contactKeywords: "contacto amon tour, planificador viaje tailandia, agencia tour krabi, tours personalizados tailandia, consulta viaje tailandia",
      experiencesTitle: "Tours y Experiencias en Tailandia - Amon Tour",
      experiencesDescription: "Explora nuestros tours y experiencias auténticas en Tailandia. Tours privados, aventuras culturales y descubrimientos fuera de lo común en Krabi y más allá.",
      experiencesKeywords: "tours tailandia, experiencias krabi, tours privados tailandia, tours culturales tailandia, experiencias viaje auténticas",
      blogTitle: "Blog Viaje Tailandia - Consejos Amon Tour",
      blogDescription: "Descubre Tailandia a través de nuestro blog de viajes. Consejos expertos, perspectivas culturales y guías de viaje para Bangkok, Phuket, Krabi y gemas ocultas.",
      blogKeywords: "blog viaje tailandia, consejos viaje tailandia, guía krabi, consejos bangkok, recomendaciones phuket",
      brochureTitle: "Folleto Viaje Tailandia - Amon Tour",
      brochureDescription: "Descarga nuestro folleto integral de viaje a Tailandia con detalles de tours, itinerarios e información de planificación para tus vacaciones perfectas.",
      brochureKeywords: "folleto viaje tailandia, catálogo tours, planificación vacaciones tailandia, itinerarios viaje",
      groupCorporateTitle: "Tours Corporativos y Grupos Tailandia - Amon Tour",
      groupCorporateDescription: "Servicios especializados de viajes corporativos y grupales en Tailandia. Team building, viajes de incentivo y experiencias personalizadas para grupos.",
      groupCorporateKeywords: "tours corporativos tailandia, viaje grupo tailandia, team building tailandia, viaje incentivo"
    },
    errors: {
      notFound: "No Encontrado",
      tourNotFound: "Tour no encontrado",
      articleNotFound: "Artículo no encontrado",
      pageNotFound: "Página no encontrada",
      somethingWentWrong: "Algo salió mal",
      tryAgain: "Intentar de nuevo",
      backToHome: "Volver al Inicio",
      backToTours: "Volver a Tours",
      backToBlog: "Volver al Blog",
      loading: "Cargando...",
      noImage: "No hay imagen disponible",
      imageLoadFailed: "Error al cargar imagen"
    },
    footer: {
      contact: "Contacto",
      usefulLinks: "Enlaces Útiles",
      newsletter: "Newsletter",
      defaultNewsletterTitle: "Newsletter",
      defaultNewsletterDescription: "Suscríbete para recibir nuestras ofertas especiales y consejos de viaje.",
      defaultPrivacyText: "Respetamos tu privacidad. Desuscríbete en cualquier momento.",
      copyright: "Todos los derechos reservados.",
      legalNotice: "Aviso Legal",
      privacyPolicy: "Política de Privacidad",
      termsConditions: "Términos y Condiciones"
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

  getCruise() {
    return this.getTranslations().cruise;
  }

  getCustomTour() {
    return this.getTranslations().customTour;
  }

  // Nouveaux getters pour les sections ajoutées
  getNotifications() {
    return this.getTranslations().notifications;
  }

  getCookies() {
    return this.getTranslations().cookies;
  }

  getBlog() {
    return this.getTranslations().blog;
  }

  getSeoMeta() {
    return this.getTranslations().seoMeta;
  }

  getErrors() {
    return this.getTranslations().errors;
  }

  getSeo() {
    return this.getTranslations().seo;
  }

  getPageHeaders() {
    return this.getTranslations().pageHeaders;
  }

  getMessages() {
    return this.getTranslations().messages;
  }

  getButtons() {
    return this.getTranslations().buttons;
  }

  getToasts() {
    return this.getTranslations().toasts;
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

  /**
   * Check translation completeness across all languages
   * Returns missing keys for each language
   */
  checkTranslationCompleteness(): {
    missingInFrench: string[];
    missingInSpanish: string[];
    missingInEnglish: string[];
    isComplete: boolean;
  } {
    // Use getTranslations to ensure proper initialization
    const translations = this.getTranslations();
    const englishKeys = this.extractAllKeys(translations);
    
    // Get French and Spanish translations by temporarily switching language
    const currentLang = this.getCurrentLanguage();
    
    this.setLanguage('fr');
    const frenchKeys = this.extractAllKeys(this.getTranslations());
    
    this.setLanguage('es');
    const spanishKeys = this.extractAllKeys(this.getTranslations());
    
    // Restore original language
    this.setLanguage(currentLang);

    const missingInFrench = englishKeys.filter(key => !frenchKeys.includes(key));
    const missingInSpanish = englishKeys.filter(key => !spanishKeys.includes(key));
    const missingInEnglish = [...frenchKeys, ...spanishKeys]
      .filter(key => !englishKeys.includes(key))
      .filter((key, index, array) => array.indexOf(key) === index); // Remove duplicates

    const isComplete = missingInFrench.length === 0 && 
                      missingInSpanish.length === 0 && 
                      missingInEnglish.length === 0;

    return {
      missingInFrench,
      missingInSpanish,
      missingInEnglish,
      isComplete
    };
  }

  /**
   * Extract all nested keys from translation object
   * Returns array of dot-notation key paths like "nav.home", "footer.contact"
   */
  private extractAllKeys(obj: any, prefix: string = ''): string[] {
    const keys: string[] = [];
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const currentPath = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          // Recurse into nested objects
          keys.push(...this.extractAllKeys(obj[key], currentPath));
        } else if (typeof obj[key] === 'string') {
          // Add leaf string keys
          keys.push(currentPath);
        }
      }
    }
    
    return keys;
  }

  /**
   * Log translation completeness report to console
   * Useful for development and debugging
   */
  logTranslationReport(): void {
    const report = this.checkTranslationCompleteness();
    
    console.group('🌐 Translation Completeness Report');
    
    if (report.isComplete) {
      console.log('✅ All translations are complete!');
    } else {
      console.warn('⚠️  Missing translations found:');
      
      if (report.missingInFrench.length > 0) {
        console.group('🇫🇷 Missing in French:');
        report.missingInFrench.forEach(key => console.log(`- ${key}`));
        console.groupEnd();
      }
      
      if (report.missingInSpanish.length > 0) {
        console.group('🇪🇸 Missing in Spanish:');
        report.missingInSpanish.forEach(key => console.log(`- ${key}`));
        console.groupEnd();
      }
      
      if (report.missingInEnglish.length > 0) {
        console.group('🇬🇧 Missing in English:');
        report.missingInEnglish.forEach(key => console.log(`- ${key}`));
        console.groupEnd();
      }
    }
    
    const currentLang = this.getCurrentLanguage();
    this.setLanguage('en');
    const totalKeys = this.extractAllKeys(this.getTranslations()).length;
    this.setLanguage(currentLang);
    
    const frenchCompleteness = ((totalKeys - report.missingInFrench.length) / totalKeys * 100).toFixed(1);
    const spanishCompleteness = ((totalKeys - report.missingInSpanish.length) / totalKeys * 100).toFixed(1);
    
    console.log(`📊 Completion rates:`);
    console.log(`   French: ${frenchCompleteness}%`);
    console.log(`   Spanish: ${spanishCompleteness}%`);
    console.groupEnd();
  }
}

// Create global translation service instance
export const translationService = new TranslationService();
export const t = (key: string) => translationService.translate(key);

// Development: Log translation completeness report
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Run check after a short delay to ensure everything is loaded
  setTimeout(() => {
    translationService.logTranslationReport();
  }, 1000);
}