// Configurazione del Display Registry.
// Modifica solo questo file per adattare l'app al tuo team.
window.REGISTRY_CONFIG = {
  // Da dove leggere i dati. Due opzioni:
  //  1) "data/devices.json"  -> file nel repo (si modifica da GitHub)
  //  2) URL di un Google Sheet pubblicato come CSV
  //     (File > Condividi > Pubblica sul web > formato CSV), es:
  //     "https://docs.google.com/spreadsheets/d/e/XXXX/pub?output=csv"
  dataUrl: "data/devices.json",

  // URL pubblico del sito (serve per generare i QR).
  // Lascia vuoto per usare automaticamente l'indirizzo corrente.
  publicBaseUrl: "https://franzpaolini.github.io/display-registry/",

  // Link CSV della scheda "Prodotti" del Google Sheet (opzionale):
  // un'immagine per ogni prodotto (Run, Bike…), usata quando il display non ha la sua.
  typesUrl: "data/prodotti.csv",

  // Link CSV della scheda "Ultime versioni" del Google Sheet (opzionale).
  // Se impostato, sostituisce la lista latestVersions qui sotto.
  latestVersionsUrl: "",

  // Ultima versione rilasciata per ogni software (usata se latestVersionsUrl è vuoto).
  // Se un display ha una versione più vecchia viene segnalato "da aggiornare".
  latestVersions: {
    "Console SW": "5.2.0",
    "Rower FW": "1.8.3"
  },

  // Dopo quanti giorni senza aggiornamento dei dati mostrare un avviso.
  staleAfterDays: 14,

  title: "Display Lab"
};
