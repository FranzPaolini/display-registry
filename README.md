# Display Registry

Ogni display ha un **QR fisso** che contiene solo il suo ID (es. `DSP-003`).
Scansionandolo si apre una pagina con le specifiche e la versione software **attuali**,
lette da un'unica fonte dati. Quando cambia qualcosa si aggiorna una riga: l'etichetta resta quella.

## Pagine
- `index.html`: elenco dei display con ricerca e conteggio di quelli da aggiornare o guasti
- `index.html?id=DSP-003`: scheda del singolo display (è la pagina che apre il QR)
- `labels.html`: genera le etichette QR da stampare (4 per riga su A4)

## Dove stanno i dati (scegline una)
1. **`data/devices.json`**: lo modifichi direttamente su GitHub (icona matita, poi Commit).
2. **Google Sheet** (consigliato se i dati li aggiornano persone non tecniche): il foglio "Display Registry"
   ha quattro schede: **Display** (una riga per display), **Tipologie** (tipi di equipment, con foto
   facoltativa), **Ultime versioni** (ultima release per ogni software) e **Istruzioni**.
   Vai su *File → Condividi → Pubblica sul web*, pubblica *Display*, *Tipologie* e *Ultime versioni*
   in formato CSV e incolla i link in `config.js` (`dataUrl`, `typesUrl`, `latestVersionsUrl`). Le colonne aggiunte a destra compaiono da sole nella scheda del display.

Senza `latestVersionsUrl`, le ultime versioni si impostano in `config.js` → `latestVersions`.
Ogni display con una versione più vecchia viene segnalato come **"Da aggiornare"**.

## Immagini
La scheda mostra una galleria con due viste:
- **Prodotto**: le immagini della colonna *Immagine prodotto* (anche più link separati da virgola;
  i link di Google Drive vengono convertiti in automatico). Se è vuota si usa la foto del tipo
  nella scheda *Tipologie*, oppure un disegno del tipo di equipment.
- **Dimensione display**: la sagoma dello schermo in scala, con la diagonale in pollici.

## Pubblicazione
Il workflow `.github/workflows/display-registry-pages.yml` pubblica la cartella su GitHub Pages
a ogni push su `main`. Per attivarlo vai su *Settings → Pages → Source: GitHub Actions*.
Prima di stampare le etichette definitive, imposta `publicBaseUrl` in `config.js` con l'URL
pubblico: è l'indirizzo che finisce dentro i QR.

Va bene anche qualunque altro hosting statico (Netlify, un server interno, una cartella condivisa via HTTP).

## Prova in locale
```
cd display-registry && python3 -m http.server 8000
```
