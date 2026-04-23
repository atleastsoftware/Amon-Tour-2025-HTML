/**
 * Programmatic SEO destination landing pages.
 *
 * 6 keyword-targeted landing pages + a hub page (/destinations).
 * All routes serve full SSR HTML to every visitor (browser and bot alike).
 * These pages have no SPA counterpart, so server-rendered HTML is the only
 * rendering path — no bot-gating required.
 */
import type { Express, Request, Response } from "express";
import {
  ssrHtmlShell,
  sendSsrHtml,
  escapeHtml,
  escapeAttr,
  BRAND,
} from "./ssrShared";

const BASE_URL = BRAND.baseUrl;
const WA = BRAND.whatsappIntl;

/* ──────────────────────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────────────────────── */

type DestinationSection = { heading: string; content: string };
type DestinationFaq = { question: string; answer: string };

type Destination = {
  slug: string;
  lang: "fr" | "en" | "both";
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  sections: DestinationSection[];
  faq: DestinationFaq[];
  relatedSlugs: string[];
  /** Primary rich schema for the page (TravelAgency, TouristTrip, or other). */
  schema: object;
  /** Always a TouristTrip schema — used for hub ItemList + FAQPage pairing. */
  tripSchema: object;
};

/* ──────────────────────────────────────────────────────────────────────────
 * Destination data
 * ────────────────────────────────────────────────────────────────────────── */

const DESTINATIONS: Destination[] = [
  /* ── 1. Agence francophone Krabi ─────────────────────────────────────── */
  {
    slug: "agence-francophone-krabi",
    lang: "fr",
    title: "Agence de voyage francophone à Krabi | Amon Tour",
    metaDescription:
      "Amon Tour est l'agence de voyage francophone à Krabi. Guides francophones et anglophones depuis 2013. Tours privés, sur mesure, départ depuis Ao Nang. Réservez sur WhatsApp.",
    h1: "Agence de voyage francophone à Krabi — Amon Tour",
    intro:
      "Amon Tour est l'une des rares agences de voyage francophones basées à Krabi. Depuis 2013, nos guides bilingues français-anglais accompagnent des voyageurs francophones venus de France, de Belgique, de Suisse, du Canada, mais aussi de Nouvelle-Calédonie et de La Réunion, dans la découverte authentique du sud de la Thaïlande.",
    sections: [
      {
        heading: "Pourquoi choisir un guide francophone à Krabi ?",
        content: `<p>Voyager avec un guide francophone à Krabi, c'est bien plus qu'une question de langue. C'est la garantie de comprendre les nuances culturelles thaïlandaises, de poser des questions directement à la personne qui organise votre itinéraire, et de ne jamais vous retrouver dans un groupe de 30 personnes conduit par un intermédiaire qui ne parle ni votre langue ni la vôtre.</p>
<p>La plupart des agences de Krabi fonctionnent avec des revendeurs locaux qui transmettent vos demandes à des opérateurs tiers. Chez Amon Tour, vos guides sont les mêmes personnes qui ont conçu votre programme. Pas de jeu du téléphone, pas de surprise le matin du départ.</p>
<p>La différence se ressent surtout lors des visites culturelles : comprendre pourquoi on enlève ses chaussures avant d'entrer dans un temple, savoir comment saluer un moine, connaître les subtilités des marchés locaux — autant de détails que votre guide francophone vous transmet naturellement, comme en conversation.</p>`,
      },
      {
        heading: "Ce qu'Amon Tour propose concrètement",
        content: `<p>Depuis notre base à Ao Nang, à 25 km de la ville de Krabi, nous organisons des excursions privées à la journée, des séjours sur mesure et des bivouacs aventure. Nos tours couvrent :</p>
<ul>
<li>Les îles de la province de Krabi : Koh Phi Phi, les 4 Îles, Koh Hong, Bamboo Island, Railay Beach</li>
<li>La baie de Phang Nga : James Bond Island, Ko Panyi (village flottant), kayak en grottes marines</li>
<li>Le bivouac kayak Thalane dans les mangroves préservées de Phang Nga</li>
<li>La forêt tropicale de Khao Sok et le lac Cheow Lan</li>
<li>Des excursions multi-jours reliant Krabi, Phuket et Koh Lanta</li>
</ul>
<p>Tous nos tours sont privés ou en petit groupe (maximum 8 personnes). Nous n'organisons pas de tours en grand groupe avec d'autres voyageurs inconnus. Votre journée, votre rythme.</p>`,
      },
      {
        heading: "Comment réserver en français depuis la France, la Belgique ou le Canada",
        content: `<p>La façon la plus simple de nous contacter est <strong>WhatsApp</strong> au <a href="https://wa.me/${WA}">+66 86 476 3804</a>. Nous répondons généralement dans l'heure entre 8h00 et 21h00 heure de Thaïlande (ICT, GMT+7), soit en soirée pour l'Europe et dans la matinée pour le Québec.</p>
<p>Dites-nous simplement :</p>
<ul>
<li>Vos dates d'arrivée et de départ de Krabi</li>
<li>Le nombre de personnes dans votre groupe (adultes, enfants)</li>
<li>Vos centres d'intérêt principaux (plages, snorkeling, aventure, culture…)</li>
<li>Votre budget approximatif par personne</li>
</ul>
<p>Nous vous envoyons un programme détaillé avec tarifs dans les 24 heures. Aucun paiement immédiat n'est requis pour obtenir une proposition : nous travaillons d'abord à comprendre ce que vous cherchez.</p>
<p>Vous pouvez aussi remplir notre <a href="/custom-tour">formulaire de demande de tour sur mesure</a>, entièrement disponible en français.</p>`,
      },
      {
        heading: "Informations pratiques pour les francophones à Krabi",
        content: `<p><strong>Départ :</strong> Tous nos tours partent d'Ao Nang, la base d'Amon Tour. Si vous logez à Krabi Town, au Sheraton, à Tubkaek ou sur Koh Lanta, nous organisons le transfert.</p>
<p><strong>Paiement :</strong> THB (Bath thaïlandais), USD ou EUR acceptés. Le règlement se fait généralement sur place le jour du tour, en cash ou par virement. [TO INSERT : méthodes de paiement en ligne disponibles]</p>
<p><strong>Météo :</strong> La haute saison à Krabi s'étend de novembre à avril. Entre mai et octobre, certaines excursions en mer peuvent être annulées par mauvais temps — nous vous prévenons toujours 24h à l'avance et proposons un remboursement complet ou une date alternative.</p>
<p><strong>Nourriture halal :</strong> Plusieurs de nos guides connaissent les restaurants halal certifiés de la région, ce qui est apprécié des voyageurs malaisiens et singapouriens francophones. Signalez vos besoins alimentaires lors de la réservation.</p>`,
      },
    ],
    faq: [
      {
        question: "Y a-t-il des guides francophones à Krabi ?",
        answer:
          "Oui — Amon Tour dispose de guides bilingues français-anglais basés à Ao Nang, Krabi, depuis 2013. C'est rare dans la région : la grande majorité des agences de Krabi travaillent uniquement en anglais et en thaï.",
      },
      {
        question: "Comment réserver un tour en français à Krabi ?",
        answer:
          "Le plus simple est de nous contacter sur WhatsApp au +66 86 476 3804. Nous répondons en français dans l'heure pendant nos heures d'ouverture (8h-21h ICT). Vous pouvez aussi remplir notre formulaire de demande sur mesure sur ce site.",
      },
      {
        question: "Amon Tour parle-t-il français ?",
        answer:
          "Oui. Nos guides parlent couramment le français et l'anglais, ainsi que le thaï. Vous pouvez échanger en français du premier contact jusqu'à la fin de votre excursion.",
      },
      {
        question: "Amon Tour organise-t-il des tours pour les groupes scolaires ou associatifs francophones ?",
        answer:
          "Oui, nous pouvons organiser des programmes pour des groupes constitués (associations, groupes d'amis, séminaires). Contactez-nous avec la taille de votre groupe et vos dates pour obtenir une proposition dédiée.",
      },
    ],
    relatedSlugs: ["koh-phi-phi", "phang-nga-bay", "railay-beach"],
    schema: {
      "@context": "https://schema.org",
      "@type": ["TravelAgency", "TouristInformationCenter"],
      name: "Amon Tour",
      url: BASE_URL,
      description:
        "Agence de voyage francophone basée à Krabi, Thaïlande. Guides bilingues français-anglais depuis 2013. Tours privés sur mesure.",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Ao Nang",
        addressLocality: "Krabi",
        addressCountry: "TH",
      },
      telephone: BRAND.phoneIntl,
      availableLanguage: ["French", "English", "Thai"],
      areaServed: { "@type": "Country", name: "Thailand" },
    },
    tripSchema: {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: "Services d'agence voyage francophone à Krabi — Amon Tour",
      description:
        "Tours privés organisés par une agence francophone basée à Krabi depuis 2013. Guides bilingues français-anglais. Sur mesure, petit groupe, départ Ao Nang.",
      url: `${BASE_URL}/destinations/agence-francophone-krabi`,
      provider: { "@type": "TravelAgency", name: "Amon Tour", url: BASE_URL },
      touristType: ["FrenchSpeaking", "Family", "Couple"],
      availableLanguage: ["French", "English", "Thai"],
      geo: { "@type": "GeoCoordinates", latitude: 8.0319, longitude: 98.8254 },
    },
  },

  /* ── 2. Koh Phi Phi ──────────────────────────────────────────────────── */
  {
    slug: "koh-phi-phi",
    lang: "both",
    title: "Tour privé Koh Phi Phi depuis Krabi | Amon Tour",
    metaDescription:
      "Tour privé Koh Phi Phi depuis Ao Nang, Krabi. Visitez Maya Bay, Viking Cave, snorkeling à Phi Phi Ley avec un guide francophone. Départ journée complète ~8h. Réservez sur WhatsApp.",
    h1: "Tour privé Koh Phi Phi depuis Krabi | Amon Tour",
    intro:
      "Le tour privé Koh Phi Phi est l'une des excursions les plus demandées depuis Krabi — et l'une de celles où la différence entre un tour de groupe et un tour privé est la plus visible. Avec Amon Tour, vous partez depuis Ao Nang sur un bateau réservé pour vous seuls, vous choisissez l'ordre des arrêts et vous passez plus de temps là où vous aimez.",
    sections: [
      {
        heading: "Koh Phi Phi Don et Koh Phi Phi Ley : deux îles très différentes",
        content: `<p><strong>Koh Phi Phi Don</strong> est l'île habitée, avec ses hôtels, restaurants et plages animées. La partie nord-ouest, autour de Ton Sai Bay et Long Beach, concentre la majorité des hébergements. C'est une île à vivre — marché de nuit, bars de plage, cours de plongée.</p>
<p><strong>Koh Phi Phi Ley</strong>, l'île voisine, est entièrement classée parc marin national et non habitée. Elle abrite <strong>Maya Bay</strong> (la plage rendue célèbre par le film <em>The Beach</em> avec Leonardo DiCaprio) et la <strong>Pileh Lagoon</strong>, un lagon fermé aux eaux turquoise saisissantes.</p>
<p>La plupart des tours standards ne passent qu'une heure à Maya Bay et filent enchaîner d'autres arrêts avec d'autres groupes. En tour privé, vous décidez de rester plus longtemps dans la Pileh Lagoon ou de nager aux <strong>Monkey Beach</strong> sans foule.</p>`,
      },
      {
        heading: "Maya Bay : accès, droits d'entrée et meilleur moment",
        content: `<p>Maya Bay a rouvert en 2022 après plusieurs années de fermeture pour régénération des coraux. L'accès est désormais réglementé :</p>
<ul>
<li>Des droits d'entrée au parc national sont perçus sur place (inclus dans notre tour)</li>
<li>La plage est accessible de 6h00 à 18h00 uniquement</li>
<li>Le nombre de bateaux est limité à certains postes d'amarrage</li>
</ul>
<p><strong>Meilleur moment :</strong> Arriver tôt (avant 9h) ou en fin d'après-midi (après 15h) permet d'éviter le pic de fréquentation. En tour privé, nous organisons le départ tôt depuis Ao Nang pour être parmi les premiers bateaux à entrer dans la baie.</p>
<p>Entre novembre et avril (haute saison), les eaux sont calmes et la visibilité sous-marine excellente. D'août à octobre, la mer peut être plus agitée côté est des îles — nous adaptons l'itinéraire.</p>`,
      },
      {
        heading: "Viking Cave et les nids d'hirondelles",
        content: `<p>La <strong>Viking Cave</strong> (Tham Phaya Nark) est une grotte marine spectaculaire sur la côte nord de Phi Phi Ley. Ses parois sont couvertes de peintures rupestres représentant des bateaux (d'où le nom "Viking") — en réalité des embarcations de pêcheurs de Malaisie et d'Indonésie datant de plusieurs siècles.</p>
<p>La grotte est également célèbre pour ses nids d'hirondelles salanganes, récoltés pour la soupe de nids d'oiseaux, un mets de luxe en Chine et en Asie du Sud-Est. Des échafaudages en bambou atteignant 60 mètres de hauteur permettent aux récolteurs d'accéder aux nids. Cette pratique, réglementée et ancienne, est fascinante à observer depuis le bateau.</p>`,
      },
      {
        heading: "Snorkeling à Phi Phi : où et quoi voir",
        content: `<p>Les meilleures zones de snorkeling autour de Phi Phi sont :</p>
<ul>
<li><strong>Hin Klang</strong> et <strong>Hin Bida</strong> : récifs peu profonds avec poissons tropicaux, tortues vertes et parfois requins de récif</li>
<li><strong>Pileh Lagoon</strong> : eaux claires, peu de vagues, idéal pour les enfants</li>
<li><strong>Bamboo Island</strong> (Koh Phai) : petite île au nord de Phi Phi Don, coraux intacts et eau cristalline</li>
</ul>
<p>Tout le matériel de snorkeling (masques, tubas, palmes) est fourni à bord. Nous avons également des gilets de sauvetage pour les non-nageurs et les enfants.</p>
<p><strong>Tour adapté aux familles :</strong> nous ralentissons le rythme, préparons des encas adaptés et choisissons les zones les plus calmes pour les enfants. Signalez-nous l'âge de vos enfants à la réservation.</p>`,
      },
      {
        heading: "Infos pratiques : durée, départ, inclusions",
        content: `<p><strong>Durée :</strong> Journée complète (~8 heures). Départ d'Ao Nang vers 8h-8h30, retour vers 17h.</p>
<p><strong>Départ :</strong> Ao Nang Beach (Krabi). Pickup hôtel disponible à Ao Nang et Nopparat Thara.</p>
<p><strong>Inclus :</strong> bateau privé, guide bilingue, matériel snorkeling, eau et fruits à bord, droits d'entrée parc national, déjeuner [TO INSERT : déjeuner inclus ou non selon la formule].</p>
<p><strong>Tarif :</strong> [TO INSERT : prix par personne, min. 2 personnes].</p>
<p><strong>Réservation :</strong> <a href="https://wa.me/${WA}">WhatsApp</a> ou <a href="/contact">formulaire de contact</a>.</p>`,
      },
    ],
    faq: [
      {
        question: "Combien de temps prend le tour Koh Phi Phi depuis Krabi ?",
        answer:
          "Environ 8 heures en journée complète. Départ d'Ao Nang vers 8h-8h30, retour vers 17h00. La traversée aller depuis Ao Nang dure environ 45 minutes en speedboat privé.",
      },
      {
        question: "Peut-on visiter Maya Bay en privé ?",
        answer:
          "Oui. En réservant un bateau privé avec Amon Tour, vous accédez à Maya Bay avec votre groupe uniquement, sans mélange avec d'autres voyageurs. Nous organisons le départ tôt pour éviter le pic de fréquentation.",
      },
      {
        question: "Quel est le meilleur moment pour visiter Koh Phi Phi ?",
        answer:
          "De novembre à avril, la mer est calme et la visibilité sous-marine est excellente. Le mois de janvier est idéal. D'août à octobre, des vents peuvent agiter la mer — Amon Tour adapte l'itinéraire en conséquence.",
      },
      {
        question: "Le tour Koh Phi Phi est-il adapté aux enfants ?",
        answer:
          "Oui. En tour privé, nous adaptons le rythme, les arrêts et les zones de snorkeling à l'âge et aux capacités de vos enfants. Gilets de sauvetage fournis à bord pour tous. Merci d'indiquer l'âge des enfants lors de la réservation.",
      },
    ],
    relatedSlugs: ["phang-nga-bay", "railay-beach", "catamaran-krabi"],
    schema: {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: "Tour privé Koh Phi Phi depuis Krabi",
      description:
        "Excursion privée en bateau d'Ao Nang vers Koh Phi Phi Ley et Koh Phi Phi Don. Visite de Maya Bay, Viking Cave, snorkeling, Pileh Lagoon. Guides francophones depuis 2013.",
      url: `${BASE_URL}/destinations/koh-phi-phi`,
      provider: { "@type": "TravelAgency", name: "Amon Tour", url: BASE_URL },
      touristType: ["Family", "Couple", "Adventure"],
      itinerary: {
        "@type": "ItemList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Départ d'Ao Nang" },
          { "@type": "ListItem", position: 2, name: "Maya Bay (Koh Phi Phi Ley)" },
          { "@type": "ListItem", position: 3, name: "Pileh Lagoon" },
          { "@type": "ListItem", position: 4, name: "Viking Cave" },
          { "@type": "ListItem", position: 5, name: "Snorkeling Hin Klang" },
          { "@type": "ListItem", position: 6, name: "Retour Ao Nang" },
        ],
      },
      geo: { "@type": "GeoCoordinates", latitude: 7.7407, longitude: 98.7784 },
    },
    tripSchema: {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: "Tour privé Koh Phi Phi depuis Krabi",
      description:
        "Excursion privée en bateau d'Ao Nang vers Koh Phi Phi Ley et Koh Phi Phi Don. Visite de Maya Bay, Viking Cave, snorkeling, Pileh Lagoon. Guides francophones depuis 2013.",
      url: `${BASE_URL}/destinations/koh-phi-phi`,
      provider: { "@type": "TravelAgency", name: "Amon Tour", url: BASE_URL },
      touristType: ["Family", "Couple", "Adventure"],
      geo: { "@type": "GeoCoordinates", latitude: 7.7407, longitude: 98.7784 },
    },
  },

  /* ── 3. Phang Nga Bay ────────────────────────────────────────────────── */
  {
    slug: "phang-nga-bay",
    lang: "both",
    title: "Excursion Phang Nga Bay depuis Krabi | James Bond Island | Amon Tour",
    metaDescription:
      "Excursion privée Phang Nga Bay depuis Krabi : James Bond Island, kayak en grottes marines, village flottant Ko Panyi. Guide francophone, bateau privé. Réservez sur WhatsApp.",
    h1: "Excursion Phang Nga Bay depuis Krabi | Amon Tour",
    intro:
      "L'excursion Phang Nga Bay depuis Krabi est l'une des journées les plus spectaculaires du sud de la Thaïlande. La baie concentre des formations calcaires à couper le souffle, des grottes marines accessibles en kayak, et le célèbre James Bond Island — le tout à moins de 2 heures de bateau depuis Ao Nang.",
    sections: [
      {
        heading: "James Bond Island (Ko Tapu) : l'incontournable de la baie",
        content: `<p><strong>Ko Tapu</strong> — surnommé James Bond Island depuis le tournage de <em>L'Homme au pistolet d'or</em> (1974) — est un piton rocheux de 20 mètres qui se dresse dans la baie à la verticale, posé sur une base si étroite que l'ensemble semble défier la gravité. La vue depuis un bateau ou depuis la plage voisine de Ko Phang Kan est l'une des photos les plus mémorables de Thaïlande.</p>
<p>Ko Tapu fait partie du <strong>Parc marin national de Phang Nga</strong>, classé zone protégée. Les droits d'entrée sont inclus dans tous nos tours. Sur place, des artisans vendent des sculptures locales, et on trouve des stands de fruits frais et de noix de coco.</p>
<p><strong>Astuce :</strong> La majorité des tours arrivent entre 10h et 12h. En organisant un départ depuis Krabi à 7h, nous pouvons atteindre l'île avant la foule pour les photos. Contactez-nous pour discuter du planning optimal.</p>`,
      },
      {
        heading: "Kayak en grottes marines : l'expérience unique de Phang Nga",
        content: `<p>Ce qui distingue Phang Nga Bay de tous les paysages marins que vous avez déjà vus, ce sont ses <strong>hongs</strong> — des lagons cachés à l'intérieur des formations calcaires, accessibles uniquement à marée basse via des tunnels obscurs que l'on traverse en kayak allongé dans l'embarcation.</p>
<p>L'une des expériences les plus saisissantes de notre programme : entrer à plat dos dans l'obscurité d'une grotte, entendre le bruit de l'eau contre la paroche, puis déboucher dans un lagon intérieur ouvert sur le ciel, cerné de falaises de 50 mètres, habité par des singes macaques et des varans. Le contraste entre le tunnel sombre et le lagon lumineux reste gravé dans la mémoire de tous ceux qui l'ont vécu.</p>
<p>Pas besoin d'expérience en kayak — les guides pagaient si vous le souhaitez. Les kayaks doubles permettent d'emmener un enfant. Prévoir des vêtements qui peuvent se mouiller.</p>`,
      },
      {
        heading: "Ko Panyi : le village flottant musulman de la baie",
        content: `<p><strong>Ko Panyi</strong> est l'un des villages flottants les plus fascinants d'Asie du Sud-Est. Plus de 1 800 habitants y vivent sur pilotis, dans des maisons construites directement sur les eaux de la baie, sans aucune terre ferme sous leurs pieds. Le village est à majorité musulmane depuis sa fondation au XVIIIe siècle par des pêcheurs malais — une histoire ancrée dans la géographie de la péninsule malaise.</p>
<p>Ko Panyi dispose d'une mosquée, d'une école, d'une équipe de football (dont le terrain flottant est célèbre), de restaurants de fruits de mer et de boutiques d'artisanat. Le déjeuner à Ko Panyi — fruits de mer frais cuisinés sur place — est une étape culinaire mémorable. <strong>Nourriture halal disponible</strong>, ce qui est particulièrement apprécié des visiteurs malaisiens et singapouriens.</p>`,
      },
      {
        heading: "Phang Nga Bay depuis Krabi ou depuis Phuket ?",
        content: `<p>La baie de Phang Nga est souvent proposée depuis Phuket, mais <strong>l'accès depuis Krabi est tout aussi pratique</strong> — voire plus court pour certaines zones de la baie. La traversée depuis Ao Nang prend environ 1h30 en speedboat.</p>
<p>En partant depuis Krabi, on évite également les concentrations de bateaux qui viennent de Phuket et qui arrivent souvent en même temps, créant des embouteillages à l'accostage de Ko Tapu. Notre timing depuis Krabi nous permet d'arriver avant ou après les pics de fréquentation.</p>`,
      },
      {
        heading: "Infos pratiques : durée, départ, inclusions",
        content: `<p><strong>Durée :</strong> Journée complète (~9-10 heures). Départ d'Ao Nang vers 7h30-8h, retour vers 17h-18h.</p>
<p><strong>Départ :</strong> Ao Nang Beach (Krabi). Pickup hôtel disponible.</p>
<p><strong>Inclus :</strong> bateau privé, guide bilingue, kayaks, droits d'entrée parc national, eau à bord, déjeuner à Ko Panyi [TO INSERT : vérifier inclusions exactes selon formule].</p>
<p><strong>Tarif :</strong> [TO INSERT : prix par personne].</p>
<p><strong>Réservation :</strong> <a href="https://wa.me/${WA}">WhatsApp</a> ou <a href="/contact">formulaire de contact</a>.</p>`,
      },
    ],
    faq: [
      {
        question: "Peut-on faire Phang Nga Bay depuis Krabi ?",
        answer:
          "Oui, tout à fait. La traversée depuis Ao Nang (Krabi) jusqu'à la baie de Phang Nga prend environ 1h30 en speedboat. C'est une alternative valide — et souvent moins fréquentée — à l'accès depuis Phuket.",
      },
      {
        question: "James Bond Island est-il loin de Krabi ?",
        answer:
          "En speedboat privé depuis Ao Nang, on atteint James Bond Island en environ 1h30 à 2h selon les conditions de mer. C'est une excursion journée, avec départ tôt depuis Krabi.",
      },
      {
        question: "Y a-t-il du kayak à Phang Nga Bay ?",
        answer:
          "Oui — le kayak est l'une des activités phares de la baie, permettant d'entrer dans les hongs (lagons cachés à l'intérieur des formations calcaires). Aucune expérience préalable n'est requise. Les guides pagaient si vous préférez.",
      },
      {
        question: "Ko Panyi propose-t-il de la nourriture halal ?",
        answer:
          "Ko Panyi est un village musulman — la quasi-totalité des restaurants y servent des plats halal à base de poisson et de fruits de mer frais. C'est l'un des arrêts les plus appréciés des visiteurs malaisiens et singapouriens.",
      },
    ],
    relatedSlugs: ["koh-phi-phi", "thalane-bivouac", "catamaran-krabi"],
    schema: {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: "Excursion privée Phang Nga Bay depuis Krabi",
      description:
        "Journée privée dans la baie de Phang Nga depuis Krabi : James Bond Island (Ko Tapu), kayak en grottes marines, village flottant Ko Panyi. Guide bilingue FR/EN.",
      url: `${BASE_URL}/destinations/phang-nga-bay`,
      provider: { "@type": "TravelAgency", name: "Amon Tour", url: BASE_URL },
      touristType: ["Family", "Couple", "Adventure"],
      geo: { "@type": "GeoCoordinates", latitude: 8.2653, longitude: 98.5027 },
    },
    tripSchema: {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: "Excursion privée Phang Nga Bay depuis Krabi",
      description:
        "Journée privée dans la baie de Phang Nga depuis Krabi : James Bond Island (Ko Tapu), kayak en grottes marines, village flottant Ko Panyi. Guide bilingue FR/EN.",
      url: `${BASE_URL}/destinations/phang-nga-bay`,
      provider: { "@type": "TravelAgency", name: "Amon Tour", url: BASE_URL },
      touristType: ["Family", "Couple", "Adventure"],
      geo: { "@type": "GeoCoordinates", latitude: 8.2653, longitude: 98.5027 },
    },
  },

  /* ── 4. Thalane Bivouac ──────────────────────────────────────────────── */
  {
    slug: "thalane-bivouac",
    lang: "fr",
    title: "Bivouac Thalane — Kayak & Nuit en Nature à Phang Nga | Amon Tour",
    metaDescription:
      "Bivouac kayak Thalane : paddlez dans des mangroves vierges à Phang Nga, atteignez un lagon secret inaccessible à pied, dormez sous les étoiles. Expérience signature d'Amon Tour.",
    h1: "Bivouac kayak Thalane — Expérience secrète à Phang Nga | Amon Tour",
    intro:
      "Le bivouac kayak Thalane est l'expérience la plus secrète et la plus intense qu'Amon Tour propose. À deux heures de route de Krabi, dans le district peu touristique de Klong Thom, la rivière Thalane ouvre un accès unique à des mangroves vierges et à un lagon intérieur que l'on ne peut atteindre qu'en kayak — et uniquement à certaines heures de marée.",
    sections: [
      {
        heading: "Qu'est-ce que Thalane ?",
        content: `<p>Thalane (ou Talane) est une zone de mangroves classée dans la province de Phang Nga, à l'opposé des circuits touristiques habituels. La rivière est bordée de palétuviers centenaires dont les racines aériennes créent des voûtes naturelles au ras de l'eau. On y croise des loutres, des varans, des singes macaques, des martins-pêcheurs et, en saison, des lucioles la nuit.</p>
<p>L'attraction principale n'est pas un site aménagé — c'est précisément son absence d'aménagement qui fait son charme. Pas de boutiques, pas de restaurant, pas de panneau "à voir". Juste l'eau, les arbres, le silence, et la sensation d'être quelque part que 99 % des touristes de Krabi n'ont jamais vu.</p>`,
      },
      {
        heading: "Le lagon secret : comment y accéder",
        content: `<p>Au fond des mangroves, un tunnel naturel entre les formations calcaires permet, à marée basse uniquement, de déboucher dans un <strong>lagon fermé entouré de falaises</strong>. La lumière qui tombe depuis l'ouverture zénithale, la couleur de l'eau, le silence parfait : c'est l'un des endroits les plus paisibles qu'on puisse trouver en Thaïlande.</p>
<p>L'accès impose de passer le tunnel allongé dans le kayak — une expérience qui mélange une légère sensation de claustrophobie (passage dans l'obscurité) et un sentiment de découverte absolue à la sortie. Les personnes qui ont tendance à la claustrophobie peuvent rester à l'entrée du tunnel ; les eaux devant sont déjà magnifiques.</p>
<p>En raison de la dépendance aux marées, l'accès n'est possible que deux fois par jour, sur des créneaux de 2 à 3 heures. Amon Tour organise le timing du départ depuis Krabi en fonction des tables de marée du jour concerné.</p>`,
      },
      {
        heading: "La nuit en bivouac : ce que vous vivez",
        content: `<p>Après la navigation, le bivouac est installé sur une plateforme ou une zone abritée au bord de l'eau. Le soir comprend :</p>
<ul>
<li>Un repas préparé sur place (cuisine thaïe, produits locaux)</li>
<li>Une balade nocturne optionnelle en kayak pour observer les lucioles</li>
<li>Une nuit sous une toile ou dans des hamacs (matériel fourni, tapis de sol, sacs de couchage légers)</li>
<li>Un petit-déjeuner au lever du soleil sur l'eau</li>
</ul>
<p>Ce n'est pas un camping confortable avec douches chaudes. C'est un bivouac nature, pour des personnes qui veulent sortir des sentiers battus et vivre quelque chose d'authentique. Si vous recherchez un hôtel avec piscine, cette expérience n'est pas pour vous — et nous le disons avec bienveillance.</p>`,
      },
      {
        heading: "Conditions physiques et contre-indications",
        content: `<p>Le bivouac Thalane ne requiert pas d'expérience particulière en kayak. Les kayaks sont doubles, stables, et les distances de paddling sont adaptées au niveau de chacun. Comptez 2 à 4 heures de kayak au total sur la journée, à un rythme tranquille avec de nombreuses pauses d'observation.</p>
<p>Ce programme est déconseillé aux personnes :</p>
<ul>
<li>Souffrant de claustrophobie sévère (passage en tunnel)</li>
<li>Ayant des difficultés importantes de mobilité (montée/descente du kayak)</li>
<li>Enceintes (déconseillé par précaution sur le terrain)</li>
</ul>
<p>Il est adapté aux voyageurs sportifs de 12 ans et plus accompagnés d'adultes. Nous évaluons chaque demande avec vous avant de confirmer.</p>`,
      },
      {
        heading: "Pourquoi Thalane est l'expérience signature d'Amon Tour",
        content: `<p>Nous organisons ce bivouac depuis des années, en partenariat avec des familles locales qui connaissent ces mangroves comme leur maison. Ce n'est pas un produit "formaté" : chaque sortie est différente, selon la marée, la saison, et le groupe. Nous limitons volontairement les groupes à <strong>maximum 6 personnes</strong> pour préserver la qualité de l'expérience et l'impact sur l'environnement.</p>
<p>Si vous n'avez qu'une seule journée et nuit à consacrer à une expérience hors du commun à Krabi — pas une excursion touristique mais quelque chose qui vous marquera — c'est celle-là. <a href="https://wa.me/${WA}">Contactez-nous sur WhatsApp</a> pour vérifier les disponibilités.</p>`,
      },
    ],
    faq: [
      {
        question: "Qu'est-ce que le bivouac Thalane ?",
        answer:
          "C'est une expérience de kayak et de nuit en nature dans les mangroves de Thalane (province de Phang Nga), à 2h de Krabi. On accède à un lagon secret en kayak via un tunnel naturel, puis on passe la nuit sur place avant de rentrer le lendemain matin.",
      },
      {
        question: "Le bivouac Thalane est-il physiquement difficile ?",
        answer:
          "Non. Le kayak est accessible aux débutants — les kayaks sont stables, les distances modérées (2-4h de pagayage à rythme tranquille). Le seul point d'attention : le passage d'un tunnel naturel à plat dos peut être inconfortable pour les personnes claustrophobes.",
      },
      {
        question: "Qu'est-ce qui est inclus dans le bivouac Thalane ?",
        answer:
          "Transport depuis Krabi, kayaks, guide, repas du soir et petit-déjeuner, matériel de bivouac (tapis, sacs de couchage légers, toile). [TO INSERT : détail complet des inclusions selon la formule choisie].",
      },
      {
        question: "Peut-on faire Thalane en journée sans bivouac ?",
        answer:
          "Oui, il est possible de visiter les mangroves de Thalane en excursion à la journée sans nuit sur place. Cependant, le bivouac ajoute une dimension unique — la nuit sur l'eau, les lucioles, le lever de soleil. Nous recommandons vivement la formule 2 jours/1 nuit si votre programme le permet.",
      },
    ],
    relatedSlugs: ["phang-nga-bay", "agence-francophone-krabi", "catamaran-krabi"],
    schema: {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: "Bivouac kayak Thalane — Mangroves de Phang Nga",
      description:
        "Expérience de 2 jours/1 nuit en kayak dans les mangroves préservées de Thalane, Phang Nga. Accès à un lagon secret en tunnel naturel. Bivouac nature, cuisine locale. Max 6 personnes.",
      url: `${BASE_URL}/destinations/thalane-bivouac`,
      provider: { "@type": "TravelAgency", name: "Amon Tour", url: BASE_URL },
      touristType: ["Adventure", "Nature"],
      duration: "P2D",
      geo: { "@type": "GeoCoordinates", latitude: 8.05, longitude: 98.73 },
    },
    tripSchema: {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: "Bivouac kayak Thalane — Mangroves de Phang Nga",
      description:
        "Expérience de 2 jours/1 nuit en kayak dans les mangroves préservées de Thalane, Phang Nga. Accès à un lagon secret en tunnel naturel. Bivouac nature, cuisine locale. Max 6 personnes.",
      url: `${BASE_URL}/destinations/thalane-bivouac`,
      provider: { "@type": "TravelAgency", name: "Amon Tour", url: BASE_URL },
      touristType: ["Adventure", "Nature"],
      duration: "P2D",
      geo: { "@type": "GeoCoordinates", latitude: 8.05, longitude: 98.73 },
    },
  },

  /* ── 5. Catamaran Krabi ──────────────────────────────────────────────── */
  {
    slug: "catamaran-krabi",
    lang: "fr",
    title: "Catamaran privatif à Krabi — Location avec guides | Amon Tour",
    metaDescription:
      "Location de catamaran privatif à Krabi avec guides bilingues. Couchers de soleil, visite des îles, snorkeling. Idéal couples et familles. Départ Ao Nang. Réservez sur WhatsApp.",
    h1: "Catamaran privatif à Krabi — Location avec guides | Amon Tour",
    intro:
      "Le catamaran privatif est la façon la plus élégante et la plus confortable d'explorer les îles de Krabi. À la différence d'un speedboat bondé ou d'un longtail boat sonore, un catamaran offre de l'espace, de la stabilité, et une navigation silencieuse au moteur ou à la voile selon les conditions.",
    sections: [
      {
        heading: "Pourquoi choisir le catamaran plutôt qu'un speedboat ?",
        content: `<p>Les speedboats longent les côtes à pleine vitesse, s'arrêtent quelques minutes à chaque site et repartent. C'est efficace pour cocher des cases — beaucoup moins pour profiter réellement des paysages.</p>
<p>Un catamaran privatif change complètement la nature de l'excursion :</p>
<ul>
<li><strong>Espace :</strong> filets à l'avant pour vous allonger, cockpit ombragé, toilettes à bord, petit salon intérieur</li>
<li><strong>Stabilité :</strong> la coque double du catamaran élimine le tangage — idéal si certains membres du groupe ont le mal de mer</li>
<li><strong>Silence :</strong> la navigation à la voile (quand le vent le permet) offre une expérience totalement différente des moteurs vrombissants</li>
<li><strong>Flexibilité :</strong> vous décidez des arrêts, de la durée à chaque endroit, et du rythme de la journée</li>
</ul>
<p>C'est l'option préférée des couples en voyage de noces, des familles avec enfants en bas âge, et des groupes d'amis qui veulent profiter d'une journée en mer sans contrainte de temps.</p>`,
      },
      {
        heading: "Destinations accessibles en catamaran depuis Ao Nang",
        content: `<p>Selon la durée de location et la météo, le catamaran peut couvrir :</p>
<ul>
<li><strong>4 Îles (Koh Mook, Koh Ngai, Koh Kradan, Koh Libong)</strong> : archipel au sud de Krabi, eaux turquoise, plages désertes</li>
<li><strong>Railay Beach et Koh Poda</strong> : falaises calcaires de Krabi à portée de voile</li>
<li><strong>Bamboo Island et Chicken Island</strong> : spots snorkeling au nord de Phi Phi</li>
<li><strong>Coucher de soleil sur les falaises de Railay</strong> : la formule "sunset cruise" — départ vers 15h, ancre face aux falaises dorées au coucher du soleil</li>
</ul>
<p>Certains programmes incluent un ancrage pour la nuit en mer, pour les groupes qui souhaitent passer plus de temps loin des côtes.</p>`,
      },
      {
        heading: "Capacité, équipage et inclusions",
        content: `<p>Notre catamaran peut accueillir <strong>jusqu'à 8 à 10 passagers</strong> selon le modèle disponible (vérifier disponibilité). L'équipage comprend un skipper et un guide bilingue — vous n'avez pas à vous préoccuper de la navigation.</p>
<p>Inclus à bord :</p>
<ul>
<li>Équipement de snorkeling (masques, tubas, palmes)</li>
<li>Gilets de sauvetage et équipements de sécurité</li>
<li>Eau, sodas, jus de fruits [TO INSERT : boissons exactes incluses]</li>
<li>Repas ou en-cas selon la durée [TO INSERT : formule repas]</li>
</ul>
<p><strong>Option sunset cruise :</strong> demi-journée (4-5h), idéale pour les couples. Champagne ou vins à bord sur demande [TO INSERT : options boissons premium].</p>`,
      },
      {
        heading: "Le catamaran pour un voyage de noces à Krabi",
        content: `<p>Krabi est une destination de voyage de noces très prisée des couples français, suisses et belges. La combinaison falaises calcaires + eaux turquoise + ambiance paisible en fait un cadre inoubliable.</p>
<p>Pour un voyage de noces, nous pouvons personnaliser entièrement la journée :</p>
<ul>
<li>Ancre dans une crique déserte pour un déjeuner privé</li>
<li>Décoration fleurie à bord pour l'arrivée</li>
<li>Photographe ou vidéaste à bord [TO INSERT : options photo/vidéo]</li>
<li>Sunset cruise vers les falaises dorées de Railay</li>
</ul>
<p>Parlez-nous de votre projet en nous contactant sur <a href="https://wa.me/${WA}">WhatsApp</a>.</p>`,
      },
    ],
    faq: [
      {
        question: "Combien de personnes peut accueillir un catamaran privatif à Krabi ?",
        answer:
          "Notre catamaran peut accueillir jusqu'à 8 à 10 passagers selon le modèle. L'embarcation est entièrement privatisée — aucun autre voyageur ne vous sera ajouté.",
      },
      {
        question: "Quelles îles visite-t-on en catamaran depuis Krabi ?",
        answer:
          "Selon la durée et le programme choisi : Railay Beach, Koh Poda, Bamboo Island, les 4 Îles (Koh Mook, Koh Ngai, Koh Kradan). Une formule sunset cruise se concentre sur Railay et les falaises de Krabi.",
      },
      {
        question: "Y a-t-il un catamaran disponible pour les couchers de soleil à Krabi ?",
        answer:
          "Oui — la formule sunset cruise (4-5h, départ vers 15h) est conçue pour voir le coucher de soleil depuis la mer, face aux falaises calcaires de Railay. Elle est particulièrement demandée par les couples.",
      },
      {
        question: "Le catamaran est-il adapté aux enfants ?",
        answer:
          "Oui. La stabilité du catamaran le rend bien plus confortable pour les enfants que le speedboat, notamment par mer formée. Les filets à l'avant sont toutefois à surveiller pour les très jeunes enfants.",
      },
    ],
    relatedSlugs: ["koh-phi-phi", "railay-beach", "phang-nga-bay"],
    schema: {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: "Location catamaran privatif Krabi",
      description:
        "Location de catamaran privatif à Krabi avec skipper et guide bilingue FR/EN. Excursions îles, sunset cruise, voyage de noces. Départ Ao Nang. Jusqu'à 10 personnes.",
      url: `${BASE_URL}/destinations/catamaran-krabi`,
      provider: { "@type": "TravelAgency", name: "Amon Tour", url: BASE_URL },
      touristType: ["Couple", "Family", "Luxury"],
      geo: { "@type": "GeoCoordinates", latitude: 8.0319, longitude: 98.8254 },
    },
    tripSchema: {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: "Location catamaran privatif Krabi",
      description:
        "Location de catamaran privatif à Krabi avec skipper et guide bilingue FR/EN. Excursions îles, sunset cruise, voyage de noces. Départ Ao Nang. Jusqu'à 10 personnes.",
      url: `${BASE_URL}/destinations/catamaran-krabi`,
      provider: { "@type": "TravelAgency", name: "Amon Tour", url: BASE_URL },
      touristType: ["Couple", "Family", "Luxury"],
      geo: { "@type": "GeoCoordinates", latitude: 8.0319, longitude: 98.8254 },
    },
  },

  /* ── 6. Railay Beach ─────────────────────────────────────────────────── */
  {
    slug: "railay-beach",
    lang: "both",
    title: "Excursion Railay Beach depuis Ao Nang | Tour Privé Krabi | Amon Tour",
    metaDescription:
      "Excursion Railay Beach depuis Ao Nang en longtail privé. Phra Nang Cave Beach, escalade, lagoon hike. Guide bilingue, demi-journée ou journée. Réservez sur WhatsApp.",
    h1: "Excursion Railay Beach depuis Ao Nang | Tour Privé Krabi — Amon Tour",
    intro:
      "Railay Beach est souvent désignée comme l'une des plus belles plages d'Asie — et elle se mérite : accessible uniquement par bateau (pas de route), Railay est une presqu'île de calcaire coupée de la terre ferme par des falaises vertigineuses. Elle concentre plusieurs des plus belles plages et formations rocheuses de Thaïlande en moins de 2 kilomètres de côte.",
    sections: [
      {
        heading: "Comment accéder à Railay Beach depuis Krabi",
        content: `<p>Railay est une presqu'île — mais ses falaises sont si hautes et si escarpées que personne ne les traverse à pied. L'unique accès est maritime, en <strong>longtail boat</strong> depuis Ao Nang (15 minutes) ou depuis Krabi Town (45 minutes).</p>
<p>Avec Amon Tour, nous organisons un longtail boat privé depuis Ao Nang Beach. Vous embarquez directement et arrivez à Railay sans partager votre embarcation avec d'autres voyageurs.</p>
<p>Les longtails publics depuis Ao Nang coûtent une centaine de bahts par personne et partent quand ils sont pleins — vous attendez parfois 30 à 45 minutes. En privé, vous partez quand vous le souhaitez.</p>`,
      },
      {
        heading: "East Railay vs West Railay : laquelle choisir ?",
        content: `<p><strong>West Railay</strong> est la plage principale, avec ses eaux calmes, ses chaises longues et ses hôtels de charme accrochés aux falaises. C'est là qu'arrivent la plupart des bateaux. La plage est magnifique, avec une eau turquoise peu profonde, idéale pour se baigner et se détendre.</p>
<p><strong>East Railay</strong> est plus sauvage et moins touristique. Les eaux y sont peu profondes à marée basse (mangroves) et moins propices à la baignade, mais c'est le point de départ du sentier vers <strong>Phra Nang Cave Beach</strong>, la plage la plus spectaculaire de la zone.</p>
<p><strong>Phra Nang Cave Beach</strong> (souvent classée dans les "10 plus belles plages d'Asie") est un croissant de sable blanc coincé entre deux falaises calcaires gigantesques. Une grotte marine à l'un des bouts abrite un sanctuaire dédié à une princesse de la mer — les pêcheurs locaux y déposent des offrandes (dont de nombreux phallus en bois, symbolisant la fertilité — un étonnement garanti pour les visiteurs non avertis).</p>`,
      },
      {
        heading: "Escalade à Railay : l'une des meilleures destinations de Thaïlande",
        content: `<p>Railay est internationalement reconnue comme l'une des meilleures destinations d'escalade en plein air d'Asie du Sud-Est. Des centaines de voies balisées sur les falaises calcaires, pour tous les niveaux du grand débutant à l'alpiniste confirmé. De nombreuses école d'escalade basées à Railay proposent des cours à la journée avec guide et équipement.</p>
<p>Si vous êtes intéressés, nous pouvons intégrer une demi-journée d'initiation à l'escalade dans votre programme Railay. Idéal pour les adolescents et les adultes sportifs.</p>`,
      },
      {
        heading: "Le lagoon hike : randonnée vers le lagon caché de Railay",
        content: `<p>Depuis East Railay, un sentier de randonnée relativement intense (30 minutes, corde et racines pour grimper) mène à un <strong>lagon intérieur</strong> entouré de falaises. L'eau y est stagnante (on n'y nage pas) mais la vue depuis le bord — encastré dans la paroi calcaire — est une récompense mémorable.</p>
<p>La montée est glissante (surtout après la pluie) et requiert une certaine forme physique. Évitez les tongs — des chaussures fermées ou des sandales à grip sont indispensables. Ce sentier est déconseillé aux enfants de moins de 10 ans et aux personnes à mobilité réduite.</p>`,
      },
      {
        heading: "Railay en demi-journée ou en journée complète ?",
        content: `<p><strong>Demi-journée (4-5h) :</strong> West Railay, Phra Nang Cave Beach, baignade. Convient à tous les profils, y compris les familles avec jeunes enfants ou les personnes qui ne souhaitent pas marcher beaucoup.</p>
<p><strong>Journée complète (7-8h) :</strong> Railay + lagoon hike + escalade initiation + déjeuner sur place + Koh Poda ou Chicken Island en fin de journée. Programme sportif, idéal pour les voyageurs actifs.</p>
<p>Contactez-nous pour construire un programme adapté à votre groupe : <a href="https://wa.me/${WA}">WhatsApp</a> ou <a href="/contact">formulaire de contact</a>.</p>`,
      },
    ],
    faq: [
      {
        question: "Comment accéder à Railay Beach ?",
        answer:
          "Railay est accessible uniquement par bateau — pas de route, ses falaises coupent la presqu'île de la terre ferme. Depuis Ao Nang : longtail boat en 15 minutes. Depuis Krabi Town : 45 minutes. Amon Tour organise des longtails privés depuis Ao Nang.",
      },
      {
        question: "Railay Beach est-elle très touristique ?",
        answer:
          "West Railay et Phra Nang Cave Beach sont fréquentées, surtout en haute saison (novembre-avril). East Railay et le lagoon restent nettement plus tranquilles. En partant tôt le matin (avant 9h), on profite des plages avant l'afflux de la mi-journée.",
      },
      {
        question: "Peut-on combiner Railay et d'autres îles en une journée ?",
        answer:
          "Oui. Une formule journée complète peut combiner Railay Beach, Phra Nang Cave Beach et une île voisine (Koh Poda ou Chicken Island). Prévoir 7-8 heures. Nous adaptons le programme à votre groupe.",
      },
      {
        question: "L'escalade à Railay est-elle adaptée aux débutants ?",
        answer:
          "Oui — de nombreuses voies à Railay sont accessibles aux débutants complets, avec des écoles sur place proposant des cours avec guide et matériel fourni. Nous pouvons intégrer une initiation à votre programme.",
      },
    ],
    relatedSlugs: ["koh-phi-phi", "catamaran-krabi", "agence-francophone-krabi"],
    schema: {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: "Excursion Railay Beach depuis Ao Nang",
      description:
        "Excursion privée en longtail boat depuis Ao Nang vers Railay Beach. Phra Nang Cave Beach, escalade, lagoon hike. Guide bilingue FR/EN. Demi-journée ou journée complète.",
      url: `${BASE_URL}/destinations/railay-beach`,
      provider: { "@type": "TravelAgency", name: "Amon Tour", url: BASE_URL },
      touristType: ["Family", "Couple", "Adventure", "Sport"],
      geo: { "@type": "GeoCoordinates", latitude: 8.0068, longitude: 98.837 },
    },
    tripSchema: {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: "Excursion Railay Beach depuis Ao Nang",
      description:
        "Excursion privée en longtail boat depuis Ao Nang vers Railay Beach. Phra Nang Cave Beach, escalade, lagoon hike. Guide bilingue FR/EN. Demi-journée ou journée complète.",
      url: `${BASE_URL}/destinations/railay-beach`,
      provider: { "@type": "TravelAgency", name: "Amon Tour", url: BASE_URL },
      touristType: ["Family", "Couple", "Adventure", "Sport"],
      geo: { "@type": "GeoCoordinates", latitude: 8.0068, longitude: 98.837 },
    },
  },
];

/* ──────────────────────────────────────────────────────────────────────────
 * Helper: lookup map by slug
 * ────────────────────────────────────────────────────────────────────────── */

const BY_SLUG = new Map<string, Destination>(DESTINATIONS.map((d) => [d.slug, d]));

/* ──────────────────────────────────────────────────────────────────────────
 * HTML generators
 * ────────────────────────────────────────────────────────────────────────── */

function renderSections(sections: DestinationSection[]): string {
  return sections
    .map(
      (s) => `
    <section class="section">
      <h2>${escapeHtml(s.heading)}</h2>
      ${s.content}
    </section>`
    )
    .join("");
}

function renderFaq(faq: DestinationFaq[]): string {
  const items = faq
    .map(
      (f) => `
    <div class="faq-item">
      <h3>${escapeHtml(f.question)}</h3>
      <p>${escapeHtml(f.answer)}</p>
    </div>`
    )
    .join("");
  return `
    <section class="section">
      <h2>Questions fréquentes</h2>
      <div class="faq">${items}</div>
    </section>`;
}

function renderRelated(slugs: string[], currentSlug: string): string {
  const items = slugs
    .filter((s) => s !== currentSlug)
    .map((s) => {
      const dest = BY_SLUG.get(s);
      if (!dest) return "";
      return `<a href="/destinations/${escapeAttr(s)}">${escapeHtml(dest.h1)}</a>`;
    })
    .filter(Boolean)
    .join("");
  if (!items) return "";
  return `
    <section class="section">
      <h2>Autres destinations</h2>
      <div class="related-list">${items}</div>
    </section>`;
}

function faqSchema(faq: DestinationFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

function breadcrumbSchema(dest: Destination) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Destinations", item: `${BASE_URL}/destinations` },
      {
        "@type": "ListItem",
        position: 3,
        name: dest.h1,
        item: `${BASE_URL}/destinations/${dest.slug}`,
      },
    ],
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Hub page handler
 * ────────────────────────────────────────────────────────────────────────── */

function ssrDestinationsHub(_req: Request, res: Response) {
  const cards = DESTINATIONS.map(
    (d) => `
    <article class="card">
      <div class="card-img" style="background:linear-gradient(135deg,#084F6E,#063A52);display:flex;align-items:center;justify-content:center">
        <span style="color:#E6B64C;font-family:'Poppins',sans-serif;font-size:1.3rem;font-weight:600;text-align:center;padding:1rem">${escapeHtml(d.h1)}</span>
      </div>
      <div class="card-body">
        <h2 class="card-title"><a href="/destinations/${escapeAttr(d.slug)}">${escapeHtml(d.h1)}</a></h2>
        <p class="card-desc">${escapeHtml(d.intro.slice(0, 180))}…</p>
        <a class="card-cta" href="/destinations/${escapeAttr(d.slug)}">Découvrir →</a>
      </div>
    </article>`
  ).join("");

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Destinations Amon Tour Krabi",
    itemListElement: DESTINATIONS.map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: d.tripSchema,
    })),
  };

  const bodyHtml = `
    <p class="intro">Depuis notre base à Ao Nang, Krabi, Amon Tour couvre les destinations les plus spectaculaires du sud de la Thaïlande. Chaque page ci-dessous détaille nos offres, les meilleurs conseils pratiques et ce qu'on ne trouve pas ailleurs.</p>
    <div class="card-grid">${cards}</div>
    <div class="cta-row">
      <a class="btn btn-primary" href="/custom-tour">Planifier un voyage sur mesure</a>
      <a class="btn btn-gold" href="https://wa.me/${WA}" rel="noopener" target="_blank">Nous écrire sur WhatsApp</a>
    </div>`;

  const html = ssrHtmlShell({
    title: "Destinations & Excursions Privées à Krabi | Amon Tour",
    description:
      "Découvrez toutes les destinations couvertes par Amon Tour depuis Krabi : Koh Phi Phi, Phang Nga Bay, Railay Beach, bivouac Thalane, catamaran privatif, agence francophone. Tours privés avec guides bilingues.",
    path: "/destinations",
    h1: "Nos destinations à Krabi et en Thaïlande du Sud",
    lang: "fr",
    bodyHtml,
    breadcrumbs: [{ label: "Home", url: "/" }, { label: "Destinations" }],
    schemaJsons: [
      itemListSchema,
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Destinations", item: `${BASE_URL}/destinations` },
        ],
      },
    ],
  });
  sendSsrHtml(res, html);
}

/* ──────────────────────────────────────────────────────────────────────────
 * Individual destination handler
 * ────────────────────────────────────────────────────────────────────────── */

function ssrDestinationPage(req: Request, res: Response) {
  const { slug } = req.params;
  const dest = BY_SLUG.get(slug);

  if (!dest) {
    const html = ssrHtmlShell({
      title: "Destination introuvable | Amon Tour",
      description: "Cette page de destination n'existe pas. Découvrez toutes nos destinations depuis Krabi.",
      path: `/destinations/${slug}`,
      h1: "Destination introuvable",
      bodyHtml: `<p>Cette destination n'existe pas. <a href="/destinations">Voir toutes nos destinations</a> ou <a href="/contact">nous contacter</a>.</p>`,
    });
    return sendSsrHtml(res, html, 404);
  }

  const bodyHtml = `
    <p class="intro">${escapeHtml(dest.intro)}</p>
    ${renderSections(dest.sections)}
    ${renderFaq(dest.faq)}
    <section class="section">
      <h2>Réserver cette excursion</h2>
      <p>Contactez-nous directement — nous répondons généralement en moins d'une heure sur WhatsApp entre 8h et 21h (heure thaïlandaise).</p>
      <div class="cta-row">
        <a class="btn btn-gold" href="https://wa.me/${WA}?text=${encodeURIComponent(`Bonjour Amon Tour, je suis intéressé(e) par : ${dest.h1}`)}" rel="noopener" target="_blank">WhatsApp (recommandé)</a>
        <a class="btn btn-primary" href="/custom-tour">Demande sur mesure</a>
        <a class="btn btn-primary" href="/contact">Formulaire de contact</a>
      </div>
    </section>
    ${renderRelated(dest.relatedSlugs, dest.slug)}`;

  const html = ssrHtmlShell({
    title: dest.title,
    description: dest.metaDescription,
    path: `/destinations/${dest.slug}`,
    h1: dest.h1,
    lang: dest.lang === "en" ? "en" : "fr",
    bodyHtml,
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Destinations", url: "/destinations" },
      { label: dest.h1 },
    ],
    schemaJsons: [dest.schema, dest.tripSchema, faqSchema(dest.faq), breadcrumbSchema(dest)],
  });
  sendSsrHtml(res, html);
}

/* ──────────────────────────────────────────────────────────────────────────
 * Export slugs for sitemap generation
 * ────────────────────────────────────────────────────────────────────────── */

export const DESTINATION_SLUGS = DESTINATIONS.map((d) => d.slug);

/* ──────────────────────────────────────────────────────────────────────────
 * Route registration
 * ────────────────────────────────────────────────────────────────────────── */

export function registerDestinationRoutes(app: Express): void {
  // Destination landing pages are pure SSR HTML — served to ALL visitors,
  // not just bots. These pages have no SPA counterpart, so all users need
  // the server-rendered HTML (bots for indexing, humans for conversion).
  app.get("/destinations", ssrDestinationsHub);
  app.get("/destinations/:slug", ssrDestinationPage);
}
