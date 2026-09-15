export function transformCustomTourToTourNinja(amontourRequest: any) {
  const statusMap: Record<string, string> = { new: "received", in_progress: "processing", archived: "completed" };
  const destinations: string[] = amontourRequest.destinations || [];
  const interests: string[] = amontourRequest.interests || [];
  const inferTourName = () => {
    if (destinations.includes("krabi")) return "Krabi Adventure Tour";
    if (destinations.includes("bangkok")) return "Bangkok City Experience";
    if (destinations.includes("chiangmai")) return "Chiang Mai Cultural Tour";
    if (destinations.includes("khaosok")) return "Khao Sok National Park Tour";
    if (destinations.includes("kohmook")) return "Koh Mook Island Escape";
    if (interests.includes("culture")) return "Cultural Heritage Tour";
    if (interests.includes("nature")) return "Nature & Adventure Tour";
    if (interests.includes("beaches")) return "Beach Paradise Tour";
    return "Custom Thailand Tour";
  };
  return {
    customerName: amontourRequest.fullName, customerEmail: amontourRequest.email,
    phone: amontourRequest.phoneNumber, tourDate: amontourRequest.tripDates || "Date flexible",
    numberOfAdults: amontourRequest.numberOfAdults, numberOfKids: amontourRequest.numberOfKids,
    duration: amontourRequest.duration || "À définir", message: amontourRequest.message,
    destinations, budget: "À discuter", status: statusMap[amontourRequest.status] || "received",
    associatedTourName: inferTourName(), interests, tripTypes: amontourRequest.tripTypes || [],
    amontourId: amontourRequest.id, originalCreatedAt: amontourRequest.createdAt,
    source: "amontour_custom_tour",
  };
}

export function transformCruiseToTourNinja(cruiseRequest: any) {
  const statusMap: Record<string, string> = {
    pending: "received", contacted: "processing", confirmed: "completed", cancelled: "cancelled",
  };
  const inferName = (duration: string, itinerary?: string) => {
    if (duration === "1 day") return "Day Cruise Experience";
    if (duration === "2 days") return "2-Day Island Cruise";
    if (duration === "3-4 days") return "Multi-Day Island Explorer";
    if (duration === "5-6 days") return "Extended Island Adventure";
    if (duration === "7+ days") return "Ultimate Island Journey";
    if (itinerary?.toLowerCase().includes("phi phi")) return "Phi Phi Islands Cruise";
    if (itinerary?.toLowerCase().includes("krabi")) return "Krabi Coast Cruise";
    if (itinerary?.toLowerCase().includes("phang nga")) return "Phang Nga Bay Cruise";
    return "Custom Island Cruise";
  };
  return {
    customerName: cruiseRequest.fullName, customerEmail: cruiseRequest.email,
    phone: cruiseRequest.phone || "Non fourni", tourDate: cruiseRequest.preferredDates || "Date flexible",
    numberOfAdults: cruiseRequest.numberOfGuests || 2, numberOfKids: 0, duration: cruiseRequest.duration,
    message: [
      cruiseRequest.specialRequests ? `Demandes spéciales: ${cruiseRequest.specialRequests}` : "",
      cruiseRequest.itinerary ? `Itinéraire préféré: ${cruiseRequest.itinerary}` : "",
      cruiseRequest.budget ? `Budget: ${cruiseRequest.budget}` : "",
    ].filter(Boolean).join("\n"),
    destinations: cruiseRequest.itinerary ? [cruiseRequest.itinerary] : [],
    budget: cruiseRequest.budget || "À discuter", status: statusMap[cruiseRequest.status] || "received",
    associatedTourName: inferName(cruiseRequest.duration, cruiseRequest.itinerary),
    numberOfGuests: cruiseRequest.numberOfGuests, itinerary: cruiseRequest.itinerary,
    specialRequests: cruiseRequest.specialRequests, amontourId: cruiseRequest.id,
    originalCreatedAt: cruiseRequest.createdAt, source: "amontour_cruise",
  };
}