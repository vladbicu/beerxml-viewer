# BeerXML Viewer

Încarci un export BeerXML (Grainfather, Brewfather, BeerSmith) și îl vezi ca o
fișă de rețetă cu tipografie mare, gândită pentru un monitor secundar sau un TV
în berărie, citită de la 2-3 metri.

Totul rulează client-side: fără backend, fără bază de date, fără upload. Nimic
nu persistă după refresh — intenționat, e un viewer pentru ziua de brew, nu o
bibliotecă de rețete.

## Comenzi

```bash
npm run dev        # server de dezvoltare
npm test           # teste de parser (rulate în Node pe fixtures/)
npm run typecheck  # tsc strict
npm run build      # build de producție
npm run preview    # servește build-ul local
```

## Structură

```
src/lib/parseBeerXML.ts   parsing + normalizare + decodare după encoding
src/lib/types.ts          modelul de date
src/lib/srm.ts            SRM → culoare
src/lib/format.ts         mase, durate, densități
src/components/           UploadZone, RecipeTicket + secțiuni
fixtures/                 export real folosit ca fixture de test
```

## Ce tolerează parserul

Exporturile reale se abat de la specificația BeerXML în mai multe feluri, toate
acoperite de teste în `src/lib/parseBeerXML.test.ts`:

- **Nume de tag alternative** — `getTag(node, ...names)` încearcă mai multe nume
  case-insensitive, deci `NAME`/`n` și `OG`/`EST_OG` se rezolvă cu același
  mecanism.
- **Câmpuri „estimate"** — `EST_OG`/`EST_FG`/`EST_ABV`/`EST_COLOR` când lipsesc
  cele standard; ABV se calculează din OG/FG dacă lipsesc ambele.
- **`BOIL_SIZE` = 0** — tratat ca absent, ca să nu apară „0 L" pe ecran.
- **Tag-uri goale auto-închise** (`<NOTES/>`, `<TYPE/>`) — string gol, nu eroare.
- **`USE` peste cele standard** — `Hop Stand` cu `TEMPERATURE`/`HOP_TEMP` primește
  grupare proprie, separat de boil și dry hop.
- **`DISPLAY_AMOUNT`** — preferat față de `AMOUNT` în kg pentru adaosuri mici.
- **Cod de stil compus** — Grainfather nu scrie `<CATEGORY>`, ci
  `CATEGORY_NUMBER` + `STYLE_LETTER`, reasamblate în „21B".
- **Encoding declarat în prolog** — fișierul e citit ca `ArrayBuffer` și decodat
  după `encoding="..."` (ex. `ISO-8859-1`), nu presupus UTF-8.
- **Rădăcină variabilă** — `<RECIPES><RECIPE>` sau `<RECIPE>` direct; mai multe
  rețete în același fișier sunt acceptate, iar una coruptă nu le anulează pe
  celelalte.

## Cast pe TV

Cât timp o rețetă e afișată, aplicația ține un `screen wake lock`, ca sesiunea de
cast să nu se întrerupă când laptopul-sursă ar adormi. API-ul cere HTTPS sau
`localhost` și lipsește pe Safari mai vechi — eșecul e silențios.

Dacă TV-ul are browser propriu, deschiderea unui URL deployat direct pe TV e mai
stabilă decât cast-ul. Deploy-ul nu e configurat în repo.
