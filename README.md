# Display Registry

Schede tecniche delle console sul tavolo di test, raggiungibili da un QR sull'etichetta.
Sito: https://franzpaolini.github.io/display-registry/

- `index.html`: elenco; `?id=DSP-001` apre la scheda del display (è l'indirizzo dentro il QR).
- `labels.html`: etichette QR da stampare. Il QR contiene solo l'ID: non cambiare gli ID dopo la stampa.
- `data/devices.json`: le console (una per riga). `data/prodotti.csv`: i prodotti, con i dati presi dal sito.
- `config.js`: indirizzo pubblico per i QR e, se si vuole leggere il Google Sheet, i link CSV
  (`dataUrl`, `typesUrl`, `latestVersionsUrl`).
- `tools/importa_prodotti.py URL…`: legge dal sito Technogym le specifiche di console e display di un prodotto.

Regola dei dati: per ciò che c'è sul tavolo vale la tab Display; dal sito arrivano solo touch, audio,
cardiofrequenza, connettività, descrizione, immagine e link. Un valore in Display ha sempre la precedenza.
Il prodotto di una console si trova unendo Linea e Prodotto (Skill + Run = Skillrun).

Pubblicazione: ogni push su `main` aggiorna il sito (GitHub Pages, `.github/workflows/pages.yml`).
Prova in locale: `python3 -m http.server 8000`.
