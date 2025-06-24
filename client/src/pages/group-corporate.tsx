import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import { Users, Target, Calendar, Award, Building, GraduationCap, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/group-corporate', {
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

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi');
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de l\'envoi de votre demande. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto"
            >
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-heading font-bold mb-4">Group Request Sent!</h1>
              <p className="text-gray-600 mb-8">
                Thank you for your group travel inquiry. We have received your request and our team will prepare a customized proposal for your group. We will contact you within 24-48 hours with detailed options and pricing.
              </p>
              <Button onClick={() => window.location.href = '/'} className="bg-primary hover:bg-primary/90">
                Return to Homepage
              </Button>
            </motion.div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Group & Corporate Travel - Tailored Experiences in Krabi"
        description="Custom group travel solutions for corporate retreats, team building, educational trips, and special events in Krabi, Thailand. Professional planning and on-site support."
        keywords="corporate retreat krabi, group travel thailand, team building activities, educational tours, company events krabi"
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
                  formSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Request Group Quote
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Group Form Section */}
        <section id="group-form" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div 
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-8">
                <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
                  Group Travel Request
                </h2>
                <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
                <p className="text-gray-600">
                  Tell us about your group and we'll create a customized proposal for your Thailand adventure
                </p>
              </div>

              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company/Organization Name *</Label>
                    <Input 
                      id="companyName" 
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Your company name" 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactName">Contact Person *</Label>
                    <Input 
                      id="contactName" 
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleInputChange}
                      placeholder="Your full name" 
                      required 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email" 
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@company.com" 
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
                    <Label htmlFor="groupSize">Group Size *</Label>
                    <Input 
                      id="groupSize" 
                      name="groupSize"
                      type="number" 
                      value={formData.groupSize}
                      onChange={handleInputChange}
                      placeholder="Number of participants" 
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
                      placeholder="e.g: March 15-22, 2025" 
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="budget">Estimated Budget per Person</Label>
                  <Input 
                    id="budget" 
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    placeholder="e.g: 15,000-25,000 THB" 
                  />
                </div>

                <div>
                  <Label htmlFor="description">Travel Requirements & Preferences *</Label>
                  <Textarea 
                    id="description" 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Tell us about your group's interests, preferred activities, accommodation level, dietary requirements, and any special needs..."
                    rows={5}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                >
                  {isSubmitting ? 'Sending...' : 'Request Group Quote'}
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