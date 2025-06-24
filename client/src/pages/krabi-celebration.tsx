import { motion } from "framer-motion";
import { Heart, MapPin, Camera, Users, Sparkles, Phone, Mail, Star, Clock, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import image1 from "@assets/image_1750757024713.png";
import image2 from "@assets/image_1750757043237.png";
import image3 from "@assets/image_1750757064524.png";
import image4 from "@assets/image_1750757080473.png";

export default function KrabiCelebration() {
  return (
    <>
      <SEO 
        title="Krabi Celebration - Unique Moments in Exceptional Settings"
        description="Create unforgettable memories with Krabi Celebration. Romantic beach dinners, intimate weddings, and spectacular celebrations in Thailand's most stunning locations."
        keywords="krabi celebration, beach wedding thailand, romantic dinner krabi, destination wedding, thailand wedding planner, private beach ceremony"
      />
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative h-[70vh] overflow-hidden">
          <div className="absolute inset-0 bg-black/30 z-10"></div>
          <div className="absolute inset-0 z-0">
            <img 
              src={image3}
              alt="Romantic beach wedding ceremony in Krabi" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="container mx-auto px-4 relative z-20 h-full flex flex-col justify-center items-center text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Heart className="w-16 h-16 text-secondary mx-auto mb-6" />
              <h1 className="font-heading font-bold text-4xl md:text-6xl mb-6">
                Krabi Celebration
              </h1>
              <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">
                Unique moments in an exceptional setting. Let yourself be enchanted by the magic of Krabi.
              </p>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={() => {
                  const formSection = document.getElementById('celebration-form');
                  if (formSection) {
                    formSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Plan Your Celebration
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div 
              className="max-w-4xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6">
                Create Unforgettable Memories
              </h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Backed by our deep regional expertise and passion for authentic Thai culture, we design tailor-made celebrations that turn your dreams into reality. Whether you're planning to propose on a secret beach, celebrate your union in a breathtaking natural setting, or simply enjoy a romantic dinner under the stars, Krabi Celebration brings creativity and expertise together to create truly one-of-a-kind experiences.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Celebration Packages */}
        <section className="py-16 bg-neutral-50">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
                Celebration Experiences
              </h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Choose from our signature experiences or let us create something completely unique for you.
              </p>
            </motion.div>

            <div className="space-y-16">
              {/* Romantic Dinner */}
              <motion.div
                className="bg-white rounded-lg shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="relative h-64 lg:h-auto">
                    <img 
                      src={image4}
                      alt="Romantic dinner on private beach"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-secondary text-white px-3 py-1 rounded-full text-sm font-medium">
                        🌅 Romantic Experience
                      </span>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="font-heading font-bold text-2xl mb-4">
                      Romantic Dinner on a Private Beach
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Escape to a hidden beach near Thalane Bay — a true gem surrounded by colorful cliffs, still unknown to most travelers. Your evening begins with a sunset cruise to this secluded paradise.
                    </p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-primary" />
                        Private beach facing the sunset
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-primary" />
                        Perfect for 2 people
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Gift className="w-4 h-4 mr-2 text-primary" />
                        Gourmet Thai buffet included
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-primary">22,000 THB</span>
                        <span className="text-sm text-gray-500">for 2 people</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Options: Photography (+8,000 THB), Champagne (+2,500 THB)
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Intimate Beach Wedding */}
              <motion.div
                className="bg-white rounded-lg shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="relative h-64 lg:h-auto order-2 lg:order-1">
                    <img 
                      src={image2}
                      alt="Intimate beach wedding ceremony"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                        💍 Intimate Wedding
                      </span>
                    </div>
                  </div>
                  <div className="p-8 order-1 lg:order-2">
                    <h3 className="font-heading font-bold text-2xl mb-4">
                      Intimate Beach Wedding
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Begin with a traditional blessing ceremony at Wat Nong Chik monastery with a Buddhist monk, followed by a romantic beach celebration at Thalane, one of the most stunning coastal settings in the region.
                    </p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-primary" />
                        Buddhist ceremony (4 PM), beach vows, dinner
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Heart className="w-4 h-4 mr-2 text-primary" />
                        Bouquet, decoration, certificate included
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-primary" />
                        French master of ceremony
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-primary">19,500 THB</span>
                        <span className="text-sm text-gray-500">for 2 people</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Options: Photographer, champagne, additional wines
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Garden Wedding */}
              <motion.div
                className="bg-white rounded-lg shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="relative h-64 lg:h-auto">
                    <img 
                      src={image1}
                      alt="Garden wedding between villas and sea"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-secondary text-white px-3 py-1 rounded-full text-sm font-medium">
                        🌿 Garden Wedding
                      </span>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="font-heading font-bold text-2xl mb-4">
                      Garden Wedding on Ao Nammao Beach
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Imagine a magical ceremony in a tropical garden by the sea, followed by an elegant and festive evening. Located in a hidden area between two charming villas and a beachfront restaurant.
                    </p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-primary" />
                        2 villas with pools + beachfront garden
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Camera className="w-4 h-4 mr-2 text-primary" />
                        Photographer, DJ, fire show included
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Gift className="w-4 h-4 mr-2 text-primary" />
                        Wedding cake, cocktail hour, dinner
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-primary">Price on Request</span>
                        <span className="text-sm text-gray-500">Contact us</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Jungle Celebration */}
              <motion.div
                className="bg-white rounded-lg shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="relative h-64 lg:h-auto order-2 lg:order-1">
                    <div className="w-full h-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Sparkles className="w-16 h-16 mx-auto mb-4" />
                        <p className="text-lg font-semibold">Mountain of Spirit</p>
                        <p className="text-sm">Chong Pli Jungle Garden</p>
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        🌴 Jungle Celebration
                      </span>
                    </div>
                  </div>
                  <div className="p-8 order-1 lg:order-2">
                    <h3 className="font-heading font-bold text-2xl mb-4">
                      Jungle Celebration
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Discover the "Mountain of Spirit" in Chong Pli — a lush tropical garden nestled at the base of dramatic limestone cliffs. This magical place combines mysterious caves with tropical jungle surroundings.
                    </p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-primary" />
                        Up to 200 guests
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-primary" />
                        Dance party until 2:00 AM
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Gift className="w-4 h-4 mr-2 text-primary" />
                        Thai buffet, cocktail bar, full setup
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-primary">From 4,900 THB</span>
                        <span className="text-sm text-gray-500">per person</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Example based on 50 guests
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why Choose Krabi Celebration */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
                Why Choose Krabi Celebration?
              </h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <MapPin className="w-8 h-8" />,
                  title: "Local Expertise",
                  description: "In-depth knowledge of Krabi's hidden gems and secret locations for your perfect celebration."
                },
                {
                  icon: <Heart className="w-8 h-8" />,
                  title: "Tailor-Made Service",
                  description: "Every event is designed around your wishes, creating truly personalized experiences."
                },
                {
                  icon: <Users className="w-8 h-8" />,
                  title: "Multilingual Team",
                  description: "French, English, and Thai-speaking staff to ensure seamless communication."
                },
                {
                  icon: <Star className="w-8 h-8" />,
                  title: "Authenticity Guaranteed",
                  description: "Experiences rooted in authentic Thai culture and local traditions."
                },
                {
                  icon: <Sparkles className="w-8 h-8" />,
                  title: "End-to-End Logistics",
                  description: "We manage everything from concept to execution, ensuring a stress-free experience."
                },
                {
                  icon: <Camera className="w-8 h-8" />,
                  title: "Professional Quality",
                  description: "High-end service standards with attention to every detail of your special day."
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    {item.icon}
                  </div>
                  <h3 className="font-heading font-bold text-xl mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section id="celebration-form" className="py-16 bg-neutral-50">
          <div className="container mx-auto px-4">
            <motion.div 
              className="max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-8">
                <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
                  Start Planning Your Celebration
                </h2>
                <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
                <p className="text-gray-600">
                  Tell us about your vision and we'll create a personalized proposal for your special moment.
                </p>
              </div>

              <form className="bg-white p-8 rounded-lg shadow-md space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" placeholder="Your full name" required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" placeholder="your@email.com" required />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventType">Type of Celebration *</Label>
                    <Input id="eventType" placeholder="e.g., Wedding, Proposal, Anniversary" required />
                  </div>
                  <div>
                    <Label htmlFor="guestCount">Number of Guests</Label>
                    <Input id="guestCount" type="number" placeholder="Approximate number" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="desiredDate">Preferred Date</Label>
                    <Input id="desiredDate" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="budget">Budget Range</Label>
                    <Input id="budget" placeholder="e.g., 20,000-50,000 THB" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Tell Us About Your Dream Celebration *</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Describe your vision, preferred style, location preferences, and any special requirements..."
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  Send Celebration Inquiry
                </Button>
              </form>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}