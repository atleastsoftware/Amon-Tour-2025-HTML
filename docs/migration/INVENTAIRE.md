# Inventaire de migration — 2026-09-15

Source : `postgresql://***@ep-billowing-moon-a67uc5ci.us-west-2.aws.neon.tech/neondb?sslmode=require` (lecture seule). Archive : `exports/archive/2026-09-15/`.

## Comptages par table (base de données → export)

| Table | Lignes en base | Lignes archivées | Destination Git |
|---|---:|---:|---|
| block_templates | 1 | 1 | content/block-templates.json |
| blog_categories | 12 | 12 | content/blog/categories.json |
| blog_post_tags | 13 | 13 | front-matter `tags` |
| blog_posts | 21 | 21 | content/blog/posts/*.md |
| blog_tags | 42 | 42 | content/blog/tags.json |
| contact_messages | 0 | 0 | archive JSON (transactionnel) |
| content_blocks | 5 | 5 | content/content-blocks.json |
| cruise_requests | 3 | 3 | archive JSON (transactionnel) |
| custom_form_submissions | 0 | 0 | archive JSON (transactionnel) |
| custom_forms | 4 | 4 | content/forms/*.json |
| custom_tour_requests | 86 | 86 | archive JSON (transactionnel) |
| group_requests | 2 | 2 | archive JSON (transactionnel) |
| krabi_celebration_requests | 1 | 1 | archive JSON (transactionnel) |
| media_library | 0 | 0 | media/manifest.json |
| navigation_menu_items | 6 | 6 | content/navigation.json |
| newsletter_subscriptions | 12 | 12 | archive JSON (transactionnel) |
| page_block_history | 0 | 0 | archive (historique) |
| page_blocks | 32 | 32 | content/pages/*.json (sections) |
| page_configurations | 15 | 15 | content/pages/*.json |
| partnership_requests | 1 | 1 | archive JSON (transactionnel) |
| reservations | 0 | 0 | archive JSON (transactionnel) |
| session | 0 | — | — (sessions volatiles) |
| site_settings | 27 | 27 | content/theme.json + footer.json + announcements.json + site.json |
| static_pages | 3 | 3 | content/static-pages/*.md |
| tour_availability | 0 | 0 | archive JSON (transactionnel) |
| tour_cards | 0 | 0 | archive |
| tour_ninja_image_overrides | 20 | 20 | content/tour-ninja/image-overrides.json |
| tours | 3 | 3 | content/tour-ninja/legacy-tours.json |
| users | 2 | 2 | archive JSON (transactionnel) |

## Comptages du modèle de contenu généré

| Élément | Nombre |
|---|---:|
| pages (content/pages) | 15 |
| sections (all pages) | 32 |
| orphan blocks archived | 0 |
| destinations | 8 |
| static pages | 3 |
| blog posts | 21 |
| blog categories | 12 |
| blog tags | 42 |
| blog post-tag links | 13 |
| forms | 4 |
| image overrides | 20 |
| legacy tours | 3 |
| content blocks | 5 |
| block templates | 1 |
| navigation items | 6 |
| site settings (theme.legacySettings) | 27 |
| media manifest items | 96 |
| media references missing on disk | 18 |
| translation catalogs | 3 |

## Vérifications

- page_configurations 15 → pages 15 ✅
- page_blocks 32 → sections 32 + orphelins 0 ✅
- blog_posts 21 → 21 ✅
- blog_post_tags 13 → 13 ✅
- static_pages 3 → 3 ✅
- custom_forms 4 → 4 ✅
- tour_ninja_image_overrides 20 → 20 ✅
- navigation_menu_items 6 → 6 ✅
- site_settings 27 → 27 ✅
- Références médias introuvables sur disque : 18
  - /attached_assets/logo.png
  - /attached_assets/LINE_ALBUM_Ra
  - /uploads/tours/tour-1760929240349-56976068.jpeg
  - /uploads/tours/tour-1760929266359-501749605.jpeg
  - /uploads/tours/tour-1760929278097-106600375.jpeg
  - /uploads/tours/tour-1760929313648-788903007.jpeg
  - /uploads/tours/tour-1760929339881-886941480.jpeg
  - /uploads/tours/tour-1760929365217-561730994.jpeg
  - /uploads/tours/tour-1760929378364-502477095.jpeg
  - /uploads/tours/tour-1760929407926-274502123.jpg
  - /uploads/tours/tour-1760929423509-237548886.jpeg
  - /uploads/tours/tour-1760929443510-890370990.jpeg
  - /uploads/tours/tour-1760929457776-393138510.jpeg
  - /uploads/tours/tour-1760929481227-602964910.jpeg
  - /uploads/tours/tour-1760929497347-587275902.jpeg
  - /uploads/tours/tour-1760929539400-994955144.jpeg
  - /attached_assets/hero-bg.jpg
  - /attached_assets/about-img.jpg

> Note médias : les 14 fichiers `/uploads/tours/tour-17609292…` référencés par `tour_ninja_image_overrides` renvoient déjà la page 404 (HTML) sur https://amon-tour.com au moment de l'export — ils avaient été téléversés sur le système de fichiers éphémère du déploiement et n'ont jamais été versionnés. La migration n'introduit donc aucune perte : les enregistrements de surcharge sont conservés dans `content/tour-ninja/image-overrides.json` et peuvent être ré-alimentés via l'outil MCP `set_tour_image_override` + `upload_media`. `/attached_assets/logo.png`, `hero-bg.jpg`, `about-img.jpg` sont d'anciennes références (`content_blocks`, paramètres legacy) non utilisées par le rendu actuel.

Les tables transactionnelles (demandes, messages, newsletter, réservations, soumissions) sont archivées en JSON dans `exports/archive/` et restent servies par le mini-backend `edge/` (routes `/api/sync/*`).
