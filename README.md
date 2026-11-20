# Display Registry

Schede tecniche delle console sul tavolo di test: linea e prodotto (Cardio/Strength, Run, Bike…),
display (pollici, risoluzione, pannello, optical bonding, touch), hardware (versione HW, CPU, RAM,
memoria, sistema operativo) e versione software installata.

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
   ha quattro schede: **Display** (una riga per console), **Prodotti** (Run, Bike…, con immagine
   facoltativa), **Ultime versioni** (ultima release per ogni software) e **Istruzioni**.
   Vai su *File → Condividi → Pubblica sul web*, pubblica *Display*, *Prodotti* e *Ultime versioni*
   in formato CSV e incolla i link in `config.js` (`dataUrl`, `typesUrl`, `latestVersionsUrl`). Le colonne aggiunte a destra compaiono da sole nella scheda del display.

Senza `latestVersionsUrl`, le ultime versioni si impostano in `config.js` → `latestVersions`.
Ogni display con una versione più vecchia viene segnalato come **"Da aggiornare"**.

## Specifiche dal sito
Le specifiche di console, display e connettività di ogni prodotto si prendono dalla sua pagina su
technogym.com con `tools/importa_prodotti.py`:

```
python3 tools/importa_prodotti.py https://www.technogym.com/it-IT/product/technogym-run_DGK0.html > prodotti.csv
```

Il CSV ha le colonne della scheda *Prodotti* del foglio. Le pagine nuove (es. Technogym Run) hanno
la sezione "Console and Display"; per quelle precedenti il display viene ricavato dal testo e la
colonna *Fonte* lo indica. Nella scheda del display, ogni cella vuota prende il valore del prodotto.

## Immagini
La scheda mostra una galleria con due viste:
- **Prodotto**: le immagini della colonna *Immagine prodotto* (anche più link separati da virgola;
  i link di Google Drive vengono convertiti in automatico). Se è vuota si usa l'immagine del prodotto
  nella scheda *Prodotti*, altrimenti un riquadro con il nome del prodotto.
- **Dimensione display**: la sagoma dello schermo in scala, con la diagonale in pollici.

## Pubblicazione
Il sito è pubblicato su https://franzpaolini.github.io/display-registry/ da GitHub Pages
(workflow `.github/workflows/pages.yml`) a ogni modifica del branch `main`.
I QR contengono `publicBaseUrl` (in `config.js`) più l'ID del display: non cambiarlo
dopo aver stampato le etichette.

## Prova in locale
```
python3 -m http.server 8000
```
