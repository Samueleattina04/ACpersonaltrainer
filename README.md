# A.C. Personal Trainer · sito web

Sito one-page premium per **A.C. Personal Trainer di Alessandro Caputo**,
nuova sede in **Via Trieste 62, Cesarò (ME)**: area pesi, cardio, functional e combat.
Instagram: [@a.c._personal_trainer](https://www.instagram.com/a.c._personal_trainer/)

## Stack

| Livello | Tecnologia |
|---|---|
| Struttura | HTML5 semantico (una pagina, SEO + dati strutturati Schema.org) |
| Stile | CSS3 puro (custom properties, 3D transforms, responsive mobile-first) |
| 3D | [Three.js](https://threejs.org) r169: manubrio in oro, anelli a scudo, polvere d'oro |
| Animazioni | [GSAP 3](https://gsap.com) + ScrollTrigger: manifesto fissato con il manubrio che si smonta, testi lettera per lettera |
| Scroll | [Lenis](https://lenis.darkroom.engineering) per lo scroll fluido con inerzia |
| Logica | JavaScript vanilla (quiz, modulo contatti, effetti tilt/magnetici) |
| Font | Cinzel, Manrope, Cormorant Garamond, ospitati in locale (nessuna chiamata a Google) |

**Nessun build, nessun Node.js, nessun database.** Tutte le librerie sono già incluse in
`assets/vendor/`: il sito è statico e funziona su qualsiasi hosting, compreso l'hosting
condiviso (Web Hosting) di Hostinger.

## Struttura

```
index.html            Pagina unica
.htaccess             HTTPS, compressione, cache, sicurezza (Apache/LiteSpeed)
favicon.ico, robots.txt, site.webmanifest
assets/
  css/style.css       Stili e palette
  js/config.js        ← CONTATTI DA MODIFICARE
  js/main.js          Interazioni, quiz, modulo, animazioni
  js/scene.js         Scena 3D Three.js
  fonts/              Font woff2
  vendor/             three.js, gsap, lenis
  logo.webp, og-image.jpg, icone
```

## Configurare i contatti

Tutti i recapiti sono in `assets/js/config.js`:

```js
phones:   ['350 539 0434', '320 577 1476'],
whatsapp: '393505390434',   // il modulo contatti invia il messaggio già pronto qui
email:    '',               // opzionale
address:  'Via Trieste 62',
```

Se `whatsapp` è vuoto, il modulo usa l'email; se manca anche quella, copia il messaggio
e apre la chat Instagram (`ig.me`).

## Pubblicare su Hostinger

1. hPanel → **Siti web** → il tuo dominio → **File Manager** (oppure FTP con FileZilla).
2. Apri la cartella `public_html` ed elimina il file `default.php`, se presente.
3. Carica **tutto il contenuto** di questa cartella (incluso il file nascosto `.htaccess`)
   direttamente dentro `public_html`. Il modo più comodo: comprimi tutto in uno `.zip`,
   caricalo e usa "Estrai" nel File Manager.
4. hPanel → **Sicurezza → SSL**: attiva il certificato gratuito. Il `.htaccess` reindirizza già su HTTPS.
5. Opzionale: hPanel → **Prestazioni → CDN** per una velocità ancora maggiore.

In alternativa: hPanel → **Avanzate → Git**, collega questo repository e imposta
`public_html` come cartella di destinazione: ad ogni push il sito si aggiorna.

## Prova in locale

I moduli ES richiedono un server (non funziona aprendo il file con doppio clic):

```bash
python3 -m http.server 8000
# poi apri http://localhost:8000
```

## Note

- La mappa Google si carica solo al clic (nessun cookie di terze parti senza consenso).
- Se il dispositivo non supporta WebGL, l'hero mostra il logo al posto della scena 3D.
- Con "riduci movimento" attivo nel sistema operativo, le animazioni vengono disattivate.
- Testi basati sui post Instagram ufficiali (nuova sede, 4 aree, servizi, accesso su
  prenotazione). Da confermare con Alessandro: orari, quale numero usa WhatsApp, eventuali
  certificazioni. Foto reali della sede renderebbero il sito ancora più forte.
