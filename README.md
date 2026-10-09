# Vanden Broele webshop (prototype)

Klikbaar frontend-prototype van een webshop voor Vanden Broele: catalogus met zoeken en filters, detail van een titel en winkelmandje. De inhoud (titels, auteurs, prijzen, voorraad) is **fictief**. Het is een statische site zonder build en zonder afhankelijkheden: gewone HTML, CSS en JavaScript.

Online: https://vandenbroele-alistar-demo.vercel.app/ (met wachtwoord)

## Lokaal starten

### Snel, zonder wachtwoord

Elke statische webserver volstaat. In de projectmap:

```
python -m http.server 8765
```

of

```
npx serve .
```

Open daarna http://localhost:8765. De wachtwoordbeveiliging staat dan **uit**, want die zit in `middleware.js` en draait alleen op Vercel (of met `vercel dev`).

### Met wachtwoord, zoals online

Eenmalig:

```
npx vercel login
npx vercel link
```

Maak in de projectmap een bestand `.env.local` met:

```
SITE_PASSWORD=jouw-wachtwoord
```

Staat het wachtwoord al op Vercel, dan haalt `npx vercel env pull .env.local` het voor je op.

Start daarna:

```
npx vercel dev
```

Open http://localhost:3000. Je krijgt dezelfde inlogpagina als online.

`.env.local` staat in `.gitignore`. Zet nooit een wachtwoord in git.

### Server stoppen

Druk in het terminalvenster waarin de server draait op **Ctrl+C**. Dat geldt voor `python -m http.server`, `npx serve` en `npx vercel dev`.

Draait de server op de achtergrond of is het venster al gesloten, zoek dan het proces dat poort 8765 (of 3000 bij `vercel dev`) gebruikt en stop het.

PowerShell:

```
Stop-Process -Id (Get-NetTCPConnection -LocalPort 8765).OwningProcess
```

macOS/Linux:

```
kill $(lsof -ti :8765)
```

## Wachtwoordbeveiliging

`middleware.js` is een Vercel Routing Middleware (Edge runtime) die vóór elk verzoek draait.

- Het wachtwoord komt uit de omgevingsvariabele `SITE_PASSWORD` en gaat nooit naar de browser.
- Na een juist wachtwoord krijg je een ondertekende, HttpOnly cookie die 12 uur geldig is. Een ander wachtwoord (nieuwe waarde van `SITE_PASSWORD`) logt iedereen uit. `/logout` logt uit.
- Zonder `SITE_PASSWORD` toont de site een melding dat hij niet geconfigureerd is (503).
- Na het inloggen worden alleen de sitebestanden getoond (`index.html`, `styles.css`, `app.js`, `data.js`, `assets/`). Al het andere geeft 404.
- Een fout wachtwoord wordt 0,8 seconden vertraagd. Er is geen teller voor het aantal pogingen, want de edge heeft geen gedeelde staat. Gebruik dus een lang wachtwoord, of Vercels eigen Password Protection als je meer wilt.

## Deployen op Vercel

1. Koppel de GitHub-repo aan een Vercel-project. Framework preset: **Other**, geen build command.
2. Zet in Settings → Environment Variables `SITE_PASSWORD`, voor Production en Preview.
3. Elke push naar `main` deployt automatisch. Na het wijzigen van het wachtwoord is een redeploy nodig.

`.vercelignore` houdt notities en bronmateriaal uit de deploy (`.impeccable`, `*.md`, `oldwebshop`, merk-JSON, `assets/og-image.png`).

## Wat zit erin

| Bestand | Inhoud |
|---|---|
| `index.html` | Schil van de pagina (kop, mandknop, voettekst, containers) |
| `styles.css` | Alle stijlen en design tokens |
| `app.js` | Zoeken, filters, lijst, detail, mandje en snelbestelling |
| `data.js` | Fictieve catalogus en taxonomie (materie, doelgroepen, vormen) |
| `middleware.js` | Wachtwoordbeveiliging voor Vercel |
| `assets/` | Logo's en favicons van Vanden Broele |
| `PRODUCT.md`, `DESIGN.md`, `BRANDING.md` | Productcontext, ontwerpsysteem en merkgegevens |
| `oldwebshop/` | Schermafbeeldingen van de huidige winkel (referentie) |

## Functies

- **Zoeken** op titel, auteur of ISBN.
- **Snelbestelling:** plak een lijst ISBN's (eventueel met aantallen) en zie per regel of de titel gevonden is. Gevonden regels voeg je in één keer toe aan de mand.
- **Filters:** Auteur, Doelgroep (met functies eronder, inclusief aangevinkte en gedeeltelijk gekozen hoofdgroepen), Materie en Vorm. Elk menu heeft een zoekveld, behalve Vorm.
- **Lijst** met prijs excl. en incl. 6% btw, voorraad en een aantal-veld per titel. Sorteren via de kolomkoppen of het sorteermenu.
- **Detail** van een titel als paneel naast de lijst, of als volledige pagina (`#/titel/<id>`). Bij titels met een Connect-platform staat een verwijzing naar dat platform.
- **Mand** als lade en als pagina (`#/mand`): aantallen aanpassen, verwijderen, mand leegmaken (met "Ongedaan maken"), een veld voor bestelreferentie of PO-nummer en een kostenplaats. U ontvangt een factuur, er is geen online betaling. Bestellen is in dit prototype niet echt.

## Wat nog niet is uitgewerkt

- Echte prijzen, covers, voorraad en leveringsinformatie.
- Verzendkosten.
- De publicatievormen "Online in Connect" en "Exclusief online in Connect" staan in het filter maar hebben geen titels: Connect-toegang is geen mandartikel.
- Franstalige versie (alleen Nederlands).
- Afrekenen, accounts en orderbevestiging.
