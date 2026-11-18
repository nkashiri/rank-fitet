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
- Clicca sulle righe della tabella (o seleziona una riga con Tab e premi Invio) per aggiungere o togliere atleti
  dal grafico, oppure usa **Top 8** per i primi 8 per punti tra quelli filtrati. Alla prima visita il grafico
  mostra i primi 8 della regione predefinita.
- **Scheda dell'atleta (ⓘ accanto al nome):** punti, posizione e variazione nel periodo scelto, categoria,
  variazione dall'ultima classifica, % vittorie, miglior posizione; la posizione per punti tra i nati nello stesso
  anno, nella società, in regione, in categoria e nel settore (stesso sesso); la distanza dalle soglie stimate della
  categoria superiore e inferiore. **Condividi** condivide il link (o lo copia), che riapre la scheda con l'atleta
  nel grafico.
  La scheda elenca anche le **partite della stagione** (campionato e tornei, dal portale), con le migliori vittorie e
  le sconfitte più pesanti (secondo i punti dell'avversario alla classifica precedente la partita), e un **Confronto
  diretto** con un atleta selezionato o un avversario della stagione: i dati principali affiancati e gli scontri della
  stagione.
- **Chi sale e chi scende:** i 10 maggiori progressi e i 10 maggiori cali tra gli atleti filtrati, dall'ultima
  classifica o in uno dei periodi (pulsanti nel riquadro). Di base sono ordinati per variazione assoluta (punti o
  posizioni guadagnati o persi); **Percentuale** li ordina invece per variazione percentuale,
  (iniziale − attuale) / iniziale, così un salto in alto conta quanto uno più lungo in basso.
  Clicca su un nome per la scheda.
- **Scheda società e regione:** scegli una sola società in Società (o una sola regione in Regione) per un riquadro con
  numero di atleti, punti medi, età media, % vittorie, i migliori e i più in crescita, e i conteggi per categoria e
  settore. La scheda regione classifica anche le sue società per forza (somma dei punti dei 4 atleti migliori);
  clicca su una società per la sua scheda.
- **Per stagione:** asse del grafico con una linea per stagione dell'atleta scelto nell'analisi, allineate al 1° luglio
  (i punti ripartono ogni 1° luglio, quindi le stagioni sono confrontabili); si vedono le ultime 5, le più vecchie nella
  legenda.
- **Fascia della proiezione:** con Proiezione 12 mesi il grafico Posizione mostra anche una fascia colorata: dove sono
  arrivati dopo 1–12 mesi gli atleti dello stesso sesso, fascia d'età e livello, nelle ultime 5 stagioni (più scura
  25–75% dei casi, più chiara 10–90%). Il riquadro Previsione dell'analisi riporta gli stessi valori a 12 mesi.
- **Zoom / Sposta** (pulsanti con icona sopra il grafico, per tutti i grafici): con **Zoom** trascina un'area per
  ingrandire (Maiusc+trascina per spostarti), con **Sposta** trascina per spostarti; Ctrl+rotella ingrandisce in
  entrambi i casi. Clicca di nuovo il pulsante attivo per spegnerlo. Doppio clic o **Reimposta zoom** per tornare
  indietro. Con il mouse Zoom è attivo all'inizio e cambiando strumento lo zoom resta. Sul telefono partono spenti,
  così la pagina scorre normalmente: Zoom attiva lo zoom con due dita, Sposta anche il trascinamento con un dito
  (cambiando strumento i grafici vengono ridisegnati).
- **Download:** **Scarica PNG** salva il grafico principale come immagine; **Scarica CSV** (sotto la tabella) salva
  tutti gli atleti filtrati nell'ordine della tabella, per Excel (punto e virgola, virgola decimale).
- **Punti / Posizione**: metrica del grafico (la posizione è quella nella classifica nazionale, maschile o femminile).
  La seguono anche le analisi (Chi sale e chi scende, schede società e regione, confronto diretto, grafico mese per mese
  dell'analisi), ma i punti si azzerano ogni 1° luglio, quindi usano i punti solo nella stagione in corso: sui periodi
  più lunghi, e per proiezione a 12 mesi, medie mobili, anno per anno e previsione, usano la posizione, e la pagina lo
  segnala.
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

Scaricare i dati e generare le pagine sono passi separati: i dati sono salvati nel **branch `data`** e le pagine
vengono generate da lì. Una modifica alle pagine o agli script non riscarica niente.

- **Classifiche ("Aggiorna classifica"):** in automatico il 1° di ogni mese alle 06:00 UTC (07:00 o 08:00 in Italia);
  la FITET pubblica una nuova classifica circa una volta al mese. Salva i nuovi dati nel branch `data`, poi pubblica il sito.
- **Gomme e telai ("Aggiorna materiali"):** il 1° di ogni mese alle 07:00 UTC, in modo indipendente: se una fonte
  non risponde, l'altra viene aggiornata lo stesso.
- **A mano:** scheda [Actions](https://github.com/nkashiri/rank-fitet/actions) → il workflow → **Run workflow**.
- **Pagine e script ("Pubblica sito"):** un push che modifica `template.html`, `materiali.html`, `fitet.js`,
  `revspin.js`, `og.png` o `CNAME` rigenera e pubblica il sito dai dati salvati in circa un minuto.
- **Storico:** ogni aggiornamento è un commit nel branch `data` ("Classifica ...", "Materiali ..."), quindi i dati
  precedenti restano.
- **Controllo di sicurezza:** un aggiornamento non salva se lo scraping ha meno del 90% degli atleti (o prodotti) dei
  dati salvati, o se è fallito più del 2% (almeno 50) delle pagine degli atleti. Il workflow fallisce, GitHub manda
  un'email al proprietario del repository e il sito resta com'era. Per salvare comunque, eseguire lo script con
  `FORCE=1` (nel workflow: aggiungere `FORCE: 1` all'`env` del passo di download, eseguire, poi toglierlo).

## Piè di pagina: aggiornamenti e visite

- Il piè di pagina mostra quando sono stati aggiornati i dati (data e ora dello scaricamento) e quando è stato
  modificato l'ultima volta il codice della pagina (`template.html`, dall'API di GitHub al momento della generazione).
- **Visite:** contate con [Abacus](https://abacus.jasoncameron.dev), un servizio gratuito che non richiede un account:
  una visita per browser al giorno, solo sul sito pubblicato (non nelle copie locali), con quelle di oggi tra parentesi.
  Il conteggio parte dall'08/11/2026. È un servizio amatoriale gratuito: se smette di rispondere, il contatore
  semplicemente non compare. Il contatore è su `abacus.jasoncameron.dev/get/nkashiri-rank-fitet/visite`.

## Telefoni e anteprime dei link

- La pagina si adatta ai telefoni: filtri due per riga, gruppi di pulsanti scorrevoli, grafico più basso e meno
  colonne in tabella (i dati completi sono nella scheda dell'atleta).
- I link condivisi su WhatsApp, Facebook, Telegram ecc. mostrano un'anteprima con `og.png` (1200×630). Per
  cambiare l'immagine, sostituisci `og.png` nel repository: il prossimo aggiornamento la pubblica.

## Stranieri e atleti extra (non presenti nelle classifiche nazionali)

Gli stranieri hanno punti e storico ma nessuna posizione nazionale. La pagina li include tutti in automatico,
dagli elenchi "Stranieri" del portale (maschile e femminile); il filtro "Elenco" può mostrare solo loro. Hanno, in
corsivo, una posizione fittizia (≈): quella che avrebbe avuto un italiano con gli stessi punti, a ogni data di
classifica. Anche il grafico e l'analisi la usano, segnalata come stimata.

Altri atleti che non sono in nessuno dei due elenchi (es. uno straniero non più negli elenchi Stranieri) si possono
elencare in `atleti_extra.txt`, uno per riga: `COGNOME NOME (gg/mm/aaaa)`. In tabella hanno l'etichetta "extra".

- **Aggiungere:** nella pagina, scrivi il nome in "Aggiungi un atleta" e clicca
  **Aggiungi atleta**; si apre GitHub con la richiesta già compilata: clicca **Create**.
  Dopo circa 3 minuti l'atleta compare in tabella.
- **Rimuovere:** clicca la **×** rossa accanto a "extra" nella riga dell'atleta, poi **Create**.
- La risposta nella issue dice se l'operazione è riuscita. In caso di omonimi elenca le date
  di nascita: riprova con `COGNOME NOME gg/mm/aaaa`.
- Si può anche modificare `atleti_extra.txt` direttamente su GitHub (matita → Commit), poi avviare "Aggiorna classifica" per aggiornare la pagina.
- Solo il proprietario e i collaboratori del repository possono aggiungere o rimuovere
  atleti; le richieste di altri utenti vengono ignorate.

## Sottopagina gomme e telai

**Pagina:** https://nkashiri.github.io/rank-fitet/materiali/ (link "Gomme e telai" nell'intestazione della pagina principale)

Le valutazioni degli utenti di [revspin.net](https://revspin.net) per gomme e telai, da filtrare e confrontare.
Sono inclusi solo i modelli con almeno 10 valutazioni (la soglia delle classifiche di revspin):
circa 600 gomme e 560 telai.

- **IT / EN** (intestazione) passa la pagina dall'italiano all'inglese. La scelta viene ricordata e resta
  nell'indirizzo (`#l=en`), così un link condiviso si apre nella stessa lingua; senza scelta decide la lingua del browser.
- **ⓘ** accanto a ogni parametro (intestazioni della tabella, pannello Parametri, tabella di confronto) lo spiega, con
  le scale di revspin dove ci sono (adesività, durezza della spugna in gradi, angolo di uscita): al passaggio del
  mouse, o con un tocco sul telefono.
- **Gomme / Telai** passa da gomme a telai; la casella di ricerca filtra per nome.
- **Filtri:** Marca; per le gomme Tipo (tensor, non tensor, anti); per i telai Strati e Materiali (famiglia di fibre,
  dai materiali dichiarati: Carbonio, Arylate, Zylon, Kevlar, altre fibre, solo legno);
  **Parametri** imposta minimo e/o massimo di ogni valutazione, del numero di valutazioni, del prezzo e del peso del telaio.
- **Tabella:** clic su un'intestazione per ordinare; il colore di ogni colonna è relativo al suo intervallo.
  Il link ↗ apre il modello su revspin.net.
- **Confronto:** clic su fino a 6 righe per confrontarle in un grafico radar e in una tabella affiancata (evidenziato
  il valore migliore dove "più è meglio"). I pulsanti sotto il radar scelgono gli assi. I modelli confrontati
  restano nell'indirizzo (es. `materiali/#gomme=...`), così un confronto si può condividere.

Dati: `revspin.js` legge gli elenchi completi di revspin (marche), le classifiche (tutte le valutazioni, 100 per
pagina) e, una volta per modello, la scheda prodotto per i dati del produttore (peso, strati e materiali dei telai;
tensor/anti delle gomme), salvati in `dettagli.json` (branch `data`): ogni mese scarica solo i modelli nuovi.
Le valutazioni sono salvate in `materiali.json` (branch `data`) dal loro workflow, "Aggiorna materiali".

```
node revspin.js --fetch              # scarica in data/materiali.json (e data/dettagli.json)
node revspin.js --build              # scrive site/materiali/index.html da data/, senza scaricare
node revspin.js --fetch --limit 20   # scarica al massimo 20 schede nuove (prova veloce)
```

## File

Branch `main` (codice e pagine):

- `fitet.js`: scarica le classifiche (`--fetch`) e genera la pagina (`--build`).
- `template.html`: la pagina (grafico e tabella) in cui vengono inseriti i dati.
- `revspin.js`, `materiali.html`: lo stesso per la sottopagina gomme e telai.
- `atleti_extra.txt`: atleti aggiuntivi.
- `og.png`: l'immagine delle anteprime dei link.
- `.github/workflows/update.yml`: aggiornamento mensile (o manuale) delle classifiche.
- `.github/workflows/materiali.yml`: aggiornamento mensile (o manuale) di gomme e telai.
- `.github/workflows/build.yml`: genera le pagine dai dati salvati e le pubblica su GitHub Pages.
- `.github/workflows/extra.yml`: gestisce le richieste "Aggiungi:" / "Rimuovi:" aperte dalla pagina.

Branch `data` (scritto dai workflow, non modificarlo a mano):

- `fitet.json`: l'elenco degli atleti e le statistiche della pagina.
- `storico/<id>.json` (storico della classifica) e `partite/<id>.json` (partite della stagione) per ogni atleta,
  copiati accanto alla pagina pubblicata.
- `materiali.json`, `dettagli.json`: le valutazioni di gomme e telai e la cache dei dati dei produttori.

## Uso locale (Node 18+, nessuna dipendenza)

Gli script leggono e scrivono i dati in `data/`. Per lavorare sulle pagine con i dati pubblicati, prima
estrarre lì il branch `data`:

```
git fetch origin data && git worktree add data data   # i dati pubblicati in data/
node fitet.js --build                # scrive site/index.html (+ storico/, partite/) da data/, senza scaricare
node revspin.js --build              # scrive site/materiali/index.html
node fitet.js --fetch                # scarica le classifiche in data/ (circa 10 minuti)
node fitet.js                        # entrambi
node fitet.js --fetch --limit 200    # solo i primi 200 di ogni elenco (prova veloce)
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
   l'ID dell'atleta). Servono le intestazioni `X-Requested-With: XMLHttpRequest` e `Referer`. Con `TIPO=0&S=1`
   al posto di `TIPO=1`: gli elenchi "Stranieri", con la posizione all'interno di quell'elenco.
3. `risultati/new_rank/dettaglioatleta_unica.php?ATLETA=<id>&ID_CLASS=<id>&ZU=1&AVVERSARIO=0`, uno
   per atleta: "Riepilogo Dati" (Settore Agonistico, Societa' appartenenza, Record classifica, partite
   giocate/vinte/perse nella stagione) e la scheda "Storico
   Classifica" (data, posizione, punti, categoria).
4. Per gli atleti con partite nella stagione: la pagina statica collegata da un frame della pagina di dettaglio
   (`risultati/new_rank/html/<classifica>/<Maschile|Femminile>/.../details_page_<n>.html`), con le tabelle
   "Incontri in campionato" e "Incontri in gare di torneo" (data, gara, avversario, fase, esito; le partite non
   conteggiate per la classifica sono segnate). Gli avversari hanno solo il nome: un nome è collegato a un atleta della
   pagina quando uno solo lo ha. Questo raddoppia circa il tempo dell'aggiornamento.

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
- **Gli aggiornamenti mensili si fermano:** GitHub sospende i workflow programmati dopo
  60 giorni senza attività nel repository. I commit mensili lo evitano, ma se succede
  basta riattivarlo dalla scheda Actions.
