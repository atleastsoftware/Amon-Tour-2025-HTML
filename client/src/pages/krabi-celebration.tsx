import { motion } from "framer-motion";
import { Heart, MapPin, Camera, Users, Sparkles, Clock, Gift, Star } from "lucide-react";
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
        title="Krabi Celebration - Des moments uniques dans un cadre d'exception"
        description="Laissez-vous séduire par la magie de Krabi et créez des souvenirs inoubliables avec Krabi Celebration. Mariages intimes, dîners romantiques et célébrations sur mesure en Thaïlande."
        keywords="krabi celebration, mariage thailande, diner romantique krabi, celebration mariage destination, organisateur mariage thailande, ceremonie plage privee"
      />
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative h-[70vh] overflow-hidden">
          <div className="absolute inset-0 bg-black/30 z-10"></div>
          <div className="absolute inset-0 z-0">
            <img 
              src={image3}
              alt="Cérémonie de mariage romantique sur plage à Krabi" 
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
                Des moments uniques dans un cadre d'exception
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
                Planifiez Votre Célébration
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
                Créez des Souvenirs Inoubliables
              </h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Laissez-vous séduire par la magie de Krabi et créez des souvenirs inoubliables avec Krabi Celebration, notre service exclusif dédié aux événements d'exception. Fort de notre expertise régionale et de notre passion pour l'authenticité thaïlandaise, nous orchestrons des célébrations sur mesure qui transforment vos rêves en réalité.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Que vous souhaitiez faire votre demande en mariage sur une plage secrète, célébrer votre union dans un cadre naturel époustouflant, ou simplement partager un dîner romantique sous les étoiles, Krabi Celebration met son savoir-faire et sa créativité à votre service pour créer des expériences véritablement uniques.
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
                Nos Expériences de Célébration
              </h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Choisissez parmi nos expériences signature ou laissez-nous créer quelque chose de complètement unique pour vous.
              </p>
            </motion.div>

            <div className="space-y-16">
              {/* Dîner Romantique */}
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
                      alt="Dîner romantique sur plage privée"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-secondary text-white px-3 py-1 rounded-full text-sm font-medium">
                        🌅 Expérience Romantique
                      </span>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="font-heading font-bold text-2xl mb-4">
                      Le Dîner Romantique sur Plage Privée
                    </h3>
                    <p className="text-gray-600 mb-4 italic">
                      L'expérience parfaite pour les âmes romantiques
                    </p>
                    <p className="text-gray-600 mb-4">
                      Évadez-vous vers une plage secrète près de la baie de Thalane, véritable joyau caché aux falaises multicolores que peu de voyageurs connaissent. Votre soirée commence par une navigation romantique au coucher du soleil vers ce paradis préservé.
                    </p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Le cadre :</strong> Plage privée face au coucher de soleil, installation bambou avec coussins traditionnels, éclairage aux flambeaux et décoration florale soignée</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <Gift className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Le menu :</strong> Buffet raffiné de spécialités thaïes avec fruits de mer grillés au barbecue, riz frit aux légumes, curry Massaman authentique, poisson en papillote, et plateau de fruits tropicaux</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>L'équipe :</strong> Capitaine thaï, cuisinière locale, guide professionnel et maître d'hôtel français en uniforme</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-2xl font-bold text-primary">22 000 THB</span>
                        <span className="text-sm text-gray-500">pour 2 personnes</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Options : Photographe professionnel (+8 000 THB), Champagne (+2 500 THB)
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Mariage Intime */}
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
                      alt="Mariage intime sur la plage"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                        💍 Mariage Intime
                      </span>
                    </div>
                  </div>
                  <div className="p-8 order-1 lg:order-2">
                    <h3 className="font-heading font-bold text-2xl mb-4">
                      Mariage intime sur la plage
                    </h3>
                    <p className="text-gray-600 mb-4 italic">
                      La cérémonie de vos rêves face à la baie de Phang Nga
                    </p>
                    <p className="text-gray-600 mb-4">
                      Commencez par une cérémonie de bénédiction traditionnelle au monastère Wat Nong Chik avec un moine bouddhiste, puis rejoignez la magnifique plage de Thalane pour célébrer votre union dans un cadre idyllique.
                    </p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-start text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Le programme :</strong> Cérémonie bouddhiste (16h), célébration sur plage avec échange de vœux, dîner romantique aux chandelles et envolée de lanternes traditionnelles</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <Heart className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Inclus :</strong> Bouquet et boutonnière, décoration bambou complète, certificat de mariage souvenir, maître de cérémonie français, et dîner au restaurant "Bac à Sable"</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-2xl font-bold text-primary">19 500 THB</span>
                        <span className="text-sm text-gray-500">pour 2 personnes</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Options : Photographe professionnel, champagne et vins supplémentaires
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Mariage Jardins Secrets */}
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
                      alt="Mariage dans les jardins secrets d'Ao Nammao"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-secondary text-white px-3 py-1 rounded-full text-sm font-medium">
                        🌿 Jardins Secrets
                      </span>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="font-heading font-bold text-2xl mb-4">
                      Mariage sur la plage dans les jardins secrets d'Ao Nammao
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Imaginez une cérémonie magique dans un jardin tropical au bord de la mer, suivie d'une soirée festive, gourmande et élégante... Dans un lieu confidentiel à Ao Nammao, entre deux villas de charme et un restaurant les pieds dans le sable, vivez une journée inoubliable entourés de ceux que vous aimez.
                    </p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Le concept :</strong> Un mariage intime et raffiné entre plage et jardin, au cœur d'un environnement naturel préservé</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <Gift className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Inclus :</strong> 2 villas de 2 chambres avec piscine et un grand jardin en bord de plage, structure en bambou fleurie, photographe, gâteau de mariage, installation complète, maître de cérémonie, DJ professionnel, vin d'honneur, bar à cocktail, spectacle de feu, dîner les pieds dans le sable</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-primary">Tarif sur Demande</span>
                        <span className="text-sm text-gray-500">Contactez-nous</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Célébration Jungle */}
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
                        <p className="text-lg font-semibold">Montagne de l'Esprit</p>
                        <p className="text-sm">Chong Pli</p>
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        🌴 Célébration Jungle
                      </span>
                    </div>
                  </div>
                  <div className="p-8 order-1 lg:order-2">
                    <h3 className="font-heading font-bold text-2xl mb-4">
                      Célébration dans la Jungle
                    </h3>
                    <p className="text-gray-600 mb-4 italic">
                      Un mariage spectaculaire pour jusqu'à 200 invités
                    </p>
                    <p className="text-gray-600 mb-4">
                      Découvrez la "Montagne de l'Esprit" à Chong Pli, un jardin tropical luxuriant niché au pied d'impressionnantes falaises calcaires. Ce lieu magique, refuge naturel de la communauté locale, offre un cadre unique mêlant grottes mystérieuses et végétation tropicale.
                    </p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-start text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Le concept :</strong> Une "Garden party" jusqu'à 200 invités pour une soirée inoubliable entre jungle et pic karstique</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <Gift className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Services inclus :</strong> Location du lieu, photographe 3h, gâteau de mariage, installation complète, maître de cérémonie anglophone, DJ professionnel, Buffet de spécialités Thaï, bar à smoothies et cocktails et soirée dansante jusqu'à 2h du matin</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xl font-bold text-primary">À partir de 4 900 THB</span>
                        <span className="text-sm text-gray-500">par personne</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Exemple pour 50 invités
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pourquoi Choisir Krabi Celebration */}
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
                Pourquoi Choisir Krabi Celebration ?
              </h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <MapPin className="w-8 h-8" />,
                  title: "Expertise locale",
                  description: "Connaissance approfondie des plus beaux sites secrets de Krabi"
                },
                {
                  icon: <Heart className="w-8 h-8" />,
                  title: "Service personnalisé",
                  description: "Chaque événement est unique et adapté à vos souhaits"
                },
                {
                  icon: <Users className="w-8 h-8" />,
                  title: "Équipe multilingue",
                  description: "Personnel français, anglais et thaï pour un service d'exception"
                },
                {
                  icon: <Star className="w-8 h-8" />,
                  title: "Authenticité garantie",
                  description: "Expériences ancrées dans la culture thaïlandaise"
                },
                {
                  icon: <Sparkles className="w-8 h-8" />,
                  title: "Logistique complète",
                  description: "De la conception à la réalisation, nous gérons tout"
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
                  Planifiez Votre Célébration
                </h2>
                <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
                <p className="text-gray-600">
                  Contactez-nous dès aujourd'hui pour transformer vos rêves en souvenirs éternels à Krabi !
                </p>
              </div>

              <form className="bg-white p-8 rounded-lg shadow-md space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Nom Complet *</Label>
                    <Input id="fullName" placeholder="Votre nom complet" required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" placeholder="votre@email.com" required />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventType">Type de Célébration *</Label>
                    <Input id="eventType" placeholder="ex: Mariage, Demande en mariage, Anniversaire" required />
                  </div>
                  <div>
                    <Label htmlFor="guestCount">Nombre d'Invités</Label>
                    <Input id="guestCount" type="number" placeholder="Nombre approximatif" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="desiredDate">Date Souhaitée</Label>
                    <Input id="desiredDate" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="budget">Budget Envisagé</Label>
                    <Input id="budget" placeholder="ex: 20 000-50 000 THB" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Décrivez-nous Votre Célébration de Rêve *</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Décrivez votre vision, le style souhaité, vos préférences de lieu et toute exigence particulière..."
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  Envoyer ma Demande de Célébration
                </Button>
              </form>

              <div className="text-center mt-8">
                <p className="text-gray-600 text-sm">
                  <strong>Krabi Celebration</strong> - Une division d'Amon Tour
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