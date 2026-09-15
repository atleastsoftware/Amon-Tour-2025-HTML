# Médias

Les fichiers médias sont versionnés dans le dépôt :

- `/uploads/**` — images téléversées via l'ancien back-office (surcharges d'images Tour Ninja, médiathèque)
- `/attached_assets/**` — images/vidéos référencées par les pages, le blog et les paramètres
- `/media/uploads/**` — nouveaux médias envoyés via le MCP (`media_upload`)

`manifest.json` liste chaque fichier référencé (chemin, taille, sha256, source). Il est régénéré par `scripts/migration/export-content.ts` et mis à jour par le MCP à chaque upload.
