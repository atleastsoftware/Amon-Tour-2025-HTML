import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import { Heart, Camera, MapPin, Users, Sparkles, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function KrabiCelebration() {
  return (
    <>
      <SEO 
        title="Krabi Celebration - Destination Wedding in Paradise"
        description="Create unforgettable memories with your dream destination wedding in Krabi, Thailand. Beach ceremonies, private villas, and luxury events in tropical paradise."
        keywords="destination wedding krabi, beach wedding thailand, wedding packages krabi, tropical wedding, thailand wedding planner"
      />
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative h-[70vh] overflow-hidden">
          <div className="absolute inset-0 bg-black/30 z-10"></div>
          <div className="absolute inset-0 z-0">
            <img 
              src="/uploads/tours/tour-1745996624172-231261635.jpeg" 
              alt="Romantic beach wedding in Krabi" 
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
                Say "I Do" in Paradise. Create unforgettable memories with your dream destination wedding in Krabi's tropical paradise.
              </p>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={() => {
                  const formSection = document.getElementById('wedding-form');
                  if (formSection) {
                    formSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Plan Your Dream Wedding
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Why Get Married in Krabi */}
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
                Why Get Married in Krabi?
              </h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-3xl mx-auto text-lg">
                Krabi offers the perfect blend of natural beauty, romantic settings, and exceptional hospitality for your special day.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <MapPin className="w-8 h-8" />,
                  title: "Stunning Locations",
                  description: "From pristine beaches to limestone cliffs, Krabi offers breathtaking backdrops for your ceremony."
                },
                {
                  icon: <Sparkles className="w-8 h-8" />,
                  title: "Tropical Paradise",
                  description: "Crystal clear waters, golden sunsets, and lush landscapes create the perfect romantic atmosphere."
                },
                {
                  icon: <Heart className="w-8 h-8" />,
                  title: "Intimate & Personal",
                  description: "Away from crowds, your wedding becomes a truly personal and intimate celebration with loved ones."
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

        {/* Wedding Services */}
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
                Our Wedding Services
              </h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We handle every detail so you can focus on celebrating your love.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Calendar className="w-6 h-6" />,
                  title: "Wedding Planning",
                  description: "Complete coordination from venue selection to timeline management"
                },
                {
                  icon: <Sparkles className="w-6 h-6" />,
                  title: "Decoration & Styling",
                  description: "Beautiful floral arrangements and custom decor matching your vision"
                },
                {
                  icon: <MapPin className="w-6 h-6" />,
                  title: "Accommodation",
                  description: "Luxury resorts and villas for you and your guests"
                },
                {
                  icon: <Heart className="w-6 h-6" />,
                  title: "Ceremony Coordination",
                  description: "Seamless ceremony execution with local officiants"
                },
                {
                  icon: <Camera className="w-6 h-6" />,
                  title: "Photography & Video",
                  description: "Professional capture of your special moments"
                },
                {
                  icon: <Users className="w-6 h-6" />,
                  title: "Reception Dinner",
                  description: "Exquisite dining experiences with authentic Thai cuisine"
                }
              ].map((service, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-md"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4 text-secondary">
                    {service.icon}
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm">{service.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Wedding Packages */}
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
                Wedding Packages
              </h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Choose from our curated packages or let us create a custom celebration just for you.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Beach Ceremony",
                  description: "Intimate beachfront celebration with sunset backdrop",
                  features: ["Beachfront venue", "Floral arch", "Basic photography", "Reception dinner"]
                },
                {
                  title: "Private Villa Wedding",
                  description: "Exclusive villa with pool and panoramic views",
                  features: ["Private villa rental", "Custom decoration", "Personal coordinator", "Spa treatments"]
                },
                {
                  title: "Jungle Wedding",
                  description: "Unique ceremony surrounded by tropical nature",
                  features: ["Jungle venue", "Natural decoration", "Adventure activities", "Traditional music"]
                },
                {
                  title: "Luxury Event",
                  description: "Premium experience with all-inclusive services",
                  features: ["5-star resort", "Premium catering", "Professional videography", "Guest activities"]
                }
              ].map((pkg, index) => (
                <motion.div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <h3 className="font-heading font-bold text-xl mb-3 text-primary">{pkg.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{pkg.description}</p>
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-center">
                        <Heart className="w-4 h-4 text-secondary mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full">
                    Learn More
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section id="wedding-form" className="py-16 bg-neutral-50">
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
                  Start Planning Your Dream Wedding
                </h2>
                <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
                <p className="text-gray-600">
                  Tell us about your vision and we'll create a personalized proposal for your special day.
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
                    <Label htmlFor="desiredDate">Desired Wedding Date</Label>
                    <Input id="desiredDate" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="guestCount">Number of Guests</Label>
                    <Input id="guestCount" type="number" placeholder="Approximate number" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Tell Us About Your Dream Wedding *</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Describe your vision, preferred style, budget range, and any special requirements..."
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  Send Wedding Inquiry
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