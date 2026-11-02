# FITET Liguria: andamento classifica atleti

Grafico dell'andamento in classifica (punti e posizione) degli atleti dei campionati
regionali liguri (C/2, D/1, D/2), con dati da [portale.fitet.org](https://portale.fitet.org).

- `fitet_liguria.js`: scarica le statistiche atleti dei campionati (CAM 301–307) e lo
  storico classifica di ogni atleta, poi genera la pagina HTML.
- `template.html`: la pagina (grafico e tabella) in cui vengono inseriti i dati.
- `atleti_extra.txt`: altri atleti da includere, uno per riga (`COGNOME NOME (gg/mm/aaaa)`).
- `.github/workflows/update.yml`: ogni lunedì rigenera la pagina e la pubblica su GitHub Pages.
- `.github/workflows/extra.yml`: il pulsante "Aggiungi atleta" della pagina apre una issue
  `Aggiungi: COGNOME NOME` (o `Rimuovi: ...`); il workflow aggiorna `atleti_extra.txt`,
  rigenera la pagina e risponde nella issue. Funziona solo per il proprietario e i collaboratori.

Uso locale (Node 18+):

```
node fitet_liguria.js            # scrive fitet_liguria.html
node fitet_liguria.js out.html   # oppure un altro file
node fitet_liguria.js --add "ROSSI MARIO"      # aggiunge un atleta ad atleti_extra.txt
node fitet_liguria.js --remove "ROSSI MARIO"   # lo rimuove
```
