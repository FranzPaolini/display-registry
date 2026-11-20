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

  // Link CSV della scheda "Tipologie" del Google Sheet (opzionale):
  // una foto per ogni tipo di equipment. Senza, la scheda usa un'illustrazione disegnata.
  typesUrl: "",

  // Link CSV della scheda "Ultime versioni" del Google Sheet (opzionale).
  // Se impostato, sostituisce la lista latestVersions qui sotto.
  latestVersionsUrl: "",

  // Ultima versione rilasciata per ogni software (usata se latestVersionsUrl è vuoto).
  // Se un display ha una versione più vecchia viene segnalato "da aggiornare".
  latestVersions: {
    "Player": "4.3.0",
    "Kiosk": "2.1.4",
    "Signage CMS": "7.0.2"
  },

  // Dopo quanti giorni senza aggiornamento dei dati mostrare un avviso.
  staleAfterDays: 14,

  title: "Display Lab"
};
