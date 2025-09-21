// TEMPORARY TRANSLATION SERVICE - TO BE DELETED AFTER MIGRATION
// This file provides minimal functionality for components not yet migrated to i18next

class TranslationService {
  getHome() {
    return {
      // Features.tsx - ALL 17 properties
      whyChooseTitle: "Why Choose Amon Tour?",
      whyChooseDescription: "Discover what makes our tours special",
      privateTours: "Private Tours",
      privateToursDesc: "Exclusive experiences tailored just for you",
      privateCar: "Private Car",
      guide: "Expert Guide", 
      safety: "Safety First",
      customizedItineraries: "Customized Itineraries",
      customizedItinerariesDesc: "Every journey designed around your interests",
      customRoute: "Custom Route",
      flexibleTime: "Flexible Time",
      yourPace: "Your Pace",
      authenticExperiences: "Authentic Experiences",
      authenticExperiencesDesc: "Real connections with local culture and communities",
      localFood: "Local Food",
      localPeople: "Local People", 
      culture: "Culture",
      
      // Other components might need
      tailorMadeTitle: "Our Tailor-Made Trips",
      tailorMadeDescription: "Every journey with us is crafted with care, attention to detail, and a deep understanding of what makes travel truly memorable."
    };
  }

  getHero() {
    return {
      title: "Discover Authentic Krabi",
      subtitle: "Experience the real Thailand with local experts",
      description: "Join us for unforgettable adventures beyond the tourist trail",
      ctaButton: "Start Your Journey",
      secondaryButton: "Learn More"
    };
  }

  getCruise() {
    return {
      title: "Private Catamaran Experiences",
      subtitle: "Sail the pristine waters of Krabi",
      description: "Luxury sailing adventures tailored just for you"
    };
  }

  getSeo() {
    return {
      defaultTitle: "Amon Tour - Authentic Krabi Experiences",
      defaultDescription: "Discover authentic Krabi with local experts. Unique tours, hidden gems, and unforgettable memories.",
      defaultKeywords: "Krabi tours, Thailand travel, authentic experiences, local guides"
    };
  }
}

export const translationService = new TranslationService();