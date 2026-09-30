---
type: handoff
date: 2026-09-30
status: in-corso
seq: 1
prev: nessuno
tags: [jekyll, github-pages, portfolio, frontend, mobile]
---

## Obiettivo

Sito Jekyll su GitHub Pages (`https://yintong-zhou.github.io`, branch deploy) che presenta i progetti GitHub di Yintong Zhou: pagina `/projects/` con l'elenco (filtri, ricerca) e una pagina per progetto con link al repository. Serve come vetrina pubblica, quindi tutto ciò che è pubblicato è pubblico. La regola operativa è `AGENT.md`, la mappa tecnica è `CLAUDE.md` (aggiornato, leggere quello per l'architettura).

## A che punto siamo

Funziona e ha passato `bundle exec jekyll build` a ogni modifica. Tutto è committato e pubblicato (`a24884c`, `main` allineato a `origin/main`, autore `zhouyintong96@gmail.com`).
- Pagine: home (`/`), elenco (`/projects/`), 8 schede (`/projects/<nome>/`). `/dashboard/` è solo un redirect a `/projects/` (`jekyll-redirect-from`).
- Solo inglese. Il sistema multilingua è rimasto (stringhe in `_data/i18n.yml`, `languages: [en]`), ma senza selettore finché c'è una sola lingua.
- Grafica dal brand (`brand-guidelines.md`): tema chiaro/scuro, linee a 8 colonne, titolo home con frasi che ruotano, filtri con animazione, view transitions tra pagine, regole mobile in `_sass/_mobile.scss`.
- Icone/favicon dal logo (`assets/img/project_logo.png` → `favicon.ico`, `favicon-32.png`, `apple-touch-icon.png`, `icon-512.png`), README in inglese con logo.
- Ruby 3.3.12 + DevKit installato in `C:\Ruby33-x64`; gem in `vendor/bundle`. Il server locale NON è in esecuzione (fermato).
- Non iniziato: nessuno script in `execution/`, nessuna direttiva in `directives/`, nessuno screenshot dei progetti, nessun `html-proofer`.

## Cosa abbiamo provato che NON ha funzionato

- **Scorrimento orizzontale dei filtri su mobile** (`overflow-x: auto` con margini negativi e `scroll-snap`): il primo filtro finiva attaccato al bordo sinistro (lo snap annulla il padding) e l'ultimo veniva tagliato. Sostituito da una griglia a colonne uguali dentro i margini normali.
- **Toolbar in colonna con `flex-wrap: wrap`**: la riga dei filtri prendeva la larghezza del contenuto e allargava tutta la pagina (507px su 390). Serve `flex-wrap: nowrap` quando la toolbar è in colonna.
- **Maschera della rotazione titolo a 105%**: frammenti delle altre frasi spuntavano sotto la riga. Portato a 140% (vale anche per l'intro `rise`).
- **`image` predefinito per tutti i documenti** (`defaults` senza `type`): finiva nei progetti e il layout lo mostrava come screenshot. Limitato a `type: pages`.
- **`site.data.i18n[parts[0]].code` in Liquid**: indice annidato non risolto, etichette vuote. Usare una variabile intermedia.
- **`for x in lista | split: ";"`**: Liquid non accetta filtri nell'espressione del `for`; si assegna prima (`alts`).
- **Installare Pillow / scaricare pacchetti senza permesso**: non fatto. Le icone sono state generate con `System.Drawing` (PowerShell), script usa-e-getta non salvato.

## Problemi incontrati e come li abbiamo risolti

- **Animazione che "non funziona" sul sito pubblicato**: indagato, NON era un bug. HTML, CSS e JS pubblicati erano identici a quelli locali, nel browser dell'app la rotazione girava, console pulita, animazioni di Windows attive. L'utente ha concluso che era cache. Ricordare: l'intro (linee + titolo che sale) parte solo alla prima pagina di ogni sessione (`sessionStorage`), e GitHub Pages tiene i file in cache ~10 minuti. Se torna la segnalazione: `Ctrl+F5` o finestra in incognito prima di cercare un bug.
- **Layout dei progetti rotto dopo un rinomina parziale** (l'utente aveva rinominato `project.html` in `project_details.html`, ma `_config.yml` diceva ancora `layout: project`): sintomo, pagine progetto senza layout; correzione, `layout: project_details` nei `defaults`.
- **Zoom su iPhone nel campo di ricerca**: causa testo < 16px; correzione `font-size: 1rem`.
- **Hover "appiccicoso" sul touch**: hover avvolto in `@media (hover: hover)`, con `:active` come alternativa.

## Decisioni prese

- **Branch deploy, nessun plugin non ammesso** (scelto) vs GitHub Actions (scartato): non servono Python in CI né Tailwind. Se servissero, si passa ad Actions (`pages.yml` non esiste).
- **Progetti come collezione `_projects/`** (scelto) vs `_data/projects.yml` (scartato): servono pagine dedicate per progetto e un corpo markdown per la descrizione lunga; senza plugin non si generano pagine dai dati.
- **Dati dei progetti presi dall'API pubblica GitHub** (8 repo reali, descrizioni tradotte, nessun dettaglio inventato) vs progetti di esempio (scartato): il sito è pubblico, non si pubblicano dati finti. Esclusi `personal-site-source`, `yintong-zhou` (profilo), questo repo e i fork.
- **Elenco come righe su 8 colonne** (scelto) vs griglia di card (scartato): le card identiche sono il tratto generico da evitare, e il brief chiede allineamento come decorazione.
- **Accento `#00A896` solo sui pulsanti, con testo scuro** (il bianco non ha contrasto sufficiente).
- **Regole view transition in `assets/css/transitions.css`, CSS semplice senza front matter** (scelto) vs dentro lo SCSS (scartato): sassc (libsass) di github-pages può rifiutare at-rule e pseudo-elementi nuovi. Stesse cautele nello SCSS: niente `@use`, niente `color-mix()`, niente `&__x` dopo un combinatore.
- **Solo inglese ma multilingua mantenuto** (scelto) vs rimozione completa (scartato): costo basso, permette di riaggiungere una lingua seguendo `CLAUDE.md`. Nessun redirect automatico per lingua del browser, apposta.
- **Redirect `/dashboard/` → `/projects/`** con `jekyll-redirect-from` (AGENT.md regola 6). Non reindirizzati i vecchi `/en/...` della breve versione bilingue.
- **`docs/` aggiunto a `exclude`** in `_config.yml` perché questo handoff non venga pubblicato.

## File toccati

- `_config.yml`: collezione `projects`, `defaults` (layout `project_details`, `image` solo per `pages`), plugin incluso `jekyll-redirect-from`, `exclude` con `docs/`, `about_url`, `default_lang`/`languages`.
- `index.md`, `projects.md` (`redirect_from: /dashboard/`): pagine; copy home nel front matter (`headline_1`, `headline_rotating`, `lead`).
- `_layouts/{default,home,projects,project_details}.html`: template; `projects.html` ha `data-project-list`.
- `_includes/`: `i18n.html`, `alternates.html`, `project-info.html`, `project-row.html`, `date.html`, `header.html` (toggle tema fuori da `<nav>`), `head.html` (icone, hreflang), `grid-lines.html`, `icon-*.html`.
- `_data/i18n.yml`: stringhe UI (chiave titolo `projects_title`).
- `_projects/*.md`: 8 progetti in inglese.
- `_sass/` (`_variables`, `_theme`, `_base`, `_layout`, `_components`, `_motion`, `_mobile`) e `assets/css/{main.scss,transitions.css}`.
- `assets/js/main.js`: tema, rotazione titolo, filtro/ricerca con FLIP.
- `assets/img/` e `favicon.ico`: icone dal logo. `README.md`, `CLAUDE.md`: documentazione.

## Dove vogliamo andare

Il prossimo passo non è stato dichiarato dall'utente; quello più logico, da confermare con lui:
1. Riaprire il sito pubblicato (con `Ctrl+F5`/incognito) e controllare `/projects/`, una scheda e il redirect `/dashboard/`, ora che `a24884c` è online.
2. Decidere cosa fare delle cose rimaste aperte: screenshot reali dei progetti (il brand li chiede; oggi c'è un riquadro segnaposto), reindirizzamento dei vecchi `/en/...`, script Python in `execution/` per sincronizzare dati e topic dall'API GitHub (serve ok esplicito dell'utente per creare la direttiva), `html-proofer` su `_site/`, prova con `--baseurl`.

## Da sapere prima di toccare qualcosa

- Ruby non è nel PATH delle shell già aperte: in Git Bash `export PATH="/c/Ruby33-x64/bin:$PATH"`. Comando: `bundle exec jekyll serve --livereload` (http://localhost:4000). `_config.yml` non si ricarica da solo: riavviare.
- L'avviso `faraday-retry` in build è innocuo; gli errori `/.well-known/appspecific/com.chrome.devtools.json` nel server sono richieste di DevTools.
- Il sito deve restare pulito da segreti e dati personali. `AGENT.md`: non creare né sovrascrivere direttive senza chiedere; controllare `execution/` prima di scrivere uno script.
- Le pagine dei progetti con stessa data (`updated`) possono cambiare ordine tra build (ordinamento non stabile): normale.
- Non affidarsi agli screenshot del pannello browser a certe larghezze: a volte vanno in timeout; misurare con JS (`getBoundingClientRect`) funziona.
- Per aggiungere un progetto basta un file in `_projects/<nome>.md` (campi in `CLAUDE.md` e `README.md`); per una nuova lingua i passaggi sono in `CLAUDE.md`.
