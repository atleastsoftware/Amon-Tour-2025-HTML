import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import { TranslationService } from "@/services/translationService";
import { Users, Target, Calendar, Award, Building, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  groupSize: string;
  travelDates: string;
  budget: string;
  description: string;
}

export default function GroupCorporate() {
  const { toast } = useToast();
  const translationService = new TranslationService();
  const seoMeta = translationService.getSeoMeta();
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    groupSize: '',
    travelDates: '',
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
    
    console.log('Group Corporate - Submitting form:', formData);
    
    try {
      const response = await fetch('/api/group-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          groupSize: parseInt(formData.groupSize) || 0
        }),
        credentials: 'include',
      });

      console.log('Group Corporate - Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Group Corporate - Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Group Corporate - Success result:', result);
      
      toast({
        title: "Group Request Sent!",
        description: "Thank you for your group inquiry. Our team will create a customized proposal and contact you within 24 hours.",
        duration: 5000,
      });

      // Reset form
      setFormData({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        groupSize: '',
        travelDates: '',
        budget: '',
        description: ''
      });

    } catch (error) {
      console.error('Group Corporate - Submit error:', error);
      toast({
        title: "Error Sending Request",
        description: "There was a problem sending your group request. Please try again or contact us directly.",
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
        title={seoMeta.groupCorporateTitle}
        description={seoMeta.groupCorporateDescription}
        keywords={seoMeta.groupCorporateKeywords}
      />
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative h-[60vh] overflow-hidden">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <div className="absolute inset-0 z-0">
            <img 
              src="/uploads/tours/tour-1745996624172-231261635.jpeg" 
              alt="Group activities in Krabi" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="container mx-auto px-4 relative z-20 h-full flex flex-col justify-center items-center text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Users className="w-16 h-16 text-secondary mx-auto mb-6" />
              <h1 className="font-heading font-bold text-4xl md:text-5xl mb-6">
                Group & Corporate Travel
              </h1>
              <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">
                Tailored group experiences in Krabi for corporate retreats, team building, educational trips, and special events.
              </p>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={() => {
                  const formSection = document.getElementById('group-form');
                  if (formSection) {
                    formSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Plan Your Group Event
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
                Tailored Group Experiences in Krabi
              </h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
              <p className="text-gray-600 text-lg leading-relaxed">
                Whether you're planning a corporate retreat, educational trip, team-building event, or special celebration, 
                our experienced team creates memorable experiences that bring groups together in Thailand's most stunning destination. 
                From logistics coordination to on-site support, we handle every detail so you can focus on your objectives.
              </p>
            </motion.div>
          </div>
        </section>

        {/* What We Offer */}
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
                What We Offer
              </h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Comprehensive group travel solutions designed to exceed your expectations and achieve your goals.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Calendar className="w-8 h-8" />,
                  title: "Complete Logistics",
                  description: "Transportation, accommodation, dining, and activity coordination from arrival to departure."
                },
                {
                  icon: <Users className="w-8 h-8" />,
                  title: "On-Site Support",
                  description: "Dedicated local team members to ensure smooth execution and handle any requirements."
                },
                {
                  icon: <Target className="w-8 h-8" />,
                  title: "Custom Planning",
                  description: "Tailored itineraries designed around your group's objectives, interests, and budget."
                }
              ].map((offer, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-md text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    {offer.icon}
                  </div>
                  <h3 className="font-heading font-bold text-xl mb-3">{offer.title}</h3>
                  <p className="text-gray-600">{offer.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Sample Activities */}
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
                Sample Group Activities
              </h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Choose from our curated activities or let us design unique experiences for your group.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Private Boat Tour",
                  description: "Exclusive island-hopping experience with snorkeling, beach time, and Thai lunch",
                  highlights: ["4 Islands Tour", "Private longtail boat", "Snorkeling equipment", "Traditional lunch"]
                },
                {
                  title: "Team Building Adventure",
                  description: "Challenging outdoor activities designed to strengthen team bonds and communication",
                  highlights: ["Rock climbing", "Kayak challenges", "Problem-solving games", "Group reflection"]
                },
                {
                  title: "Thai Cooking Class",
                  description: "Interactive culinary experience learning authentic Thai recipes together",
                  highlights: ["Market visit", "Hands-on cooking", "Recipe booklet", "Group dining"]
                },
                {
                  title: "Wellness Retreat",
                  description: "Relaxation and mindfulness activities in Krabi's natural setting",
                  highlights: ["Yoga sessions", "Meditation", "Spa treatments", "Healthy meals"]
                }
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <h3 className="font-heading font-bold text-lg mb-3 text-primary">{activity.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{activity.description}</p>
                  <ul className="space-y-1">
                    {activity.highlights.map((highlight, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-center">
                        <div className="w-2 h-2 bg-secondary rounded-full mr-2"></div>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Target Audiences */}
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
                Who We Serve
              </h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We specialize in creating meaningful experiences for diverse groups with varying objectives and requirements.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Building className="w-12 h-12" />,
                  title: "Corporate Groups",
                  description: "Executive retreats, team building, company incentive trips, and leadership development programs",
                  size: "10-100+ participants"
                },
                {
                  icon: <GraduationCap className="w-12 h-12" />,
                  title: "Educational Trips",
                  description: "Student groups, university programs, cultural exchanges, and educational tours",
                  size: "15-50 students"
                },
                {
                  icon: <Users className="w-12 h-12" />,
                  title: "Special Interest Groups",
                  description: "Wedding parties, yoga retreats, photography tours, and celebration events",
                  size: "8-30 participants"
                },
                {
                  icon: <Award className="w-12 h-12" />,
                  title: "Conferences & Seminars",
                  description: "Business conferences, workshops, training sessions, and professional meetings",
                  size: "20-200+ attendees"
                },
                {
                  icon: <Target className="w-12 h-12" />,
                  title: "Wellness Groups",
                  description: "Health and wellness retreats, fitness groups, mindfulness programs, and spa experiences",
                  size: "6-25 participants"
                },
                {
                  icon: <Calendar className="w-12 h-12" />,
                  title: "Social Clubs",
                  description: "Travel clubs, hobby groups, family reunions, and friend gatherings",
                  size: "8-40 people"
                }
              ].map((audience, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-md"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="text-primary mb-4">
                    {audience.icon}
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-2">{audience.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{audience.description}</p>
                  <div className="text-xs text-secondary font-medium bg-secondary/10 px-2 py-1 rounded-full inline-block">
                    {audience.size}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section id="group-form" className="py-16 bg-white">
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
                  Plan Your Group Experience
                </h2>
                <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
                <p className="text-gray-600">
                  Tell us about your group and objectives, and we'll create a customized proposal for your Krabi experience.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="bg-neutral-50 p-8 rounded-lg shadow-md space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input 
                      id="contactName" 
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleInputChange}
                      placeholder="Your full name" 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company/Organization *</Label>
                    <Input 
                      id="companyName" 
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Your company or organization name" 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+66 XX XXX XXXX" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="groupSize">Number of People *</Label>
                    <Input 
                      id="groupSize" 
                      name="groupSize"
                      type="number" 
                      value={formData.groupSize}
                      onChange={handleInputChange}
                      placeholder="Approximate group size" 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="travelDates">Preferred Travel Dates</Label>
                    <Input 
                      id="travelDates" 
                      name="travelDates"
                      value={formData.travelDates}
                      onChange={handleInputChange}
                      placeholder="e.g., March 2024 or flexible" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget">Budget Range</Label>
                    <Input 
                      id="budget" 
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      placeholder="e.g., 50,000 - 100,000 THB" 
                    />
                  </div>
                  <div></div>
                </div>

                <div>
                  <Label htmlFor="description">Group Objectives & Requirements *</Label>
                  <Textarea 
                    id="description" 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your group's goals, interests, special requirements, preferred activities, and any specific needs..."
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Request Group Proposal'}
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