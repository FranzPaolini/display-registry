#!/usr/bin/env python3
"""Importa dal sito Technogym le specifiche di console, display e connettività di uno o più prodotti.

Uso:
    python3 importa_prodotti.py URL [URL ...] > prodotti.csv

Per ogni pagina prodotto legge solo cosa riguarda console, display e hardware
(non dimensioni, dati elettrici o di allenamento), la prima immagine della galleria e il nome.
Il CSV ha le stesse colonne della scheda "Prodotti" del Google Sheet: si incolla direttamente lì.

Il sito ha due modelli di pagina:
- nuovo (es. Technogym Run): sezioni "Console and Display" e "Connectivity" con voce e valore;
- precedente (es. Run Personal, Ride): il display è citato solo nel testo delle caratteristiche,
  quindi si ricavano pollici, tipo di pannello e touch da lì e si segnala nella colonna Fonte.
"""
import csv
import html
import re
import sys
import urllib.request

COLUMNS = ["Prodotto", "Tipo", "Pagina sito", "Immagine", "Tipo console", "Pollici", "Pannello",
           "Touch", "Cardiofrequenza", "RAM", "Audio", "Rete", "Lettore NFC", "Connessioni esterne",
           "Apple GymKit", "Descrizione", "Fonte"]

# Voce sul sito -> colonna del foglio
FIELDS = {
    "console type": "Tipo console",
    "heart rate monitoring": "Cardiofrequenza",
    "display": "RAM",
    "sound system": "Audio",
    "wi-fi": "Rete",
    "nfc (rfid) reader": "Lettore NFC",
    "ext. device connectivity": "Connessioni esterne",
    "apple gymkit compatibility": "Apple GymKit",
}
SECTIONS = ("console and display", "connectivity")
CARDIO = r"tapis|treadmill|bike|ellittic|vogator|rower|stepper|climb|cardio|run"
STRENGTH = r"forza|strength|panca|bilanciere|leg press|chest|cable|pesi"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 "
      "(KHTML, like Gecko) Version/17.0 Safari/605.1.15")


def text(fragment):
    fragment = re.sub(r"<style[\s\S]*?</style>", " ", fragment)
    out = html.unescape(re.sub(r"<[^>]+>", "\n", fragment)).replace("®", "")
    return [t.strip() for t in out.split("\n") if t.strip()]


def clean(column, value):
    value = re.sub(r"\s+", " ", value).strip()
    if column == "RAM":
        value = re.sub(r"(?i)^ram:\s*", "", value)
        value = re.sub(r"(?i)(\d)\s*gb", r"\1 GB", value)
    if column == "Audio":
        value = re.sub(r"(?i)^potenza del sistema audio integrato:\s*", "", value)
    return value


def from_description(page, row):
    """Modello precedente: cerca nel testo la frase che descrive schermo o console."""
    body = re.sub(r"<style[\s\S]*?</style>|<script[\s\S]*?</script>", " ", page)
    sentences = [s for s in text(body) if re.search(r"(?i)\b(display|schermo|console|touchscreen)\b", s)
                 and re.search(r"\d+(?:[.,]\d+)?\s*(?:\"|”|″|'')", s)]
    if not sentences:
        return
    s = sentences[0]
    row["Pollici"] = re.search(r"(\d+(?:[.,]\d+)?)\s*(?:\"|”|″|'')", s).group(1).replace(".", ",")
    if re.search(r"(?i)\bLCD\b", s):
        row["Pannello"] = "LCD"
    if re.search(r"(?i)touch", s):
        row["Touch"] = "Sì"
    if re.search(r"(?i)full\s*hd", s):
        row["Tipo console"] = f'{row["Pollici"]}" Full HD' + (" touch" if row["Touch"] else "")
    else:
        row["Tipo console"] = f'{row["Pollici"]}"' + (" LCD" if row["Pannello"] else "") + (" touch" if row["Touch"] else "")
    row["Fonte"] = "Testo della pagina: " + s[:180]


def parse(url, page):
    row = dict.fromkeys(COLUMNS, "")
    row["Pagina sito"] = url
    title = re.search(r"<h1[^>]*>([\s\S]*?)</h1>", page)
    if title:
        parts = text(title.group(1))
        row["Prodotto"] = parts[0] if parts else ""
        row["Descrizione"] = parts[1].capitalize() if len(parts) > 1 else ""
    hint = (row["Prodotto"] + " " + row["Descrizione"]).lower()
    row["Tipo"] = "Strength" if re.search(STRENGTH, hint) else "Cardio" if re.search(CARDIO, hint) else ""
    gallery = (re.search(r"https://[^\"'\s>]+?-gallery01\.jpg", page)
               or re.search(r"https://webapi-prod\.technogym\.com/dw/image/[^\"'\s>]+?/product/[^\"'\s>]+?\.jpg", page))
    if gallery:
        row["Immagine"] = gallery.group(0)

    # Modello nuovo: <h2>Sezione</h2> seguito da coppie voce/valore
    for match in re.finditer(r"<h2[^>]*>([^<]+)</h2>([\s\S]*?)(?=<h2|$)", page):
        if match.group(1).strip().lower() not in SECTIONS:
            continue
        pairs = re.findall(r"<div class=\"css-[a-z0-9]+\">([^<]*)</div>\s*<div class=\"css-[a-z0-9]+\">([^<]*)</div>",
                           match.group(2))
        for label, value in pairs:
            column = FIELDS.get(html.unescape(label).replace("®", "").strip().lower())
            if column:
                row[column] = clean(column, html.unescape(value))
    if row["Tipo console"]:
        size = re.search(r"(\d+(?:[.,]\d+)?)\s*\"", row["Tipo console"])
        row["Pollici"] = size.group(1).replace(".", ",") if size else ""
        row["Touch"] = "Sì" if "touch" in row["Tipo console"].lower() else ""
        row["Fonte"] = "Sezione Console and Display del sito"
    else:
        from_description(page, row)
    if not row["Fonte"]:
        row["Fonte"] = "Specifiche della console non presenti sul sito"
    return row


def main(urls):
    writer = csv.DictWriter(sys.stdout, fieldnames=COLUMNS)
    writer.writeheader()
    for url in urls:
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "it-IT,it;q=0.9"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            page = resp.read().decode("utf-8", "ignore")
        writer.writerow(parse(url, page))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1:])
