# A.C. Personal Trainer · sito web

Sito one-page premium per **A.C. Personal Trainer di Alessandro Caputo**, Cesarò (ME).
Instagram: [@a.c._personal_trainer](https://www.instagram.com/a.c._personal_trainer/)

## Stack

| Livello | Tecnologia |
|---|---|
| Struttura | HTML5 semantico (una pagina, SEO + dati strutturati Schema.org) |
| Stile | CSS3 puro (custom properties, 3D transforms, responsive mobile-first) |
| 3D | [Three.js](https://threejs.org) r169: manubrio in oro, anelli a scudo, polvere d'oro |
| Animazioni | [GSAP 3](https://gsap.com) + ScrollTrigger |
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
  vendor/             three.js, gsap
  logo.webp, og-image.jpg, icone
```

## Configurare i contatti

Apri `assets/js/config.js` e compila i campi:

```js
whatsapp: '393401234567',            // il modulo invierà il messaggio su WhatsApp
phone:    '+39 340 123 4567',
email:    'info@acpersonaltrainer.it',
```

Senza WhatsApp né email, il modulo copia il messaggio negli appunti e apre la chat
Instagram (`ig.me`). Con il numero WhatsApp impostato, il messaggio arriva già pronto in chat.

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
- Testi, percorsi e FAQ sono una prima bozza: vanno rivisti con Alessandro (prezzi, orari,
  indirizzo esatto della sede, eventuali certificazioni).
