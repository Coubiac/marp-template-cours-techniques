# AGENTS.md

Ce dépôt est un template Marp pour supports de cours techniques.

Avant de générer ou modifier des slides de cours, lire :

- `CLAUDE.md` pour les règles de travail sur le dépôt
- `docs/guide-ia.md` pour les règles de génération des supports de cours

Règles principales :

- Ne pas modifier directement `build/` ou `dist/`.
- Ne pas créer de vrai cours dans `examples/`.
- Placer les supports réels dans `slides/`.
- Placer les captures dans `assets/screenshots/`.
- Placer les schémas dans `assets/schemas/`.
- Utiliser uniquement les classes Marp existantes.
- Ne pas modifier `themes/coubiac.css` sauf demande explicite.
- Lancer `npm run render` après modification des sources.