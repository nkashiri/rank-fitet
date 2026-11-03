[English](README.md) | **Italiano**

# FITET: andamento classifica atleti

Grafico dell'andamento in classifica (punti e posizione) di tutti gli atleti delle classifiche
nazionali maschile e femminile di tennistavolo (circa 8.900 uomini e 900 donne), con dati da [portale.fitet.org](https://portale.fitet.org).

**Pagina:** https://nkashiri.github.io/rank-fitet/

## Uso della pagina

- **Filtri:** Sesso (di default entrambi, oppure solo Maschile / Femminile), Settore (Seniores, Master, Giovanili, ...), Società, Regione, Categoria ed
  Elenco (classifiche nazionali o atleti extra). Ognuno
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
  I punti si azzerano ogni 1° luglio, quindi Δ Punti su più stagioni mescola scale diverse;
  Δ Pos. è confrontabile tra stagioni.
- **Distribuzione dei punti:** istogramma dei punti attuali degli atleti filtrati; una linea colorata
  indica ogni atleta selezionato, elencato sotto con posizione e percentile nel gruppo.
- **Altre colonne:** **% vitt.** (percentuale di vittorie nella stagione; vinte e perse nel tooltip) e
  **Miglior pos.** (record in classifica, con l'anno; la data è nel tooltip).
  **#** numera le righe nell'ordine attuale della tabella: è la posizione tra gli atleti filtrati.
- **Per data / Per età / Per anni in classifica:** l'asse orizzontale del grafico. *Per età* allinea gli atleti
  per età anagrafica (data della classifica − data di nascita), per confrontare un dodicenne di oggi con quello
  che un atleta più grande faceva a 12 anni; *Per anni in classifica* li allinea per anni dalla prima classifica
  (lo storico del portale inizia a luglio 2011). Entrambi mostrano tutto lo storico. Se tra gli atleti selezionati
  ci sono più di 3 anni di differenza, un avviso propone il confronto per età.
- **Grafico Posizione:** linee orizzontali tratteggiate dove cambia la categoria (1ª … 6ª maschile, 1ª … 5ª femminile),
  stimate dalla classifica attuale: la posizione che separa meglio due categorie, dato che le categorie sono
  assegnate a inizio stagione e poi si sovrappongono. I triangoli indicano i passaggi di categoria
  (▲ verde in salita, ▼ rosso in discesa). **Proiezione 12 mesi** disegna la proiezione puntinata dei prossimi 12 mesi.
- **Analisi della posizione** (sotto il grafico, per uno degli atleti selezionati):
  - miglioramento mese per mese, migl. % = (pos. precedente − pos. attuale) / pos. precedente × 100,
    con l'ultima classifica di ogni mese (un intervallo di più mesi è diviso in parti uguali);
  - medie mobili a 6 e 12 mesi, con la media totale tratteggiata;
  - **Previsione:** mesi per arrivare a una posizione obiettivo (10° di default) con il ritmo attuale,
    mesi = log(obiettivo / partenza) / log(1 − ritmo), con ritmo = media degli ultimi 12 mesi;
    inoltre il trend lineare degli ultimi 12 mesi (posizioni al mese) con l'R².
    La proiezione nel grafico usa lo stesso ritmo;
  - anno per anno: media % mensile, posizione di inizio e fine, guadagno e posizione migliore;
  - l'elenco dei passaggi di categoria.

## Aggiornamento dei dati

- **Automatico:** ogni lunedì alle 06:00 UTC (07:00 o 08:00 in Italia).
- **Manuale:** scheda [Actions](https://github.com/nkashiri/rank-fitet/actions) →
  **Aggiorna classifica** → **Run workflow**. La pagina è aggiornata in circa 3 minuti.
- **Modifiche al codice:** anche un push che modifica `fitet.js`, `template.html` o `atleti_extra.txt` aggiorna la pagina.
- Ogni aggiornamento salva anche `index.html` (l'elenco degli atleti, senza gli storici) nel
  repository: la cronologia dei commit "Aggiorna dati ..." conserva le versioni precedenti.

## Atleti extra (non presenti nelle classifiche nazionali)

Gli stranieri ("Atleta Straniero") hanno punti e storico ma nessuna posizione nazionale, quindi non sono
nelle classifiche da cui è costruita la pagina. Questi atleti sono elencati in `atleti_extra.txt`, uno per
riga: `COGNOME NOME (gg/mm/aaaa)`. In tabella hanno l'etichetta "extra" e, in corsivo, una posizione
fittizia (≈): quella che avrebbe avuto un italiano con gli stessi punti, a ogni data di classifica. Anche il grafico
e l'analisi la usano, segnalata come stimata.

- **Aggiungere:** nella pagina, scrivi il nome in "Aggiungi un atleta" e clicca
  **Aggiungi atleta**; si apre GitHub con la richiesta già compilata: clicca **Create**.
  Dopo circa 3 minuti l'atleta compare in tabella.
- **Rimuovere:** clicca la **×** rossa accanto a "extra" nella riga dell'atleta, poi **Create**.
- La risposta nella issue dice se l'operazione è riuscita. In caso di omonimi elenca le date
  di nascita: riprova con `COGNOME NOME gg/mm/aaaa`.
- Si può anche modificare `atleti_extra.txt` direttamente su GitHub (matita → Commit): la pagina si aggiorna.
- Solo il proprietario e i collaboratori del repository possono aggiungere o rimuovere
  atleti; le richieste di altri utenti vengono ignorate.

## File

- `fitet.js`: scarica i dati e genera la pagina.
- `template.html`: la pagina (grafico e tabella) in cui vengono inseriti i dati.
- `atleti_extra.txt`: atleti aggiuntivi.
- `.github/workflows/extra.yml`: gestisce le richieste "Aggiungi:" / "Rimuovi:" aperte dalla pagina.
- `.github/workflows/update.yml`: aggiornamento settimanale e pubblicazione su GitHub Pages.
- `index.html`: l'ultima pagina generata (scritta dal workflow, non modificarla a mano).

## Uso locale (Node 18+, nessuna dipendenza)

```
node fitet.js                        # scrive site/index.html e site/storico/
node fitet.js out/index.html         # oppure un'altra cartella
node fitet.js --limit 200            # solo i primi 200 uomini e 200 donne (prova veloce)
node fitet.js --add "ROSSI MARIO"    # aggiunge un atleta ad atleti_extra.txt
node fitet.js --remove "ROSSI MARIO" # lo rimuove
```

Nella copia locale il modulo "Aggiungi atleta" non compare (serve GitHub).

La pagina carica gli storici da `storico/`, cosa che il browser non consente aprendo il file
direttamente: servi la cartella, es. `cd site && python3 -m http.server`, poi apri http://localhost:8000.

## Come vengono raccolti i dati

1. `menu.php`: l'ID dell'ultima classifica (`ID_CLASS`, il più alto nei link "Classifiche").
2. `risultati/new_rank/ranking_unica.php?SESSO=<M|F>&ID_CLASS=<id>&TIPO=1&page=<n>`: le classifiche
   generali maschile e femminile, 100 atleti per pagina (lo stesso elenco di `fpdf2/excel_classifica.php`, più
   l'ID dell'atleta). Servono le intestazioni `X-Requested-With: XMLHttpRequest` e `Referer`.
3. `risultati/new_rank/dettaglioatleta_unica.php?ATLETA=<id>&ID_CLASS=<id>&ZU=1&AVVERSARIO=0`, uno
   per atleta: "Riepilogo Dati" (Settore Agonistico, Societa' appartenenza, Record classifica, partite
   giocate/vinte/perse nella stagione) e la scheda "Storico
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
