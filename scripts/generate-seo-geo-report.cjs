const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(process.cwd(), "exports");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
const OUT = path.join(OUT_DIR, "Amon-Tour-Rapport-SEO-GEO-Cible.pdf");

const BLUE = "#1e73be";
const DARKBLUE = "#084F6E";
const GOLD = "#E6B64C";
const INK = "#1f2933";
const GREY = "#5b6770";
const LIGHT = "#f4f7fa";
const LINE = "#dde5ec";

const LOGO = path.join(process.cwd(), "attached_assets", "Logo Long Blue.png");
const TEAM = path.join(process.cwd(), "client", "public", "amon-tour-team.jpg");

const doc = new PDFDocument({ size: "A4", margin: 0, bufferPages: true });
doc.pipe(fs.createWriteStream(OUT));

const PW = 595.28; // A4 width pt
const PH = 841.89; // A4 height pt
const M = 56; // content margin
const CW = PW - M * 2; // content width

function fonts() {
  doc.registerFont("reg", "Helvetica");
  doc.registerFont("bold", "Helvetica-Bold");
  doc.registerFont("obl", "Helvetica-Oblique");
}
fonts();

let y = 0;

function ensure(space) {
  if (y + space > PH - 70) {
    footer();
    doc.addPage();
    y = M;
  }
}

function heading(num, txt) {
  ensure(54);
  y += 10;
  doc.save();
  doc.rect(M, y, 26, 26).fill(BLUE);
  doc.fillColor("#ffffff").font("bold").fontSize(13).text(num, M, y + 7, { width: 26, align: "center" });
  doc.restore();
  doc.fillColor(DARKBLUE).font("bold").fontSize(15).text(txt, M + 38, y + 5, { width: CW - 38 });
  y += 34;
  doc.moveTo(M, y).lineTo(M + CW, y).lineWidth(1).strokeColor(GOLD).stroke();
  y += 14;
}

function para(txt, opts = {}) {
  const size = opts.size || 10.5;
  const color = opts.color || INK;
  const font = opts.font || "reg";
  doc.font(font).fontSize(size).fillColor(color);
  const h = doc.heightOfString(txt, { width: CW, lineGap: 3 });
  ensure(h + 6);
  doc.text(txt, M, y, { width: CW, lineGap: 3, align: opts.align || "left" });
  y += h + (opts.gap !== undefined ? opts.gap : 9);
}

function bullet(txt, opts = {}) {
  const size = opts.size || 10.5;
  doc.font("reg").fontSize(size).fillColor(INK);
  const tw = CW - 18;
  const h = doc.heightOfString(txt, { width: tw, lineGap: 3 });
  ensure(h + 5);
  doc.circle(M + 4, y + 5.5, 2.2).fill(GOLD);
  doc.fillColor(INK).font("reg").fontSize(size).text(txt, M + 16, y, { width: tw, lineGap: 3 });
  y += h + 6;
}

function subhead(txt) {
  ensure(24);
  doc.font("bold").fontSize(11.5).fillColor(BLUE).text(txt, M, y);
  y += 18;
}

function table(headers, rows, widths) {
  const totalW = CW;
  const colW = widths.map((w) => (w / 100) * totalW);
  const rowPad = 6;

  function drawRow(cells, isHeader) {
    doc.font(isHeader ? "bold" : "reg").fontSize(9.5);
    let maxH = 0;
    cells.forEach((c, i) => {
      const h = doc.heightOfString(String(c), { width: colW[i] - rowPad * 2, lineGap: 2 });
      if (h > maxH) maxH = h;
    });
    const rowH = maxH + rowPad * 2;
    ensure(rowH);
    let x = M;
    if (isHeader) {
      doc.rect(M, y, totalW, rowH).fill(DARKBLUE);
    } else {
      doc.rect(M, y, totalW, rowH).fill("#ffffff");
      doc.rect(M, y, totalW, rowH).lineWidth(0.5).strokeColor(LINE).stroke();
    }
    cells.forEach((c, i) => {
      doc.fillColor(isHeader ? "#ffffff" : INK).font(isHeader ? "bold" : "reg").fontSize(9.5);
      doc.text(String(c), x + rowPad, y + rowPad, { width: colW[i] - rowPad * 2, lineGap: 2 });
      x += colW[i];
    });
    y += rowH;
  }
  drawRow(headers, true);
  rows.forEach((r) => drawRow(r, false));
  y += 10;
}

function statCard(x, w, big, label) {
  const h = 58;
  doc.roundedRect(x, y, w, h, 6).fill(LIGHT);
  doc.roundedRect(x, y, w, h, 6).lineWidth(0.6).strokeColor(LINE).stroke();
  doc.fillColor(BLUE).font("bold").fontSize(22).text(big, x, y + 9, { width: w, align: "center" });
  doc.fillColor(GREY).font("reg").fontSize(8.5).text(label, x + 8, y + 37, { width: w - 16, align: "center" });
}

let pageNum = 0;
function footer() {
  const b = PH - 42;
  doc.moveTo(M, b).lineTo(M + CW, b).lineWidth(0.5).strokeColor(LINE).stroke();
  doc.font("reg").fontSize(8).fillColor(GREY);
  doc.text("Amon Tour — Rapport SEO & GEO", M, b + 8, { width: CW / 2, align: "left" });
  doc.text("amon-tour.com", M + CW / 2, b + 8, { width: CW / 2, align: "right" });
}

/* ============ COVER ============ */
doc.rect(0, 0, PW, PH).fill("#ffffff");
doc.rect(0, 0, PW, 8).fill(GOLD);
doc.rect(0, 0, 8, PH).fill(BLUE);

try { doc.image(LOGO, M, 70, { width: 230 }); } catch (e) {}

doc.fillColor(DARKBLUE).font("bold").fontSize(30).text("Rapport Stratégique", M, 200, { width: CW });
doc.fillColor(BLUE).font("bold").fontSize(30).text("SEO & GEO", M, 236, { width: CW });
doc.moveTo(M, 286).lineTo(M + 90, 286).lineWidth(3).strokeColor(GOLD).stroke();

doc.fillColor(INK).font("reg").fontSize(14).text(
  "La cible atteinte grâce à l'optimisation pour les moteurs de recherche et les moteurs de réponse par IA",
  M, 304, { width: CW - 40, lineGap: 4 }
);

try {
  doc.save();
  doc.roundedRect(M, 380, CW, 250, 10).clip();
  doc.image(TEAM, M, 360, { width: CW });
  doc.restore();
  doc.roundedRect(M, 380, CW, 250, 10).lineWidth(1).strokeColor(LINE).stroke();
} catch (e) {}

doc.fillColor(GREY).font("reg").fontSize(10).text(
  "Document préparé pour Amon Tour — Agence de voyage francophone à Krabi, Thaïlande",
  M, 660, { width: CW }
);
const today = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
doc.fillColor(DARKBLUE).font("bold").fontSize(10).text("Date : " + today, M, 678, { width: CW });
doc.fillColor(GREY).font("reg").fontSize(9).text("Domaine analysé : amon-tour.com  ·  Marchés cibles : Malaisie · Singapour · Chine · Australie · Voyageurs francophones", M, 700, { width: CW, lineGap: 3 });

/* ============ CONTENT ============ */
doc.addPage();
y = M;

// Intro band
doc.roundedRect(M, y, CW, 70, 8).fill(LIGHT);
doc.fillColor(DARKBLUE).font("bold").fontSize(12).text("En bref", M + 16, y + 12);
doc.fillColor(INK).font("reg").fontSize(10).text(
  "Ce rapport décrit la cible (marchés et profils de voyageurs) qu'Amon Tour atteint grâce au travail SEO (référencement Google/Bing) et GEO (visibilité dans les réponses des IA comme ChatGPT, Perplexity et Claude). Il présente les marchés visés, les leviers techniques mis en place et les profils de clients touchés.",
  M + 16, y + 30, { width: CW - 32, lineGap: 3 }
);
y += 88;

// Key figures
subhead("Chiffres clés du dispositif");
const gap = 14;
const cw3 = (CW - gap * 3) / 4;
statCard(M, cw3, "11", "langues déclarées (hreflang)");
statCard(M + (cw3 + gap), cw3, "14", "robots IA reconnus (GEO)");
statCard(M + (cw3 + gap) * 2, cw3, "48", "URLs dans le sitemap");
statCard(M + (cw3 + gap) * 3, cw3, "19", "pages rendues pour les robots");
y += 58 + 16;

// ===== Ce qui a été réalisé =====
ensure(40);
doc.roundedRect(M, y, CW, 22, 5).fill(BLUE);
doc.fillColor("#ffffff").font("bold").fontSize(10.5).text("CE QUI A ÉTÉ RÉALISÉ", M + 12, y + 6);
y += 32;
para("Au-delà de l'audit, les optimisations suivantes ont été mises en ligne sur amon-tour.com :");
bullet("Deux nouvelles pages « séjour famille personnalisé » créées et publiées : une version française (/destinations/sejour-famille-personnalise-thailande) et une version anglaise (/destinations/family-tailor-made-trip-thailand).");
bullet("Chaque page contient ~1 700 à 1 850 mots de contenu réel : réponse directe pour les IA, 6 sections, 6 questions/réponses (FAQ), un exemple d'itinéraire famille sur 8 jours et la mise en avant du catamaran privatif.");
bullet("Données structurées complètes sur les deux pages : TouristTrip (type « Famille »), FAQPage et BreadcrumbList — le format que Google et les IA citent le plus volontiers.");
bullet("Affichage adapté à la langue : la page anglaise s'affiche entièrement en anglais (titres, FAQ, boutons, message WhatsApp), la française reste en français.");
bullet("Maillage interne : liens vers catamaran, Koh Phi Phi, Phang Nga Bay et la page agence francophone, pour renforcer tout le référencement.");
bullet("Les deux pages sont déjà dans le sitemap (priorité 0.9) et listées sur la page hub /destinations — prêtes à être indexées par Google et les IA.");

heading("1", "La cible stratégique");
para("La stratégie SEO/GEO d'Amon Tour vise des voyageurs internationaux susceptibles de réserver des excursions privées à Krabi et dans le sud de la Thaïlande. Deux grands axes structurent cette cible :");
subhead("Axe géographique — 4 marchés prioritaires + francophonie");
bullet("Malaisie : proximité régionale, fort trafic vers la Thaïlande, voyageurs musulmans recherchant des prestations adaptées (halal, intimité).");
bullet("Singapour : pouvoir d'achat élevé, courts séjours premium, sensibilité aux expériences privées et haut de gamme.");
bullet("Chine : marché de volume, recherche d'excursions guidées et de destinations emblématiques (Phi Phi, James Bond Island).");
bullet("Australie : longs séjours, voyageurs aventureux, forte affinité avec les activités nautiques et nature (Railay, catamaran, kayak).");
bullet("Voyageurs francophones (France, Belgique, Suisse, Canada, Réunion, Nouvelle-Calédonie) : cœur historique de l'agence, atout différenciant « guides francophones depuis 2013 ».");
subhead("Axe profils — intention de réservation");
para("Le contenu cible des intentions concrètes : « tour privé », « excursion depuis Krabi », « agence francophone », « catamaran privatif », « bivouac kayak ». Ces requêtes traduisent une intention d'achat élevée, et non une simple recherche d'information.");

// Highlighted new segment
ensure(150);
doc.roundedRect(M, y, CW, 22, 5).fill(GOLD);
doc.fillColor(DARKBLUE).font("bold").fontSize(10.5).text("NOUVEAU SEGMENT PRIORITAIRE", M + 12, y + 6);
y += 32;
subhead("Familles en quête de séjours personnalisés (francophones & anglophones)");
para("Cible à fort potentiel : des familles qui ne cherchent pas une excursion standard, mais un séjour sur mesure adapté à leur rythme, à l'âge des enfants et à leurs envies. Elles privilégient un interlocuteur dans leur langue (français ou anglais) et un programme construit avec elles.");
bullet("Besoin clé : un séjour personnalisé (durée, activités, hébergement, transport privé) plutôt qu'un produit figé.");
bullet("Sensibilités : sécurité des enfants, confort, flexibilité du planning, guide qui parle leur langue.");
bullet("Double langue : familles francophones (France, Belgique, Suisse, Canada, Réunion) ET familles anglophones (Malaisie, Singapour, Australie, expatriés).");
bullet("Levier sur le site : formulaire « tour sur mesure » (custom-tour) + mise en avant explicite de l'accompagnement familial bilingue.");

heading("2", "Comment le SEO atteint cette cible");
para("Le référencement classique permet d'apparaître dans Google et Bing pour les recherches des marchés visés. Les leviers en place :");
bullet("Balises hreflang (11 langues) : indiquent à Google quelle version servir selon le pays/la langue de l'internaute — essentiel pour MY, SG, CN, AU et la francophonie.");
bullet("Pages destinations dédiées : 8 pages ciblées mots-clés (Koh Phi Phi, Phang Nga Bay, Railay, catamaran, bivouac Thalane, agence francophone + séjour famille FR et family tailor-made EN) avec ~1 400 à 1 850 mots chacune.");
bullet("Données structurées (Schema.org) : TravelAgency, TouristTrip, FAQPage, BreadcrumbList — Google comprend la nature des pages et peut afficher des résultats enrichis.");
bullet("Sitemap complet (48 URLs) + robots.txt propre : tout le contenu utile est exploré, l'administration est protégée.");
bullet("Rendu serveur (SSR) pour les robots : 19 pages renvoient un HTML complet aux moteurs au lieu d'une page vide — indispensable pour un site React.");

heading("3", "Comment le GEO atteint cette cible");
para("Le GEO (Generative Engine Optimization) vise la visibilité dans les réponses générées par les IA, un canal de recherche en forte croissance. Quand un voyageur demande à ChatGPT « meilleure agence francophone à Krabi », l'objectif est qu'Amon Tour soit cité.");
subhead("Robots d'IA explicitement accueillis");
table(
  ["Fournisseur IA", "Robots reconnus"],
  [
    ["OpenAI (ChatGPT / SearchGPT)", "GPTBot, ChatGPT-User, OAI-SearchBot"],
    ["Anthropic (Claude)", "ClaudeBot, anthropic-ai"],
    ["Perplexity", "PerplexityBot"],
    ["Autres", "You.com, Cohere, Amazon, Meta AI, ByteDance, Diffbot…"],
  ],
  [38, 62]
);
bullet("Ces robots reçoivent le contenu complet de chaque page (vérifié en test réel).");
bullet("Les blocs FAQ structurés (FAQPage) sont le format que les IA citent le plus volontiers dans leurs réponses.");
bullet("Le contenu factuel et daté (« depuis 2013 », lieux précis, durées) renforce la fiabilité perçue par les IA.");

heading("4", "Mots-clés et intentions ciblés");
table(
  ["Marché / profil", "Exemples de requêtes ciblées", "Page d'atterrissage"],
  [
    ["Francophones", "agence francophone Krabi, guide français Krabi", "/destinations/agence-francophone-krabi"],
    ["Tous marchés", "tour privé Koh Phi Phi, Maya Bay depuis Krabi", "/destinations/koh-phi-phi"],
    ["Tous marchés", "excursion Phang Nga Bay, James Bond Island", "/destinations/phang-nga-bay"],
    ["AU / premium", "catamaran privatif Krabi, location bateau", "/destinations/catamaran-krabi"],
    ["Aventure", "bivouac kayak Thalane, nuit nature Phang Nga", "/destinations/thalane-bivouac"],
    ["Tous marchés", "Railay Beach depuis Ao Nang, escalade", "/destinations/railay-beach"],
    ["Familles (FR)", "séjour famille personnalisé Thaïlande, voyage sur mesure enfants, hors tourisme de masse", "/destinations/sejour-famille-personnalise-thailande"],
    ["Familles (EN)", "tailor-made family trip Thailand, personalized family holiday Krabi", "/destinations/family-tailor-made-trip-thailand"],
  ],
  [22, 44, 34]
);

heading("5", "Profils de voyageurs touchés (personas)");
subhead("• Le couple premium (Singapour / Australie)");
para("Court séjour, budget confortable, cherche une expérience privée et intime (catamaran, coucher de soleil). Touché via les pages catamaran et les requêtes « privatif / private ».", { gap: 6 });
subhead("• La famille régionale (Malaisie)");
para("Voyage en groupe familial, sensible au confort, à la sécurité et aux prestations adaptées. Touché via les pages Phi Phi / Phang Nga et la mise en avant de bateaux privés.", { gap: 6 });
subhead("• L'aventurier (Australie / francophonie)");
para("Recherche nature, kayak, escalade, expériences hors des sentiers battus. Touché via le bivouac Thalane et Railay.", { gap: 6 });
subhead("• Le voyageur francophone fidèle");
para("Valorise un accompagnement dans sa langue. Touché via le positionnement « agence francophone depuis 2013 », différenciant face aux concurrents anglophones.", { gap: 6 });
subhead("• La famille en quête d'un séjour personnalisé (FR & EN)");
para("Parents voyageant avec enfants, qui veulent un programme sur mesure et un accompagnement dans leur langue (français ou anglais). Recherchent flexibilité, sécurité et confort. Touchés via le formulaire « tour sur mesure » et les deux pages dédiées « séjour famille personnalisé » désormais en ligne (FR et EN), avec une FAQ répondant à leurs questions concrètes (âge des enfants, gilets, rythme adapté, catamaran privatif).", { gap: 6 });

// GEO callout — target prompts for the family segment
ensure(110);
doc.roundedRect(M, y, CW, 96, 8).fill(LIGHT);
doc.fillColor(DARKBLUE).font("bold").fontSize(10.5).text("Prompts IA ciblés (GEO) pour le segment familles", M + 14, y + 12);
doc.fillColor(INK).font("reg").fontSize(9.5).text(
  "Pour être cité par ChatGPT, Perplexity ou Google AI Overviews, le contenu doit répondre directement à des questions comme :",
  M + 14, y + 30, { width: CW - 28, lineGap: 2 }
);
doc.fillColor(BLUE).font("obl").fontSize(9.5).text(
  "« agence francophone pour voyage en famille à Krabi »  ·  « best family-friendly private tours in Krabi »  ·  « séjour sur mesure Thaïlande avec enfants »  ·  « tailor-made family holiday Krabi with English guide »",
  M + 14, y + 56, { width: CW - 28, lineGap: 3 }
);
y += 96 + 12;

heading("6", "Indicateurs à suivre (KPIs)");
bullet("Positions Google par marché (via Search Console — filtrer par pays : MY, SG, CN, AU).");
bullet("Trafic organique par langue et par page destination.");
bullet("Apparitions / citations dans les réponses IA (ChatGPT, Perplexity) sur les requêtes de marque et génériques.");
bullet("Taux de clic (CTR) des pages destinations et fiches tours.");
bullet("Demandes de contact / WhatsApp issues du trafic organique.");

heading("7", "Recommandations prioritaires");
table(
  ["Action", "Bénéfice", "Priorité"],
  [
    ["Rétablir le service Tour Ninja (catalogue de tours)", "Les vraies excursions redeviennent visibles pour Google et les IA", "Haute"],
    ["Raccourcir la meta description de l'accueil (240 → 155 car.)", "Affichage complet dans les résultats Google", "Moyenne"],
    ["Unifier les routes de fiches tours (éviter le doublon)", "Évite le contenu dupliqué", "Moyenne"],
    ["Ajouter des pages destinations en anglais (/en/…)", "Capter MY, SG, AU en anglais", "Moyenne"],
    ["✓ Créer une page « séjour famille personnalisé » (FR + EN)", "RÉALISÉ — segment familles sur mesure désormais couvert (2 pages en ligne)", "Fait"],
    ["Renseigner les tarifs sur les pages familles", "Lever le dernier point « [à insérer] » et rassurer les prospects", "Moyenne"],
    ["Soumettre le sitemap dans Google Search Console", "Indexation plus rapide des nouvelles pages", "Haute"],
  ],
  [40, 42, 18]
);

para(" ");
doc.roundedRect(M, y, CW, 64, 8).fill(DARKBLUE);
doc.fillColor("#ffffff").font("bold").fontSize(12).text("Conclusion", M + 16, y + 12);
doc.fillColor("#eaf2f8").font("reg").fontSize(9.5).text(
  "Le dispositif technique SEO/GEO d'Amon Tour est solide et bien aligné sur ses marchés cibles (MY, SG, CN, AU + francophonie). La priorité immédiate est de rétablir la source des tours (Tour Ninja) pour que ce socle déploie tout son potentiel, suivie de l'extension du contenu en anglais.",
  M + 16, y + 32, { width: CW - 32, lineGap: 3 }
);
y += 80;

// finalize footers on all pages except cover
const range = doc.bufferedPageRange();
for (let i = 1; i < range.count; i++) {
  doc.switchToPage(i);
  const b = PH - 42;
  doc.moveTo(M, b).lineTo(M + CW, b).lineWidth(0.5).strokeColor(LINE).stroke();
  doc.font("Helvetica").fontSize(8).fillColor(GREY);
  doc.text("Amon Tour — Rapport SEO & GEO", M, b + 8, { width: CW / 2, align: "left" });
  doc.text("Page " + i + " / " + (range.count - 1), M + CW / 2, b + 8, { width: CW / 2, align: "right" });
}

doc.end();
console.log("PDF written to", OUT);
