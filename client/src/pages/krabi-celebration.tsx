import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MapPin, Camera, Users, Sparkles, Clock, Gift, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { TranslationService } from "@/services/translationService";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import heroImage from "@assets/IMG_3481_1750762525398.jpeg";
import image1 from "@assets/image_1750757024713.png";
import image2 from "@assets/image_1750757043237.png";
import image3 from "@assets/image_1750757064524.png";
import image4 from "@assets/image_1750757080473.png";

interface FormData {
  name: string;
  email: string;
  whatsapp: string;
  celebrationType: string;
  guests: string;
  date: string;
  budget: string;
  description: string;
}

export default function KrabiCelebration() {
  const { toast } = useToast();
  const translationService = new TranslationService();
  const toasts = translationService.getToasts();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    whatsapp: '',
    celebrationType: '',
    guests: '',
    date: '',
    budget: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    console.log('Krabi Celebration - Submitting form:', formData);
    
    try {
      const response = await fetch('/api/krabi-celebration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Krabi Celebration - Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Krabi Celebration - Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Krabi Celebration - Success result:', result);
      
      toast({
        title: toasts.requestSent,
        description: toasts.requestSentDesc,
        duration: 5000,
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        whatsapp: '',
        celebrationType: '',
        guests: '',
        date: '',
        budget: '',
        description: ''
      });

    } catch (error) {
      console.error('Krabi Celebration - Submit error:', error);
      toast({
        title: toasts.requestFailed,
        description: toasts.requestFailedDesc,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <SEO 
        title="Krabi Celebration - Unique Moments in Exceptional Settings"
        description="Let yourself be enchanted by the magic of Krabi and create unforgettable memories with Krabi Celebration. Intimate weddings, romantic dinners and tailor-made celebrations in Thailand."
        keywords="krabi celebration, thailand wedding, romantic dinner krabi, destination wedding celebration, thailand wedding planner, private beach ceremony"
      />
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative h-[70vh] overflow-hidden">
          <div className="absolute inset-0 bg-black/30 z-10"></div>
          <div className="absolute inset-0 z-0">
            <img 
              src={heroImage}
              alt="Krabi Celebration - Unique moments in exceptional settings" 
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
                Unique moments in an exceptional setting
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
                Let yourself be enchanted by the magic of Krabi and create unforgettable memories with Krabi Celebration, our exclusive service dedicated to exceptional events. With our regional expertise and passion for Thai authenticity, we orchestrate tailor-made celebrations that transform your dreams into reality.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Whether you want to propose on a secret beach, celebrate your union in a breathtaking natural setting, or simply share a romantic dinner under the stars, Krabi Celebration puts its expertise and creativity at your service to create truly unique experiences.
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
                Our Celebration Experiences
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
                      Romantic Dinner on Private Beach
                    </h3>
                    <p className="text-gray-600 mb-4 italic">
                      The perfect experience for romantic souls
                    </p>
                    <p className="text-gray-600 mb-4">
                      Escape to a secret beach near Thalane Bay, a true hidden gem with colorful cliffs that few travelers know about. Your evening begins with a romantic sunset cruise to this preserved paradise.
                    </p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>The setting:</strong> Private beach facing the sunset, bamboo installation with traditional cushions, torch lighting and refined floral decoration</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <Gift className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>The menu:</strong> Refined buffet of Thai specialties with grilled seafood, vegetable fried rice, authentic Massaman curry, fish in foil, and tropical fruit platter</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>The team:</strong> Thai captain, local cook, professional guide and French maître d'hôtel in uniform</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-2xl font-bold text-primary">22,000 THB</span>
                        <span className="text-sm text-gray-500">for 2 people</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Options: Professional photographer (+8,000 THB), Champagne (+2,500 THB)
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
                      alt="Intimate beach wedding"
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
                    <p className="text-gray-600 mb-4 italic">
                      The ceremony of your dreams facing Phang Nga Bay
                    </p>
                    <p className="text-gray-600 mb-4">
                      Begin with a traditional blessing ceremony at Wat Nong Chik monastery with a Buddhist monk, then join the magnificent Thalane beach to celebrate your union in an idyllic setting.
                    </p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-start text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>The program:</strong> Buddhist ceremony (4 PM), beach celebration with vow exchange, romantic candlelit dinner and traditional lantern release</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <Heart className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Included:</strong> Bouquet and boutonnière, complete bamboo decoration, souvenir wedding certificate, French master of ceremony, and dinner at "Bac à Sable" restaurant</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-2xl font-bold text-primary">19,500 THB</span>
                        <span className="text-sm text-gray-500">for 2 people</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Options: Professional photographer, champagne and additional wines
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Secret Gardens Wedding */}
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
                      alt="Wedding in the secret gardens of Ao Nammao"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-secondary text-white px-3 py-1 rounded-full text-sm font-medium">
                        🌿 Secret Gardens
                      </span>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="font-heading font-bold text-2xl mb-4">
                      Beach Wedding in Ao Nammao Secret Gardens
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Imagine a magical ceremony in a tropical garden by the sea, followed by an elegant, gourmet and festive evening... In a confidential location in Ao Nammao, between two charming villas and a beachfront restaurant, live an unforgettable day surrounded by those you love.
                    </p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>The concept:</strong> An intimate and refined wedding between beach and garden, in the heart of a preserved natural environment</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <Gift className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Included:</strong> 2 villas with 2 bedrooms and pool plus large beachfront garden, flowered bamboo structure, photographer, wedding cake, complete installation, master of ceremony, professional DJ, cocktail hour, cocktail bar, fire show, dinner on the beach</span>
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
                    <img 
                      src={image3}
                      alt="Jungle celebration at Mountain of Spirit"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-[hsl(var(--success))] text-white px-3 py-1 rounded-full text-sm font-medium">
                        🌴 Jungle Celebration
                      </span>
                    </div>
                  </div>
                  <div className="p-8 order-1 lg:order-2">
                    <h3 className="font-heading font-bold text-2xl mb-4">
                      Jungle Celebration
                    </h3>
                    <p className="text-gray-600 mb-4 italic">
                      A spectacular wedding for up to 200 guests
                    </p>
                    <p className="text-gray-600 mb-4">
                      Discover the "Mountain of Spirit" in Chong Pli, a lush tropical garden nestled at the foot of impressive limestone cliffs. This magical place, a natural refuge of the local community, offers a unique setting mixing mysterious caves and tropical vegetation.
                    </p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-start text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>The concept:</strong> A "Garden party" for up to 200 guests for an unforgettable evening between jungle and karst peak</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <Gift className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Services included:</strong> Venue rental, photographer 3h, wedding cake, complete installation, English-speaking master of ceremony, professional DJ, Thai specialty buffet, smoothie and cocktail bar and dance party until 2 AM</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xl font-bold text-primary">From 4,900 THB</span>
                        <span className="text-sm text-gray-500">per person</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Example for 50 guests
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
                  description: "In-depth knowledge of Krabi's most beautiful secret sites"
                },
                {
                  icon: <Heart className="w-8 h-8" />,
                  title: "Personalized Service",
                  description: "Each event is unique and adapted to your wishes"
                },
                {
                  icon: <Users className="w-8 h-8" />,
                  title: "Multilingual Team",
                  description: "French, English and Thai staff for exceptional service"
                },
                {
                  icon: <Star className="w-8 h-8" />,
                  title: "Guaranteed Authenticity",
                  description: "Experiences rooted in Thai culture"
                },
                {
                  icon: <Sparkles className="w-8 h-8" />,
                  title: "Complete Logistics",
                  description: "From conception to realization, we manage everything"
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
                  Plan Your Celebration
                </h2>
                <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
                <p className="text-gray-600">
                  Contact us today to transform your dreams into eternal memories in Krabi!
                </p>
              </div>

              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input 
                      id="name" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name" 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email" 
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com" 
                      required 
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="whatsapp">WhatsApp (with country code)</Label>
                  <Input 
                    id="whatsapp" 
                    name="whatsapp"
                    type="tel"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="+66 XX XXX XXXX" 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="celebrationType">Type of Celebration *</Label>
                    <Input 
                      id="celebrationType" 
                      name="celebrationType"
                      value={formData.celebrationType}
                      onChange={handleInputChange}
                      placeholder="e.g: Wedding, Proposal, Anniversary" 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="guests">Number of Guests</Label>
                    <Input 
                      id="guests" 
                      name="guests"
                      type="number" 
                      value={formData.guests}
                      onChange={handleInputChange}
                      placeholder="Approximate number" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Desired Date</Label>
                    <Input 
                      id="date" 
                      name="date"
                      type="date" 
                      value={formData.date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget">Expected Budget</Label>
                    <Input 
                      id="budget" 
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      placeholder="e.g: 20,000-50,000 THB" 
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Describe Your Dream Celebration *</Label>
                  <Textarea 
                    id="description" 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your vision, desired style, location preferences and any special requirements..."
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send My Celebration Request'}
                </Button>
              </form>

              <div className="text-center mt-8">
                <p className="text-gray-600 text-sm">
                  <strong>Krabi Celebration</strong> - A division of Amon Tour
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}