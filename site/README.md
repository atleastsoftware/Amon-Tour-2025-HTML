# Générateur statique Amon Tour

Le générateur transforme le contenu versionné de `content/` en HTML statique.

```sh
npx tsx site/src/cli.ts validate
npx tsx site/src/cli.ts build --out site/dist
npx tsx --test site/tests/*.test.ts
```

## Exceptions de comparaison SEO

Les routes `/about`, `/privacy-policy`, `/terms-conditions`, `/legal-notice` et
`/tour-ninja-iframe` n'avaient pas de rendu SSR historique. L'instantané de
référence contient donc pour elles les métadonnées, le H1 et les données
structurées de la coquille SPA générique, sans URL canonique ni `hreflang`.

Le générateur conserve volontairement les métadonnées propres au contenu des
pages légales et de la page « À propos », ainsi que les métadonnées utilitaires
de l'iframe Tour Ninja. Il ajoute aussi une URL canonique et les `hreflang`
cohérents avec le reste du site. Conformément à la production historique,
toutes ces pages restent en `index, follow`. Ces écarts sont les seules
exceptions attendues par rapport à l'instantané.