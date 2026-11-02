[English](README.md) | **Italiano**

# FITET Liguria: andamento classifica atleti

Grafico dell'andamento in classifica (punti e posizione) degli atleti dei campionati
regionali liguri (C/2, D/1, D/2), con dati da [portale.fitet.org](https://portale.fitet.org).

**Pagina:** https://nkashiri.github.io/rank-fitet-liguria/

## Uso della pagina

- Il grafico parte vuoto: clicca sulle righe della tabella per aggiungere o togliere atleti,
  oppure usa **Top 8** per i primi 8 per punti tra quelli filtrati.
- **Punti / Posizione**: metrica del grafico (la posizione è quella nella classifica nazionale).
- **Stagione 26/27 / Da 25/26 / Da 23/24 / Tutto**: periodo mostrato; le colonne Δ indicano
  la variazione in quel periodo.
- Filtri per campionato, società e nome; le colonne della tabella sono ordinabili.

## Aggiornamento dei dati

- **Automatico:** ogni lunedì alle 06:00 UTC (07:00 o 08:00 in Italia).
- **Manuale:** scheda [Actions](https://github.com/nkashiri/rank-fitet-liguria/actions) →
  **Aggiorna classifica** → **Run workflow**. La pagina è aggiornata in circa 2 minuti.
- Ogni aggiornamento salva anche `index.html` nel repository: la cronologia dei commit
  "Aggiorna dati ..." conserva le versioni precedenti.

## Atleti extra (non presenti nei campionati liguri)

Sono elencati in `atleti_extra.txt`, uno per riga: `COGNOME NOME (gg/mm/aaaa)`.

- **Aggiungere:** nella pagina, scrivi il nome in "Aggiungi un atleta" e clicca
  **Aggiungi atleta**; si apre GitHub con la richiesta già compilata: clicca **Create**.
  Dopo circa 3 minuti l'atleta compare in tabella con l'etichetta "Extra".
- **Rimuovere:** link **rimuovi** accanto a "Extra" nella riga dell'atleta, poi **Create**.
- La risposta nella issue dice se l'operazione è riuscita. In caso di omonimi elenca le date
  di nascita: riprova con `COGNOME NOME gg/mm/aaaa`.
- Si può anche modificare `atleti_extra.txt` direttamente su GitHub (matita → Commit):
  vale dal prossimo aggiornamento.
- Solo il proprietario e i collaboratori del repository possono aggiungere o rimuovere
  atleti; le richieste di altri utenti vengono ignorate.

## File

- `fitet_liguria.js`: scarica i dati e genera la pagina.
- `template.html`: la pagina (grafico e tabella) in cui vengono inseriti i dati.
- `atleti_extra.txt`: atleti aggiuntivi.
- `.github/workflows/update.yml`: aggiornamento settimanale e pubblicazione su GitHub Pages.
- `.github/workflows/extra.yml`: gestisce le richieste "Aggiungi:" / "Rimuovi:" aperte dalla pagina.
- `index.html`: l'ultima pagina generata (scritta dal workflow, non modificarla a mano).

## Uso locale (Node 18+, nessuna dipendenza)

```
node fitet_liguria.js                         # scrive fitet_liguria.html
node fitet_liguria.js out.html                # oppure un altro file
node fitet_liguria.js --add "ROSSI MARIO"     # aggiunge un atleta ad atleti_extra.txt
node fitet_liguria.js --remove "ROSSI MARIO"  # lo rimuove
```

Nella copia locale il pulsante "Aggiungi atleta" non compare (serve GitHub).

## Cambio di stagione

All'inizio di ogni stagione (luglio) controllare:

1. **Numeri dei campionati** (`CAMS` in cima a `fitet_liguria.js`, oggi 301–307): sono il
   parametro `CAM=` dei link dei campionati liguri su portale.fitet.org
   (es. `risultati/campionati/campionati.php?CAM=301`). Possono cambiare da una stagione
   all'altra; qui si possono anche aggiungere altri campionati (femminili, altre serie).
2. **Pulsanti del periodo** in `template.html` (`id="range"`): etichette e date di inizio
   stagione, es. `data-v="2026-07-01"` → `2027-07-01` e "Stagione 27/28".

## Come vengono raccolti i dati

1. `risultati/campionati/statistiche_atleti.php?CAM=<n>`: atleti di ogni campionato
   (nome, società, incontri vinti/persi). Il titolo viene da `testa_campionati.php`.
2. `ajax.php?term=<nome>`: la ricerca di "Ricerca e verifica attività atleta", per trovare
   l'ID dell'atleta (con le intestazioni `X-Requested-With: XMLHttpRequest` e `Referer`).
   Per gli omonimi si sceglie quello che gioca nel campionato; se lo stesso atleta ha due
   tessere, quella presente nella classifica attuale.
3. `scheda_unica_i.php?ATLETA=<id>`: scheda dell'atleta (tessera, società, ID della classifica).
4. `risultati/new_rank/dettaglioatleta_unica.php?ATLETA=<id>&ID_CLASS=<c>`: scheda
   "Storico Classifica" (data, posizione, punti, categoria). Per gli atleti non classificati
   ("FQ") si usa l'ultima classifica elencata in `menu.php`.

Il browser non può leggere direttamente portale.fitet.org (il sito non lo consente), per
questo i dati vengono raccolti dallo script e inseriti nella pagina.

## Problemi

- **Il workflow fallisce:** apri la run nella scheda Actions e guarda il passo in rosso.
  Se fallisce "Scarica i dati", il portale FITET potrebbe essere irraggiungibile o aver
  cambiato struttura (vedi "Come vengono raccolti i dati"); riprova più tardi con Run workflow.
- **Un atleta del campionato manca o non ha storico:** lo script stampa i nomi non trovati
  nel log del passo "Scarica i dati" (`Not resolved`).
- **Gli aggiornamenti settimanali si fermano:** GitHub sospende i workflow programmati dopo
  60 giorni senza attività nel repository. I commit settimanali lo evitano, ma se succede
  basta riattivarlo dalla scheda Actions.
