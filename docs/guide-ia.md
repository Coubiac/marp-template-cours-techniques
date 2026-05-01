# Guide IA pour générer des supports de cours avec ce template Marp

Ce document explique comment générer des supports de cours techniques avec ce template Marp.

L'objectif est de produire des slides :

- sobres ;
- lisibles en projection ;
- adaptées à des formations techniques ;
- maintenables en Markdown ;
- compatibles avec une génération assistée par IA ;
- exportables en HTML pour la projection et en PDF pour les stagiaires.

Le template est prévu pour des sujets comme :

- Microsoft 365 ;
- Entra ID ;
- Intune ;
- Exchange ;
- Azure ;
- AWS ;
- Terraform ;
- Windows Server ;
- Linux ;
- réseau ;
- sécurité ;
- supervision ;
- administration système.

## Principes généraux

Les slides doivent être conçues comme un support de cours, pas comme un manuel complet.

Chaque slide doit avoir une intention pédagogique claire :

- introduire une notion ;
- structurer une explication ;
- présenter un schéma ;
- commenter une capture d'écran ;
- comparer des options ;
- afficher une commande ou un extrait de code ;
- annoncer une démonstration ;
- annoncer un TP ;
- rappeler un point de vigilance.

Ne pas transformer les slides en document encyclopédique.

Les détails longs peuvent être placés :

- dans les notes présentateur ;
- dans les fichiers de TP ;
- dans des documents annexes ;
- dans les commentaires formateur.

La slide doit rester lisible, même projetée en salle.

## Structure recommandée d'un cours

Un dépôt correspond à un cours complet. Un vrai cours doit être placé dans `slides/`.

Le dossier `examples/` sert uniquement à démontrer les gabarits du template. Il ne doit pas contenir de vrai cours et n'est **pas publié** lors du déploiement.

Créer un fichier par journée ou par grand module. Nommer les fichiers avec un préfixe numérique pour garantir l'ordre de publication :

```text
slides/
  00-introduction.md
  01-jour1-fondations-tenant-dns.md
  02-jour2-identites-securite.md
  03-jour3-automatisation-terraform.md

tps/
  TP01-preparation-environnement.md
  TP02-utilisateurs-groupes.md

assets/
  screenshots/
  schemas/
```

Tous les fichiers `.md` présents dans `slides/` sont publiés automatiquement par `npm run deploy:build`. L'ordre de la page `index.html` suit l'ordre alphabétique des noms de fichiers. Ne pas créer un dépôt par journée — tout le cours va dans un seul dépôt.

### Rôle des dossiers

| Dossier | Rôle |
|---|---|
| `slides/` | Sources Markdown des slides du cours réel |
| `tps/` | Procédures détaillées de travaux pratiques |
| `assets/screenshots/` | Captures d'écran utilisées dans les slides |
| `assets/schemas/` | Schémas, diagrammes et exports Excalidraw |
| `examples/` | Démonstration du template uniquement |
| `build/` | Fichiers générés par `npm run render` |
| `dist/` | Exports HTML et PDF |

Ne jamais modifier directement les fichiers de `build/`.

## Configuration du cours

Les informations générales du cours sont définies dans `course.config.json`.

Exemple :

```json
{
  "AUTHOR": "Coubiac",
  "COURSE_TITLE": "Administration Microsoft 365",
  "COURSE_SUBTITLE": "Identités, sécurité, Intune, Exchange et Teams",
  "COURSE_CONTEXT": "Module 01 · Fondations",
  "HEADER_CONTEXT": "{{COURSE_TITLE}} · {{COURSE_CONTEXT}}",
  "YEAR": "2026",
  "COPYRIGHT": "© {{YEAR}} {{AUTHOR}}. Tous droits réservés.",
  "FOOTER": "{{COURSE_TITLE}} | © {{YEAR}} {{AUTHOR}}",
  "COURSE_SLUG": "m365-cyberuniversit"
}
```

## Variables disponibles

Les variables peuvent être utilisées dans les fichiers Markdown avec la syntaxe `{{VARIABLE}}`.

Variables courantes :

```text
{{AUTHOR}}
{{COURSE_TITLE}}
{{COURSE_SUBTITLE}}
{{COURSE_CONTEXT}}
{{HEADER_CONTEXT}}
{{YEAR}}
{{COPYRIGHT}}
{{FOOTER}}
{{COURSE_SLUG}}
```

Exemple :

```markdown
# {{COURSE_TITLE}}

{{COURSE_SUBTITLE}}

Auteur : {{AUTHOR}}
```

Le remplacement des variables est réalisé par :

```bash
npm run render
```

## Front matter Marp recommandé

Chaque fichier de slides doit commencer par :

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

Pour une slide de couverture, il est possible de masquer le header, le footer et la pagination :

```markdown
<!-- _class: cover -->
<!-- _paginate: false -->
<!-- _header: "" -->
<!-- _footer: "" -->

# {{COURSE_TITLE}}

{{COURSE_SUBTITLE}}

Auteur : {{AUTHOR}}
```

## Découpage pédagogique recommandé

Un module de cours peut suivre une progression de ce type :

```text
1. Slide de titre du module
2. Objectifs pédagogiques
3. Rappel ou contexte
4. Notions principales
5. Schéma ou architecture
6. Démonstration formateur
7. Points de vigilance
8. Annonce TP
9. Synthèse
```

Ne pas commencer systématiquement chaque module par beaucoup de théorie. Alterner :

- explication ;
- schéma ;
- capture ;
- démonstration ;
- TP ;
- synthèse.

## Types de slides disponibles

Utiliser uniquement les gabarits prévus par le template.

Ne pas inventer de nouvelles classes CSS sans demande explicite.

## `cover`

Pour la première slide du cours ou d'un support.

```markdown
<!-- _class: cover -->
<!-- _paginate: false -->
<!-- _header: "" -->
<!-- _footer: "" -->

# {{COURSE_TITLE}}

{{COURSE_SUBTITLE}}

Auteur : {{AUTHOR}}
```

À utiliser pour :

- page de titre du cours ;
- support de journée ;
- support de module complet.

## `objectives`

Pour présenter les objectifs pédagogiques.

```markdown
<!-- _class: objectives -->

# Objectifs pédagogiques

- Comprendre le rôle du service.
- Identifier les composants principaux.
- Configurer un environnement simple.
- Vérifier le fonctionnement.
```

Règles :

- utiliser des verbes d'action ;
- éviter les formulations vagues ;
- limiter à 4 ou 5 objectifs ;
- préférer l'infinitif.

Exemples de bonnes formulations :

```text
Comprendre le rôle d'Entra ID
Identifier les types de groupes
Configurer une stratégie d'accès conditionnel
Analyser les journaux de connexion
```

## `summary`

Pour afficher le plan ou le sommaire d'un module.

```markdown
<!-- _class: summary -->

# Sommaire

1. Introduction
2. Concepts principaux
3. Configuration
4. Démonstration
5. Travaux pratiques
6. Synthèse
```

Règles :

- rester court ;
- éviter de lister trop de sous-parties ;
- privilégier une vue d'ensemble.

## `module`

Pour annoncer un module important.

```markdown
<!-- _class: module -->

<div class="eyebrow">Module 01</div>

# Titre du module
```

À utiliser pour les grandes ruptures dans le cours.

## `section`

Pour annoncer un chapitre ou un sous-module.

```markdown
<!-- _class: section -->

<div class="eyebrow">Chapitre 01</div>

# Titre du chapitre
```

À utiliser pour structurer un module en parties.

## `tp`

Pour annoncer un TP.

```markdown
<!-- _class: tp -->

<div class="eyebrow">Travaux pratiques</div>

# TP 01 - Créer les premiers utilisateurs
```

Une slide `tp` sert à annoncer l'activité.

Elle peut contenir :

- le titre du TP ;
- l'objectif général ;
- le résultat attendu ;
- la durée indicative.

Elle ne doit pas contenir toute la procédure détaillée.

La procédure détaillée doit être placée dans un fichier séparé, par exemple :

```text
tps/TP01-utilisateurs-groupes.md
```

## `demo`

Pour annoncer une démonstration formateur.

```markdown
<!-- _class: demo -->

<div class="eyebrow">Démonstration</div>

# Ajouter un domaine personnalisé
```

Une slide `demo` peut indiquer :

- ce qui va être montré ;
- le portail utilisé ;
- le résultat attendu ;
- les points à observer.

La procédure détaillée peut être placée en note présentateur.

## `content`

Pour une slide de contenu standard.

```markdown
<!-- _class: content -->

# Notion importante

- Point clé 1
- Point clé 2
- Point clé 3
```

Règles :

- 1 idée principale par slide ;
- 3 à 6 puces maximum ;
- phrases courtes ;
- pas de long paragraphe ;
- éviter les sous-niveaux trop nombreux.

## `two-columns`

Pour comparer deux notions ou structurer deux groupes d'idées.

```markdown
<!-- _class: two-columns -->

# Comparaison

<div class="grid columns">
<div>

## Option A

- Avantage
- Limite
- Cas d'usage

</div>
<div>

## Option B

- Avantage
- Limite
- Cas d'usage

</div>
</div>
```

À utiliser pour :

- comparer deux technologies ;
- distinguer deux approches ;
- présenter avantages et limites ;
- expliquer avant / après.

## `media-right`

Pour mettre du texte à gauche et un visuel à droite.

```markdown
<!-- _class: media-right -->

# Texte et capture

<div class="grid">
<div>

Texte explicatif court.

- Point clé
- Point d'attention
- Résultat attendu

</div>
<div class="visual-frame">

![Capture](../assets/screenshots/nom-capture.png)

</div>
</div>
```

À utiliser pour :

- commenter une capture d'écran ;
- expliquer une interface ;
- accompagner un schéma simple ;
- illustrer une procédure.

## `media-left`

Pour mettre un visuel à gauche et du texte à droite.

```markdown
<!-- _class: media-left -->

# Schéma et explication

<div class="grid">
<div class="visual-frame">

![Schéma](../assets/schemas/nom-schema.svg)

</div>
<div>

Texte explicatif court.

- Point clé
- Point d'attention

</div>
</div>
```

À utiliser quand le visuel doit être regardé en premier.

## `media-wide`

À utiliser avec `media-right` ou `media-left` lorsque le visuel doit avoir un peu plus de place.

```markdown
<!-- _class: media-right media-wide -->
```

Règles :

- garder un texte court ;
- ne pas remplir la colonne texte ;
- utiliser pour des captures riches ou des schémas détaillés.

## `screenshot-wide`

À utiliser lorsqu'une capture d'écran est prioritaire et que le texte est court.

```markdown
<!-- _class: media-right screenshot-wide no-logo -->
```

Règles :

- utiliser seulement si le texte est court ;
- éviter plus de 3 ou 4 puces ;
- préférer une capture lisible à une capture trop petite ;
- ne pas utiliser pour une slide très textuelle.

## `media-narrow`

À utiliser lorsque le texte doit avoir plus de place que le visuel.

```markdown
<!-- _class: media-right media-narrow -->
```

Cas d'usage :

- petit schéma simple ;
- icône ou mini capture ;
- texte explicatif plus dense.

## `full-visual`

Pour un schéma ou une capture qui doit occuper presque toute la slide.

```markdown
<!-- _class: full-visual no-footer no-logo -->

# Architecture cible

<div class="visual-frame">

![Schéma](../assets/schemas/architecture.svg)

</div>
```

À utiliser pour :

- architecture ;
- topologie réseau ;
- schéma de flux ;
- capture d'écran importante ;
- diagramme à commenter oralement.

Règles :

- garder un titre court ;
- ne pas ajouter beaucoup de texte ;
- placer les détails en notes présentateur ;
- utiliser `no-footer` et `no-logo` si le visuel est chargé.

## `screenshot-full`

Pour une capture plein écran.

```markdown
<!-- _class: screenshot-full no-logo -->
<!-- _header: "" -->
<!-- _footer: "" -->

![bg contain](../assets/screenshots/portail-admin.png)
```

Règles :

- ne pas ajouter de texte ;
- ne pas ajouter de grille ;
- ne pas ajouter de cadre ;
- utiliser uniquement une image de fond Marp ;
- garder `contain` pour ne pas rogner l'image.

## `text-table`

Pour associer un texte court et un tableau.

```markdown
<!-- _class: text-table -->

# Comparaison

<div class="grid">
<div>

Texte d'introduction.

- Point clé
- Critère de lecture

</div>
<div>

| Élément | Usage |
|---|---|
| A | Exemple |
| B | Exemple |

</div>
</div>
```

Règles :

- tableau court ;
- peu de colonnes ;
- texte limité ;
- préférer `full-table` si le tableau devient dense.

## `full-table`

Pour un tableau qui doit prendre toute la largeur.

```markdown
<!-- _class: full-table compact -->

# Tableau de synthèse

| Critère | Option A | Option B |
|---|---|---|
| Coût | Moyen | Élevé |
| Exploitation | Simple | Avancée |
```

Règles :

- limiter le nombre de colonnes ;
- découper les grands tableaux ;
- utiliser `compact` si nécessaire ;
- éviter les cellules très longues.

## `code`

Pour un extrait de code ou une commande.

````markdown
<!-- _class: code -->

# Exemple PowerShell

```powershell
Get-Process | Sort-Object CPU -Descending | Select-Object -First 5
```
````

Règles :

- toujours préciser le langage ;
- garder les extraits courts ;
- éviter les scripts complets ;
- préférer les TP pour les scripts longs.

## `code-small`

Pour un extrait légèrement plus long.

````markdown
<!-- _class: code code-small -->

# Exemple PowerShell

```powershell
Connect-MgGraph -Scopes "User.Read.All"
Get-MgUser -Top 10 | Select-Object DisplayName, UserPrincipalName
```
````

Règles :

- ne pas utiliser pour des scripts longs ;
- vérifier le rendu PDF ;
- diviser en plusieurs slides si le bloc devient trop dense ;
- ne pas accepter un rendu vertical, compressé ou illisible.

## Classes utilitaires

Les classes utilitaires se combinent avec les gabarits existants.

Exemple :

```markdown
<!-- _class: content compact -->
```

## `compact`

Réduit la densité des listes et tableaux.

```markdown
<!-- _class: full-table compact -->
```

À utiliser pour :

- tableaux un peu denses ;
- listes plus longues ;
- slide de synthèse.

Ne pas utiliser pour faire rentrer trop de contenu sur une seule slide.

## `tight`

Réduit les marges pour donner plus de place au contenu.

```markdown
<!-- _class: full-visual tight no-footer no-logo -->
```

À utiliser pour :

- schémas importants ;
- captures lisibles ;
- tableaux denses ;
- slides visuelles.

## `no-logo`

Masque le logo compact de bas de slide.

```markdown
<!-- _class: full-visual no-logo -->
```

À utiliser pour :

- capture chargée ;
- schéma proche du bord ;
- slide sans habillage visuel.

## `no-footer`

Masque le footer et la pagination.

```markdown
<!-- _class: full-visual no-footer no-logo -->
```

À utiliser pour :

- capture importante ;
- schéma dense ;
- slide plein écran ;
- support visuel à commenter.

## Notes présentateur

Les détails longs ne doivent pas être affichés directement sur les slides.

Ils peuvent être placés dans les notes présentateur.

Syntaxe recommandée :

```markdown
<!-- note
Expliquer la différence entre authentification et autorisation.

Un utilisateur peut être correctement authentifié mais ne pas avoir les permissions nécessaires pour accéder à une ressource.

Donner un exemple simple :
- badge valide pour entrer dans le bâtiment ;
- mais pas d'autorisation pour entrer dans toutes les salles.
-->
```

Utiliser les notes présentateur pour :

- développer une explication orale ;
- ajouter une transition entre deux slides ;
- rappeler un point de vigilance ;
- indiquer une démonstration rapide à faire ;
- conserver une anecdote pédagogique ;
- noter une question à poser aux stagiaires ;
- préciser ce que le formateur doit montrer à l'écran ;
- conserver une explication plus détaillée sans alourdir la slide.

Ne pas utiliser les notes présentateur pour cacher une information indispensable.

Si une information est nécessaire pour :

- comprendre le cours ;
- réaliser un TP ;
- refaire une manipulation ;
- mémoriser une commande importante ;

elle doit apparaître dans le support stagiaire ou dans le document de TP.

## Règles pour les captures d'écran

Les captures doivent être placées dans :

```text
assets/screenshots/
```

Règles :

- conserver les proportions ;
- ne jamais rogner automatiquement ;
- utiliser `object-fit: contain` ;
- ne pas utiliser `object-fit: cover` ;
- utiliser une capture propre et lisible ;
- masquer les données sensibles ;
- éviter les captures trop petites ;
- préférer `screenshot-wide`, `full-visual` ou `screenshot-full` si nécessaire.

Exemples de choix de gabarit :

| Besoin | Gabarit conseillé |
|---|---|
| Texte + petite capture | `media-right` |
| Texte court + grande capture | `media-right screenshot-wide` |
| Capture à commenter longuement | `full-visual no-footer no-logo` |
| Capture plein écran | `screenshot-full` |

## Règles pour les schémas

Les schémas doivent être placés dans :

```text
assets/schemas/
```

Formats recommandés :

| Format | Usage |
|---|---|
| SVG | Schémas Excalidraw, diagrammes vectoriels |
| PNG | Exports spécifiques, captures ou rendus bitmap |

Règles :

- préférer SVG pour les schémas ;
- garder les schémas simples ;
- éviter trop de texte dans le schéma ;
- utiliser les notes présentateur pour détailler ;
- privilégier un schéma par idée.

## Règles pour le code

Les extraits de code doivent rester courts.

Règles :

- toujours préciser le langage du bloc ;
- ne pas afficher de script complet si le script est long ;
- extraire uniquement la partie utile ;
- diviser les scripts longs en plusieurs slides ;
- placer les scripts complets dans les TP ;
- vérifier le rendu PDF.

Exemples de langages :

````markdown
```powershell
Get-MgUser -Top 10
```

```bash
terraform init
terraform plan
```

```hcl
resource "azurerm_resource_group" "rg" {
  name     = "rg-demo"
  location = "westeurope"
}
```

```yaml
services:
  app:
    image: nginx
```
````

## Règles pour les tableaux

Les tableaux doivent rester lisibles.

Règles :

- éviter les tableaux trop larges ;
- limiter le nombre de colonnes ;
- éviter les cellules longues ;
- utiliser `compact` avec prudence ;
- découper les grands tableaux en plusieurs slides ;
- préférer `full-table` pour les tableaux importants ;
- utiliser `text-table` seulement si le tableau est court.

## Séparation entre slides et TP

Les slides servent à :

- expliquer ;
- structurer ;
- illustrer ;
- annoncer ;
- synthétiser.

Les TP servent à :

- détailler les manipulations ;
- donner les consignes pas à pas ;
- fournir les commandes complètes ;
- indiquer les résultats attendus ;
- laisser une trace exploitable par les stagiaires.

Ne pas mettre une procédure complète de TP dans une slide.

Exemple :

Slide :

```markdown
<!-- _class: tp -->

<div class="eyebrow">Travaux pratiques</div>

# TP 02 - Créer des utilisateurs et groupes

Objectif : créer les premiers objets d'annuaire et vérifier leur usage.
```

Document TP :

```text
tps/TP02-utilisateurs-groupes.md
```

## Style rédactionnel

Le style doit être :

- pédagogique ;
- direct ;
- professionnel ;
- clair ;
- adapté à des apprenants en informatique.

Éviter :

- les phrases longues ;
- les paragraphes massifs ;
- les formulations vagues ;
- le jargon non expliqué ;
- les slides trop chargées ;
- le ton marketing.

Privilégier :

- l'infinitif dans les titres ;
- les verbes d'action ;
- les formulations concrètes ;
- les exemples techniques ;
- les points de vigilance.

Exemples :

```text
Comprendre le rôle d'Entra ID
Identifier les types de groupes
Configurer une stratégie MFA
Analyser les journaux de connexion
Vérifier le résultat dans le portail
```

Éviter le tutoiement dans les supports destinés aux stagiaires.

## Règles spécifiques pour l'IA

Lors de la génération d'un module, l'IA doit respecter les règles suivantes :

1. Utiliser uniquement les classes existantes.
2. Ne pas inventer de nouveaux styles CSS.
3. Ne pas modifier le thème.
4. Ne pas créer de longues slides encyclopédiques.
5. Préférer plusieurs slides claires à une seule slide trop dense.
6. Garder une idée principale par slide.
7. Utiliser `media-right` ou `media-left` pour associer texte et visuel.
8. Utiliser `full-visual` ou `screenshot-full` pour les captures importantes.
9. Placer les détails longs dans les notes présentateur.
10. Placer les procédures détaillées dans les TP.
11. Placer les captures dans `assets/screenshots/`.
12. Placer les schémas dans `assets/schemas/`.
13. Ne pas générer de contenu dans `build/`.
14. Ne pas générer de contenu réel dans `examples/`.
15. Vérifier que les chemins d'images sont relatifs au fichier Markdown.
16. Ne pas utiliser de données sensibles dans les captures ou exemples.
17. Ne pas produire de contenu juridiquement ou contractuellement réutilisé sans droit.

## Exemple de module court

```markdown
---
marp: true
theme: coubiac
size: 16:9
paginate: true
header: "{{HEADER_CONTEXT}}"
footer: "{{FOOTER}}"
---

<!-- _class: module -->

<div class="eyebrow">Module 01</div>

# Comprendre les identités cloud

---

<!-- _class: objectives -->

# Objectifs pédagogiques

- Comprendre le rôle d'Entra ID.
- Identifier les objets principaux.
- Distinguer utilisateur, groupe et rôle.
- Préparer les manipulations du TP.

---

<!-- _class: content -->

# Entra ID en quelques mots

- Service d'identité cloud de Microsoft.
- Utilisé par Microsoft 365, Azure et de nombreuses applications SaaS.
- Gère l'authentification, les groupes, les rôles et les accès.
- Peut être synchronisé avec un Active Directory local.

<!-- note
Insister sur la différence entre Active Directory Domain Services et Entra ID.

Faire le lien avec les usages concrets :
- connexion à Microsoft 365 ;
- accès au portail Azure ;
- accès aux applications SaaS.
-->

---

<!-- _class: media-right media-wide -->

# Objets principaux

<div class="grid">
<div>

- Utilisateurs
- Groupes
- Rôles
- Applications
- Appareils

</div>
<div class="visual-frame">

![Portail Entra](../assets/screenshots/entra-admin-center.png)

</div>
</div>

---

<!-- _class: tp -->

<div class="eyebrow">Travaux pratiques</div>

# TP 01 - Explorer le tenant

Objectif : identifier les principaux objets d'identité dans le portail d'administration.
```

## Validation attendue

Après génération ou modification :

```bash
npm run render
npm run export:html
npm run export:pdf
```

Vérifier notamment :

- les variables sont remplacées ;
- les images sont visibles ;
- les chemins d'assets sont corrects ;
- les tableaux ne débordent pas ;
- les blocs de code restent lisibles ;
- les slides visuelles ne sont pas coupées ;
- le footer reste discret ;
- le PDF est exploitable pour les stagiaires.

## Rappel important

Le template sert à produire des supports efficaces.

Ne pas chercher à tout mettre sur les slides.

Une bonne slide de cours technique doit :

- afficher l'essentiel ;
- guider l'explication ;
- laisser de la place aux captures et schémas ;
- rester lisible ;
- donner envie de suivre la démonstration ou le TP.

Les détails longs vont dans les notes présentateur, les TP ou les documents annexes.
