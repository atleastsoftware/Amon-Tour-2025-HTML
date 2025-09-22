import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import { useTranslation } from 'react-i18next';
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
  const {
    t
  } = useTranslation();
  const {
    toast
  } = useToast();
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
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log('Group Corporate - Submitting form:', formData);
    try {
      const response = await fetch('/api/group-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          groupSize: parseInt(formData.groupSize) || 0
        }),
        credentials: 'include'
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
        title: t('toasts.requestSent'),
        description: t('toasts.requestSentDesc'),
        duration: 5000
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
        title: t('toasts.requestFailed'),
        description: t('toasts.requestFailedDesc'),
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <>
      <SEO title={t('seo.groupCorporateTitle')} description={t('seo.groupCorporateDescription')} keywords={t('seo.groupCorporateKeywords')} />
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative h-[60vh] overflow-hidden">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <div className="absolute inset-0 z-0">
            <img src="/uploads/tours/tour-1745996624172-231261635.jpeg" alt={t("Group activities in Krabi", {
            defaultValue: "Group activities in Krabi"
          })} className="w-full h-full object-cover" />
          </div>
          <div className="container mx-auto px-4 relative z-20 h-full flex flex-col justify-center items-center text-center text-white">
            <motion.div initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8
          }}>
              <Users className="w-16 h-16 text-secondary mx-auto mb-6" />
              <h1 className="font-heading font-bold text-4xl md:text-5xl mb-6">{t("Group & Corporate Travel", {
                defaultValue: "Group & Corporate Travel"
              })}</h1>
              <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">{t("Tailored group experiences in Krabi for corporate retreats, team building, educational trips, and special events.", {
                defaultValue: "Tailored group experiences in Krabi for corporate retreats, team building, educational trips, and special events."
              })}</p>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white" onClick={() => {
              const formSection = document.getElementById('group-form');
              if (formSection) {
                formSection.scrollIntoView({
                  behavior: 'smooth'
                });
              }
            }}>{t("Plan Your Group Event", {
                defaultValue: "Plan Your Group Event"
              })}</Button>
            </motion.div>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div className="max-w-4xl mx-auto text-center" initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6
          }}>
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6">{t("Tailored group experiences in Krabi for corporate retreats, team building, educational trips, and special events.", {
                defaultValue: "Tailored group experiences in Krabi for corporate retreats, team building, educational trips, and special events."
              })}</h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
              <p className="text-gray-600 text-lg leading-relaxed">{t('Whether you\'re planning a corporate retreat, educational trip, team-building event, or special celebration, \n                our experienced team creates memorable experiences that bring groups together in Thailand\'s most stunning destination. \n                From logistics coordination to on-site support, we handle every detail so you can focus on your objectives.', {
                defaultValue: 'Whether you\'re planning a corporate retreat, educational trip, team-building event, or special celebration, \n                our experienced team creates memorable experiences that bring groups together in Thailand\'s most stunning destination. \n                From logistics coordination to on-site support, we handle every detail so you can focus on your objectives.'
              })}</p>
            </motion.div>
          </div>
        </section>

        {/* What We Offer */}
        <section className="py-16 bg-neutral-50">
          <div className="container mx-auto px-4">
            <motion.div className="text-center mb-12" initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6
          }}>
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">{t("What We Offer", {
                defaultValue: "What We Offer"
              })}</h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">{t("Comprehensive group travel solutions designed to exceed your expectations and achieve your goals.", {
                defaultValue: "Comprehensive group travel solutions designed to exceed your expectations and achieve your goals."
              })}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[{
              icon: <Calendar className="w-8 h-8" />,
              title: t("Complete logistics", {
                defaultValue: "Complete logistics"
              }),
              description: t("Transportation, accommodation, dining, and activity coordination from arrival to departure.", {
                defaultValue: "Transportation, accommodation, dining, and activity coordination from arrival to departure."
              })
            }, {
              icon: <Users className="w-8 h-8" />,
              title: t("On-Site Support", {
                defaultValue: "On-Site Support"
              }),
              description: t("Dedicated local team members to ensure smooth execution and handle any requirements.", {
                defaultValue: "Dedicated local team members to ensure smooth execution and handle any requirements."
              })
            }, {
              icon: <Target className="w-8 h-8" />,
              title: t("Custom Planning", {
                defaultValue: "Custom Planning"
              }),
              description: t('Tailored itineraries designed around your group\'s objectives, interests, and budget.', {
                defaultValue: 'Tailored itineraries designed around your group\'s objectives, interests, and budget.'
              })
            }].map((offer, index) => <motion.div key={index} className="bg-white p-6 rounded-lg shadow-md text-center" initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6,
              delay: index * 0.1
            }}>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    {offer.icon}
                  </div>
                  <h3 className="font-heading font-bold text-xl mb-3">{offer.title}</h3>
                  <p className="text-gray-600">{offer.description}</p>
                </motion.div>)}
            </div>
          </div>
        </section>

        {/* Sample Activities */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div className="text-center mb-12" initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6
          }}>
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">{t("Sample Group Activities", {
                defaultValue: "Sample Group Activities"
              })}</h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">{t("Choose from our curated activities or let us design unique experiences for your group.", {
                defaultValue: "Choose from our curated activities or let us design unique experiences for your group."
              })}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[{
              title: t("Private Boat Tour", {
                defaultValue: "Private Boat Tour"
              }),
              description: t("Exclusive island-hopping experience with snorkeling, beach time, and Thai lunch", {
                defaultValue: "Exclusive island-hopping experience with snorkeling, beach time, and Thai lunch"
              }),
              highlights: ["4 Islands Tour", "Private longtail boat", "Snorkeling equipment", "Traditional lunch"]
            }, {
              title: t("Team Building Adventure", {
                defaultValue: "Team Building Adventure"
              }),
              description: t("Challenging outdoor activities designed to strengthen team bonds and communication", {
                defaultValue: "Challenging outdoor activities designed to strengthen team bonds and communication"
              }),
              highlights: ["Rock climbing", "Kayak challenges", "Problem-solving games", "Group reflection"]
            }, {
              title: t("Thai Cooking Class", {
                defaultValue: "Thai Cooking Class"
              }),
              description: t("Interactive culinary experience learning authentic Thai recipes together", {
                defaultValue: "Interactive culinary experience learning authentic Thai recipes together"
              }),
              highlights: ["Market visit", "Hands-on cooking", "Recipe booklet", "Group dining"]
            }, {
              title: t("Wellness Retreat", {
                defaultValue: "Wellness Retreat"
              }),
              description: t('Relaxation and mindfulness activities in Krabi\'s natural setting', {
                defaultValue: 'Relaxation and mindfulness activities in Krabi\'s natural setting'
              }),
              highlights: ["Yoga sessions", "Meditation", "Spa treatments", "Healthy meals"]
            }].map((activity, index) => <motion.div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow" initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6,
              delay: index * 0.1
            }}>
                  <h3 className="font-heading font-bold text-lg mb-3 text-primary">{activity.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{activity.description}</p>
                  <ul className="space-y-1">
                    {activity.highlights.map((highlight, i) => <li key={i} className="text-sm text-gray-600 flex items-center">
                        <div className="w-2 h-2 bg-secondary rounded-full mr-2"></div>
                        {highlight}
                      </li>)}
                  </ul>
                </motion.div>)}
            </div>
          </div>
        </section>

        {/* Target Audiences */}
        <section className="py-16 bg-neutral-50">
          <div className="container mx-auto px-4">
            <motion.div className="text-center mb-12" initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6
          }}>
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">{t("Whoweserve", {
                defaultValue: "Whoweserve"
              })}</h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">{t("We specialize in creating meaningful experiences for diverse groups with varying objectives and requirements.", {
                defaultValue: "We specialize in creating meaningful experiences for diverse groups with varying objectives and requirements."
              })}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[{
              icon: <Building className="w-12 h-12" />,
              title: t("Corporate Groups", {
                defaultValue: "Corporate Groups"
              }),
              description: t("Executive retreats, team building, company incentive trips, and leadership development programs", {
                defaultValue: "Executive retreats, team building, company incentive trips, and leadership development programs"
              }),
              size: "10-100+ participants"
            }, {
              icon: <GraduationCap className="w-12 h-12" />,
              title: t("Educational Trips", {
                defaultValue: "Educational Trips"
              }),
              description: t("Student groups, university programs, cultural exchanges, and educational tours", {
                defaultValue: "Student groups, university programs, cultural exchanges, and educational tours"
              }),
              size: "15-50 students"
            }, {
              icon: <Users className="w-12 h-12" />,
              title: t("Special Interest Groups", {
                defaultValue: "Special Interest Groups"
              }),
              description: t("Wedding parties, yoga retreats, photography tours, and celebration events", {
                defaultValue: "Wedding parties, yoga retreats, photography tours, and celebration events"
              }),
              size: "8-30 participants"
            }, {
              icon: <Award className="w-12 h-12" />,
              title: t("Conferences & Seminars", {
                defaultValue: "Conferences & Seminars"
              }),
              description: t("Business conferences, workshops, training sessions, and professional meetings", {
                defaultValue: "Business conferences, workshops, training sessions, and professional meetings"
              }),
              size: "20-200+ attendees"
            }, {
              icon: <Target className="w-12 h-12" />,
              title: t("Wellness Groups", {
                defaultValue: "Wellness Groups"
              }),
              description: t("Health and wellness retreats, fitness groups, mindfulness programs, and spa experiences", {
                defaultValue: "Health and wellness retreats, fitness groups, mindfulness programs, and spa experiences"
              }),
              size: "6-25 participants"
            }, {
              icon: <Calendar className="w-12 h-12" />,
              title: t("Social Clubs", {
                defaultValue: "Social Clubs"
              }),
              description: t("Travel clubs, hobby groups, family reunions, and friend gatherings", {
                defaultValue: "Travel clubs, hobby groups, family reunions, and friend gatherings"
              }),
              size: "8-40 people"
            }].map((audience, index) => <motion.div key={index} className="bg-white p-6 rounded-lg shadow-md" initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6,
              delay: index * 0.1
            }}>
                  <div className="text-primary mb-4">
                    {audience.icon}
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-2">{audience.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{audience.description}</p>
                  <div className="text-xs text-secondary font-medium bg-secondary/10 px-2 py-1 rounded-full inline-block">
                    {audience.size}
                  </div>
                </motion.div>)}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section id="group-form" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div className="max-w-2xl mx-auto" initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6
          }}>
              <div className="text-center mb-8">
                <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">{t("Plan Your Group Experience", {
                  defaultValue: "Plan Your Group Experience"
                })}</h2>
                <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
                <p className="text-gray-600">{t('Tell us about your group and objectives, and we\'ll create a customized proposal for your Krabi experience.', {
                  defaultValue: 'Tell us about your group and objectives, and we\'ll create a customized proposal for your Krabi experience.'
                })}</p>
              </div>

              <form onSubmit={handleSubmit} className="bg-neutral-50 p-8 rounded-lg shadow-md space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactName">{t("Contact Name *", {
                      defaultValue: "Contact Name *"
                    })}</Label>
                    <Input id="contactName" name="contactName" value={formData.contactName} onChange={handleInputChange} placeholder={t("Your full name", {
                    defaultValue: "Your full name"
                  })} required />
                  </div>
                  <div>
                    <Label htmlFor="email">{t("Email address", {
                      defaultValue: "Email address"
                    })}</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" required />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">{t("Company/Organization *", {
                      defaultValue: "Company/Organization *"
                    })}</Label>
                    <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder={t("Your company or organization name", {
                    defaultValue: "Your company or organization name"
                  })} required />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t("Phone number", {
                      defaultValue: "Phone number"
                    })}</Label>
                    <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder={t("+66 XXXXXXXXX", {
                    defaultValue: "+66 XXXXXXXXX"
                  })} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="groupSize">{t("Number of People *", {
                      defaultValue: "Number of People *"
                    })}</Label>
                    <Input id="groupSize" name="groupSize" type="number" value={formData.groupSize} onChange={handleInputChange} placeholder={t("Approximate group size", {
                    defaultValue: "Approximate group size"
                  })} required />
                  </div>
                  <div>
                    <Label htmlFor="travelDates">{t("Preferred Travel Dates", {
                      defaultValue: "Preferred Travel Dates"
                    })}</Label>
                    <Input id="travelDates" name="travelDates" value={formData.travelDates} onChange={handleInputChange} placeholder={t("e.g., March 2024 or flexible", {
                    defaultValue: "e.g., March 2024 or flexible"
                  })} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget">{t("Budget Range", {
                      defaultValue: "Budget Range"
                    })}</Label>
                    <Input id="budget" name="budget" value={formData.budget} onChange={handleInputChange} placeholder={t("e.g., 50,000 - 100,000 THB", {
                    defaultValue: "e.g., 50,000 - 100,000 THB"
                  })} />
                  </div>
                  <div></div>
                </div>

                <div>
                  <Label htmlFor="description">{t("Group Objectives & Requirements *", {
                    defaultValue: "Group Objectives & Requirements *"
                  })}</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder={t('Describe your group\'s goals, interests, special requirements, preferred activities, and any specific needs...', {
                  defaultValue: 'Describe your group\'s goals, interests, special requirements, preferred activities, and any specific needs...'
                })} rows={5} required />
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
    </>;
}