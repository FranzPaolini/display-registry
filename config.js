// Configurazione del Display Registry.
// Modifica solo questo file per adattare l'app al tuo team.
window.REGISTRY_CONFIG = {
  // Link CSV delle tab del Google Sheet (File > Condividi > Pubblica sul web > scegli la tab > CSV).
  // Con i link impostati il sito segue il foglio da solo (aggiornamento entro pochi minuti).
  // Se un link è vuoto o non risponde, si usano i file nel repo (data/devices.json, data/prodotti.csv).
  dataUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5Ow2q0slAwFpgu-26XCxMza7EKwznmw36SbuOwGfahLK-8GS4F0atihiDpqUpiwPFQwfnN8w_3hGD/pub?gid=0&single=true&output=csv",   // tab Display

  // URL pubblico del sito (serve per generare i QR).
  // Lascia vuoto per usare automaticamente l'indirizzo corrente.
  publicBaseUrl: "https://franzpaolini.github.io/display-registry/",

  // Tab Prodotti: foto e specifiche prese dal sito Technogym, una riga per prodotto.
  typesUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5Ow2q0slAwFpgu-26XCxMza7EKwznmw36SbuOwGfahLK-8GS4F0atihiDpqUpiwPFQwfnN8w_3hGD/pub?gid=4&single=true&output=csv",

  // Tab Ultime versioni (opzionale). Se impostato, sostituisce la lista latestVersions qui sotto.
  latestVersionsUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5Ow2q0slAwFpgu-26XCxMza7EKwznmw36SbuOwGfahLK-8GS4F0atihiDpqUpiwPFQwfnN8w_3hGD/pub?gid=1&single=true&output=csv",

  // Ultima versione rilasciata per ogni software (usata se latestVersionsUrl è vuoto).
  // Se un display ha una versione più vecchia viene segnalato "da aggiornare".
  latestVersions: {},

  // Dopo quanti giorni senza aggiornamento dei dati mostrare un avviso.
  staleAfterDays: 14,

  title: "Display Lab"
};
