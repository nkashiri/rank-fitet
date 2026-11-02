[English](README.md) | **Italiano**

# FITET: andamento classifica atleti

Grafico dell'andamento in classifica (punti e posizione) di tutti gli atleti delle classifiche
nazionali maschile e femminile di tennistavolo (circa 8.900 uomini e 900 donne), con dati da [portale.fitet.org](https://portale.fitet.org).

**Pagina:** https://nkashiri.github.io/rank-fitet/

## Uso della pagina

- **Filtri:** Sesso (di default entrambi, oppure solo Maschile / Femminile), Settore (Seniores, Master, Giovanili, ...), Società, Regione e Categoria. Ognuno
  accetta più valori; il numero accanto a ogni valore indica quanti atleti aggiungerebbe con gli
  altri filtri. L'elenco delle società ha una casella di ricerca.
  Senza filtri la tabella elenca tutti (300 righe alla volta: **Mostra altri** per le successive).
- Alla prima visita la pagina si apre su Regione = Liguria; **Azzera filtri** toglie tutti i filtri.
- Filtri, atleti selezionati, metrica e periodo restano nell'indirizzo della pagina:
  salvalo tra i preferiti o condividilo per ritrovare la stessa vista.
- Il grafico parte vuoto: clicca sulle righe della tabella per aggiungere o togliere atleti,
  oppure usa **Top 8** per i primi 8 per punti tra quelli filtrati.
- **Punti / Posizione**: metrica del grafico (la posizione è quella nella classifica nazionale, maschile o femminile).
- **Periodo** (stagione in corso, dalla stagione scorsa, da tre stagioni fa, tutto): le colonne Δ
  indicano la variazione in quel periodo. I pulsanti seguono la stagione (dal 1° luglio) da soli.

## Aggiornamento dei dati

- **Automatico:** ogni lunedì alle 06:00 UTC (07:00 o 08:00 in Italia).
- **Manuale:** scheda [Actions](https://github.com/nkashiri/rank-fitet/actions) →
  **Aggiorna classifica** → **Run workflow**. La pagina è aggiornata in circa 3 minuti.
- **Modifiche al codice:** anche un push che modifica `fitet_liguria.js` o `template.html` aggiorna la pagina.
- Ogni aggiornamento salva anche `index.html` (l'elenco degli atleti, senza gli storici) nel
  repository: la cronologia dei commit "Aggiorna dati ..." conserva le versioni precedenti.

## File

- `fitet_liguria.js`: scarica i dati e genera la pagina.
- `template.html`: la pagina (grafico e tabella) in cui vengono inseriti i dati.
- `.github/workflows/update.yml`: aggiornamento settimanale e pubblicazione su GitHub Pages.
- `index.html`: l'ultima pagina generata (scritta dal workflow, non modificarla a mano).

## Uso locale (Node 18+, nessuna dipendenza)

```
node fitet_liguria.js                        # scrive site/index.html e site/storico/
node fitet_liguria.js out/index.html         # oppure un'altra cartella
node fitet_liguria.js --limit 200            # solo i primi 200 uomini e 200 donne (prova veloce)
```

La pagina carica gli storici da `storico/`, cosa che il browser non consente aprendo il file
direttamente: servi la cartella, es. `cd site && python3 -m http.server`, poi apri http://localhost:8000.

## Come vengono raccolti i dati

1. `menu.php`: l'ID dell'ultima classifica (`ID_CLASS`, il più alto nei link "Classifiche").
2. `risultati/new_rank/ranking_unica.php?SESSO=<M|F>&ID_CLASS=<id>&TIPO=1&page=<n>`: le classifiche
   generali maschile e femminile, 100 atleti per pagina (lo stesso elenco di `fpdf2/excel_classifica.php`, più
   l'ID dell'atleta). Servono le intestazioni `X-Requested-With: XMLHttpRequest` e `Referer`.
3. `risultati/new_rank/dettaglioatleta_unica.php?ATLETA=<id>&ID_CLASS=<id>&ZU=1&AVVERSARIO=0`, uno
   per atleta: "Riepilogo Dati" (Settore Agonistico, Societa' appartenenza) e la scheda "Storico
   Classifica" (data, posizione, punti, categoria).

La pagina contiene l'elenco degli atleti con i Δ di ogni periodo già calcolati; lo storico di ogni
atleta è un file a parte, `storico/<id>.json`, caricato solo quando l'atleta compare nel grafico,
così la pagina resta leggera (circa 2 MB, compressi da GitHub Pages) con qualsiasi filtro.

Il browser non può leggere direttamente portale.fitet.org (il sito non lo consente), per
questo i dati vengono raccolti dallo script e pubblicati con la pagina.

## Problemi

- **Il workflow fallisce:** apri la run nella scheda Actions e guarda il passo in rosso.
  Se fallisce "Scarica i dati", il portale FITET potrebbe essere irraggiungibile o aver
  cambiato struttura (vedi "Come vengono raccolti i dati"); riprova più tardi con Run workflow.
- **Un atleta non ha società o storico:** lo script elenca gli atleti la cui scheda non è stata
  scaricata nel log del passo "Scarica i dati" (`Failed`).
- **Gli aggiornamenti settimanali si fermano:** GitHub sospende i workflow programmati dopo
  60 giorni senza attività nel repository. I commit settimanali lo evitano, ma se succede
  basta riattivarlo dalla scheda Actions.
