# Template Marp pour supports de cours techniques

Ce mini projet fournit un thème Marp réutilisable pour créer des supports de cours techniques en Markdown, avec export HTML pour la projection et PDF pour les stagiaires.

Le style est volontairement sobre, lisible en projection, et adapté à des sujets comme Microsoft 365, Azure, réseau, sécurité, Terraform, AWS, Linux ou Windows Server.

## Arborescence

```text
.
|-- README.md
|-- package.json
|-- course.config.json
|-- .vscode/
|   `-- settings.json
|-- scripts/
|   `-- render.mjs
|-- themes/
|   `-- coubiac.css
|-- assets/
|   `-- brand/
|       |-- logo-principal.svg
|       `-- logo-compact.svg
|-- examples/
|   `-- template-demo.md
|-- build/
`-- dist/
```

## Installation

```bash
npm install
```

Le projet utilise `@marp-team/marp-cli`. Il est aussi compatible avec l'extension **Marp for VS Code** grâce au fichier `.vscode/settings.json`, qui déclare le thème `themes/coubiac.css` et autorise le HTML nécessaire aux grilles.

## Variables de cours

Les informations réutilisées dans les supports sont définies dans `course.config.json` :

```json
{
  "AUTHOR": "Coubiac",
  "COURSE_TITLE": "Administration Cloud et Infrastructure",
  "COURSE_SUBTITLE": "Parcours technique réutilisable...",
  "COURSE_CONTEXT": "Module 01 · Fondations techniques",
  "HEADER_CONTEXT": "{{COURSE_TITLE}} · {{COURSE_CONTEXT}}",
  "YEAR": "2026",
  "COPYRIGHT": "© {{YEAR}} {{AUTHOR}}. Tous droits réservés.",
  "FOOTER": "{{COURSE_TITLE}} | © {{YEAR}} {{AUTHOR}}"
}
```

Les variables s'utilisent dans les fichiers Markdown avec la syntaxe `{{VARIABLE}}` :

```markdown
# {{COURSE_TITLE}}

{{COURSE_SUBTITLE}}

Auteur : {{AUTHOR}}
```

Variables disponibles :

- `{{AUTHOR}}`
- `{{COURSE_TITLE}}`
- `{{COURSE_SUBTITLE}}`
- `{{COURSE_CONTEXT}}`
- `{{HEADER_CONTEXT}}`
- `{{YEAR}}`
- `{{COPYRIGHT}}`
- `{{FOOTER}}`

Le script `npm run render` génère les fichiers Markdown finaux dans `build/` à partir des sources de `examples/` et `slides/`, sans modifier les fichiers sources.

## Prévisualiser

```bash
npm run preview
```

La commande génère d'abord les fichiers Markdown dans `build/`, puis lance le serveur de prévisualisation Marp sur ce dossier.

## Exporter en HTML

```bash
npm run export:html
```

La commande génère `build/template-demo.md`, puis produit `dist/template-demo.html`.

## Exporter en PDF

```bash
npm run export:pdf
```

La commande génère `build/template-demo.md`, puis produit `dist/template-demo.pdf`.

## Tout exporter

```bash
npm run export:all
```

Cette commande produit les exports HTML et PDF.

## Ajouter un nouveau cours

1. Copier `examples/template-demo.md` vers un nouveau fichier, par exemple `examples/azure-admin.md`.
2. Adapter le front matter Marp :

```yaml
---
marp: true
theme: coubiac
size: 16:9
paginate: true
header: "{{HEADER_CONTEXT}}"
footer: "Nom du cours | Nom du module"
---
```

3. Remplacer les contenus d'exemple par les slides du cours.
4. Utiliser les variables `{{AUTHOR}}`, `{{COURSE_TITLE}}`, `{{COURSE_SUBTITLE}}`, `{{YEAR}}`, `{{COPYRIGHT}}` et `{{FOOTER}}` lorsque le contenu doit venir de `course.config.json`.
5. Placer les captures dans `assets/screenshots/` et les schémas dans `assets/schemas/`.
6. Générer les fichiers finaux :

```bash
npm run render
```

7. Exporter avec Marp CLI depuis `build/`, par exemple :

```bash
npx marp build/azure-admin.md --theme themes/coubiac.css --html --allow-local-files -o dist/azure-admin.html
npx marp build/azure-admin.md --theme themes/coubiac.css --pdf --allow-local-files -o dist/azure-admin.pdf
```

Pour utiliser le footer global défini dans `course.config.json`, écrire :

```yaml
footer: "{{FOOTER}}"
```

La couverture peut toujours masquer le header et le footer :

```markdown
<!-- _header: "" -->
<!-- _footer: "" -->
```

## Utiliser les gabarits

Chaque gabarit s'applique avec une classe Marp au début de la slide :

```markdown
<!-- _class: content -->

# Titre de la slide

Contenu de la slide.
```

### `cover`

Page de titre du cours. Le logo principal est affiché en bas à droite.

```markdown
<!-- _class: cover -->
<!-- _paginate: false -->
<!-- _footer: "" -->

# Titre du cours

Sous-titre ou contexte.
```

### `objectives`

Objectifs pédagogiques sous forme de liste lisible.

```markdown
<!-- _class: objectives -->

# Objectifs pédagogiques

- Comprendre le service.
- Configurer un environnement.
- Valider le fonctionnement.
```

### `summary`

Sommaire ou plan du module.

```markdown
<!-- _class: summary -->

# Sommaire

1. Introduction
2. Configuration
3. Travaux pratiques
```

### `module`, `section`, `tp`, `demo`

Slides de rupture visuelle pour annoncer un module, un chapitre, un TP ou une démonstration.

```markdown
<!-- _class: module -->

<div class="eyebrow">Module 01</div>

# Titre du module
```

Remplacer `module` par `section`, `tp` ou `demo` selon le besoin.

### `content`

Contenu standard : explication, liste courte, citation ou points de vigilance.

```markdown
<!-- _class: content -->

# Notion importante

- Point clé
- Exemple
- Validation
```

### `two-columns`

Deux colonnes de texte gérées en CSS Grid.

```markdown
<!-- _class: two-columns -->

# Deux colonnes

<div class="grid columns">
<div>

## Colonne gauche

- Élément A

</div>
<div>

## Colonne droite

- Élément B

</div>
</div>
```

### `media-right` et `media-left`

Texte et visuel avec conservation des proportions. Les images utilisent `object-fit: contain`.

```markdown
<!-- _class: media-right -->

# Texte et capture

<div class="grid">
<div>

Texte explicatif.

</div>
<div class="visual-frame">

![Capture](../assets/screenshots/exemple.png)

</div>
</div>
```

Utiliser `media-left` pour placer le visuel à gauche.

### `text-table`

Texte à gauche, tableau à droite.

```markdown
<!-- _class: text-table -->

# Comparaison

<div class="grid">
<div>

Texte de contexte.

</div>
<div>

| Option | Usage |
|---|---|
| A | Test |
| B | Production |

</div>
</div>
```

### `full-table`

Tableau pleine largeur avec taille de police adaptée.

```markdown
<!-- _class: full-table -->

# Matrice de décision

| Critère | Option A | Option B |
|---|---|---|
| Coût | Moyen | Élevé |
| Exploitation | Simple | Avancée |
```

### `full-visual`

Capture ou schéma pleine largeur.

```markdown
<!-- _class: full-visual -->

# Architecture cible

<div class="visual-frame">

![Schéma](../assets/schemas/architecture.png)

</div>
```

### `code`

Extrait de code ou commande avec taille lisible en projection.

````markdown
<!-- _class: code -->

# Commande

```powershell
Get-Process | Sort-Object CPU -Descending | Select-Object -First 5
```
````

## Classes utilitaires

Les classes utilitaires se combinent avec les gabarits existants sans changer leur nom :

```markdown
<!-- _class: content compact -->
```

### `compact`

Réduit la taille des listes et tableaux denses.

```markdown
<!-- _class: full-table compact -->
```

### `no-logo`

Masque le logo compact de bas de slide, utile pour une capture chargée ou une slide sans marque visible.

```markdown
<!-- _class: content no-logo -->
```

### `media-wide`

Donne un peu plus de place au visuel dans les gabarits `media-left` et `media-right`, sans sacrifier la colonne texte.

```markdown
<!-- _class: media-right media-wide -->
```

### `screenshot-wide`

Donne une priorité plus nette à la capture ou au schéma lorsque le texte est court.

```markdown
<!-- _class: media-right screenshot-wide no-logo -->
```

### `media-narrow`

Donne plus de place au texte dans les gabarits `media-left` et `media-right`.

```markdown
<!-- _class: media-right media-narrow -->
```

### `screenshot-full`

Affiche une capture plein écran avec le mécanisme d'arrière-plan Marp, sans rogner l'image.

```markdown
<!-- _class: screenshot-full no-logo -->
<!-- _footer: "" -->
<!-- _header: "" -->

![bg contain](../assets/screenshots/portail-admin.svg)
```

### `no-footer`

Masque le footer et la pagination pour une slide très visuelle.

```markdown
<!-- _class: full-visual tight no-footer no-logo -->
```

### `code-small`

Réduit la taille des blocs de code pour les extraits un peu plus longs.

```markdown
<!-- _class: code code-small -->
```

## Logos

Le thème utilise :

- `assets/brand/logo-principal.svg` pour les slides `cover`
- `assets/brand/logo-compact.svg` pour les autres slides

Les fichiers existants `assets/brand/logo-horizontal.svg` et `assets/brand/logo.svg` ont été conservés. Les deux noms attendus par le template sont des copies de ces logos pour stabiliser les chemins utilisés par Marp.
