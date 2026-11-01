# FITET Liguria: andamento classifica atleti

Grafico dell'andamento in classifica (punti e posizione) degli atleti dei campionati
regionali liguri (C/2, D/1, D/2), con dati da [portale.fitet.org](https://portale.fitet.org).

- `fitet_liguria.js`: scarica le statistiche atleti dei campionati (CAM 301–307) e lo
  storico classifica di ogni atleta, poi genera la pagina HTML.
- `template.html`: la pagina (grafico e tabella) in cui vengono inseriti i dati.
- `.github/workflows/update.yml`: ogni lunedì rigenera la pagina e la pubblica su GitHub Pages.

Uso locale (Node 18+):

```
node fitet_liguria.js            # scrive fitet_liguria.html
node fitet_liguria.js out.html   # oppure un altro file
```
