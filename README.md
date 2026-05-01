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
|   |-- brand/
|   |   |-- logo-principal.svg
|   |   `-- logo-compact.svg
|   |-- screenshots/        # captures d'écran du cours
|   `-- schemas/            # schémas et diagrammes
|-- examples/               # démonstration du template uniquement
|   `-- template-demo.md
|-- slides/                 # sources du cours réel (vides dans le template)
|-- build/                  # généré par render.mjs — ne pas éditer
`-- dist/                   # exports HTML / PDF finaux
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

La commande génère `build/examples/template-demo.md`, puis produit `dist/template-demo.html`.

## Exporter en PDF

```bash
npm run export:pdf
```

La commande génère `build/examples/template-demo.md`, puis produit `dist/template-demo.pdf`.

## Tout exporter

```bash
npm run export:all
```

Cette commande produit les exports HTML et PDF.

## Déployer sur Azure Blob Storage

Le workflow de déploiement est **désactivé par défaut** dans le dépôt template. Il est fourni comme exemple dans `docs/github-actions/deploy-azure-blob.yml` et doit être activé manuellement dans chaque dépôt de cours.

> Le dépôt template public ne déclenche aucun déploiement automatique tant que le workflow n'est pas copié dans `.github/workflows/`.

### Champ requis dans `course.config.json`

| Champ | Rôle | Exemple |
|---|---|---|
| `COURSE_SLUG` | Sous-dossier de publication (`/$web/{slug}/`) | `azure-admin-m365` |

Tous les fichiers `.md` présents dans `slides/` sont publiés automatiquement. Aucune liste manuelle n'est nécessaire.

### Configuration automatique

Pour configurer l'ensemble en une seule commande (workflow, secrets GitHub, variable GitHub, federated credential Azure) :

**1. Créer `.deploy.local.env`** à la racine du dépôt (fichier non versionné, déjà dans `.gitignore`) :

```
AZURE_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_SUBSCRIPTION_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_STORAGE_ACCOUNT=nom-du-compte-storage
STATIC_WEBSITE_ENDPOINT=https://moncompte.z6.web.core.windows.net
AZURE_RESOURCE_GROUP=nom-du-resource-group
AZURE_IDENTITY_NAME=nom-de-la-managed-identity
```

**2. Exécuter :**

```bash
npm run setup:deploy
```

Le script :

- copie `docs/github-actions/deploy-azure-blob.yml` dans `.github/workflows/` si absent ;
- crée les secrets GitHub via `gh secret set` (les valeurs ne sont jamais affichées en console) ;
- crée la variable `STATIC_WEBSITE_ENDPOINT` via `gh variable set` ;
- crée la federated credential OIDC sur la managed identity via `az identity federated-credential create` avec le subject `repo:<owner>/<repo>:ref:refs/heads/main` ;
- affiche en sortie uniquement les noms configurés, le subject OIDC et l'URL finale.

À chaque déploiement, le workflow génère automatiquement un fichier HTML par `.md` dans `slides/` et une page `index.html` listant tous les supports.

**Prérequis :** `gh` CLI authentifié (`gh auth login`) et `az` CLI authentifié (`az login`) avec accès en écriture à la managed identity.

### Activation manuelle

Si vous préférez configurer GitHub et Azure manuellement :

```bash
npm run init:deploy
```

Le script copie uniquement le workflow et affiche les secrets, la variable et le subject OIDC à créer à la main.

**Secrets GitHub** (`Settings › Secrets and variables › Actions › Secrets`) :

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_STORAGE_ACCOUNT`

**Variable GitHub** (`Settings › Secrets and variables › Actions › Variables`) :

- `STATIC_WEBSITE_ENDPOINT` — URL de base du site statique Azure

**Federated credential Azure** : créer une credential OIDC sur la managed identity Entra ID avec le subject `repo:<owner>/<repo>:ref:refs/heads/main`.

## Créer un cours à partir du template

Ce dépôt est conçu pour être utilisé comme **dépôt modèle GitHub** (_Use this template_). **Un dépôt correspond à un cours complet.** Pour chaque nouveau cours, créer un nouveau dépôt à partir de ce template.

> `examples/` contient uniquement des démonstrations du template et n'est **pas publié** lors du déploiement. Le contenu réel du cours va dans `slides/`.

### Étapes

**1. Créer un nouveau dépôt depuis le template GitHub.**

**2. Adapter `course.config.json` :**

```json
{
  "AUTHOR": "Prénom Nom",
  "COURSE_TITLE": "Titre du cours",
  "COURSE_SUBTITLE": "Sous-titre ou contexte du cours.",
  "COURSE_CONTEXT": "Module 01 · Nom du module",
  "HEADER_CONTEXT": "{{COURSE_TITLE}} · {{COURSE_CONTEXT}}",
  "YEAR": "2026",
  "COPYRIGHT": "© {{YEAR}} {{AUTHOR}}. Tous droits réservés.",
  "FOOTER": "{{COURSE_TITLE}} | © {{YEAR}} {{AUTHOR}}",
  "COURSE_SLUG": "mon-cours-technique"
}
```

**3. Créer les fichiers Markdown dans `slides/` :**

Un fichier par journée ou par grand module. Utiliser un préfixe numérique pour garantir l'ordre alphabétique :

```text
slides/
  00-introduction.md
  01-jour1-fondations.md
  02-jour2-securite.md
  03-jour3-automatisation.md
assets/screenshots/   # captures d'écran du cours
assets/schemas/       # schémas et diagrammes
```

Tous les fichiers `.md` présents dans `slides/` sont publiés automatiquement par `npm run deploy:build`. L'ordre de la liste `index.html` suit l'ordre alphabétique des noms de fichiers.

**4. Utiliser ce front matter dans chaque fichier de cours :**

```markdown
---
marp: true
theme: coubiac
size: 16:9
paginate: true
header: "{{HEADER_CONTEXT}}"
footer: "{{FOOTER}}"
---
```

**5. Masquer le header et le footer sur la couverture :**

```markdown
<!-- _class: cover -->
<!-- _paginate: false -->
<!-- _header: "" -->
<!-- _footer: "" -->

# {{COURSE_TITLE}}
```

**Variables disponibles** (définies dans `course.config.json`) :

| Variable | Valeur |
|---|---|
| `{{AUTHOR}}` | Nom de l'auteur |
| `{{COURSE_TITLE}}` | Titre complet du cours |
| `{{COURSE_SUBTITLE}}` | Sous-titre ou descriptif |
| `{{YEAR}}` | Année |
| `{{COPYRIGHT}}` | Mention légale complète |
| `{{HEADER_CONTEXT}}` | Titre + contexte de module |
| `{{FOOTER}}` | Footer standard titre + copyright |

**6. Générer les fichiers intermédiaires :**

```bash
npm run render
```

Le script lit `slides/` et `examples/`, substitue les variables, et écrit les résultats dans `build/` en conservant l'arborescence. Un fichier `slides/01-identites.md` produit donc `build/slides/01-identites.md`.

**7. Exporter en PDF (distribution stagiaires) :**

```bash
# Un fichier à la fois — nécessite Chrome ou Edge installé
npx marp build/slides/01-jour1-fondations.md --theme themes/coubiac.css --pdf --allow-local-files -o dist/01-jour1-fondations.pdf
```

Pour forcer un navigateur spécifique :

```bash
npx marp build/slides/01-jour1-fondations.md --theme themes/coubiac.css --pdf --allow-local-files --browser chrome -o dist/01-jour1-fondations.pdf
```

**8. Construire les supports web (déploiement) :**

```bash
npm run deploy:build
```

Le script génère `public/<COURSE_SLUG>/` avec un fichier HTML par slide et une page `index.html`. C'est ce dossier qui est uploadé vers Azure Blob Storage par le workflow CI.

> Les scripts `npm run export:*` définis dans `package.json` ciblent uniquement `examples/template-demo.md`. Pour un cours réel, utiliser `npm run deploy:build` pour l'export web ou les commandes `npx marp` directement pour les PDF.

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
