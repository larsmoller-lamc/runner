# Runner

Personlig halvmaraton-træningsapp med mål sub 2 timer. Web app optimeret til mobil.

**[▶ Prøv appen live](https://dit-brugernavn.github.io/runner/)** *(opdater linket når du har deployed)*

## Funktioner

- 12 ugers opbygningsplan (fra 5 km → 21 km) + ubegrænset udvidelse via 3-ugers rotation
- Registrér gennemført træning med dato, distance og tempo
- Logbog sorteret efter dato (nyeste først)
- Statistik: antal løb, samlet km, længste tur
- Firebase-synkronisering – tilgå fra alle enheder
- Fungerer offline (localStorage-fallback hvis Firebase ikke er tilgængeligt)

## Kom i gang

### 1. Klon repo

```bash
git clone https://github.com/DIT-BRUGERNAVN/runner.git
cd runner
```

### 2. Firebase

Firebase-config er allerede indsat i `js/firebase-config.js` med dine projekt-nøgler.
Sørg for at Firestore Database er aktiveret i [Firebase Console](https://console.firebase.google.com):

**Build → Firestore Database → Create database**. Vælg location (europe-west3 eller europe-west1) og start i **test mode**.

### 3. Sikkerhedsregler

Så længe der ikke er login, låser vi Firestore ned til én kendt bruger-ID. I Firebase Console → **Firestore Database → Rules**, indsæt:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/solo-runner/completions/{doc} {
      allow read, write: if true;
    }
  }
}
```

Klik **Publish**.

Hvis du ændrer `USER_ID` i `firebase-config.js`, skal du ændre stien tilsvarende i reglerne.

> **Note:** Uden login kan enhver, der finder din app-URL og gætter (eller læser) sti-strukturen, teoretisk skrive til din database. Til personligt brug er det fint. Hvis du senere vil have det ordentligt sikret, tilføj Firebase Anonymous Auth og bind reglen til `request.auth.uid`.

### 4. Kør lokalt

Start en simpel server i projektmappen:

```bash
python3 -m http.server 8000
# åbn http://localhost:8000
```

Firebase kræver at siden serveres via HTTP (ikke `file://`), fordi `js/app.js` loades som ES-modul.

### 5. Deploy til GitHub Pages

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

I GitHub repo: **Settings → Pages → Source: main / (root) → Save**. Efter et par minutter er den live på `https://DIT-BRUGERNAVN.github.io/runner/`.

**Vigtigt:** Tilføj dit GitHub Pages-domæne til Firebase's autoriserede domæner:
Firebase Console → **Authentication → Settings → Authorized domains → Add domain** → `dit-brugernavn.github.io`.

(Dette skal først gøres når du evt. tilføjer login senere. Uden login virker det uden.)

## Struktur

```
runner/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── firebase-config.js   ← dine keys er allerede indsat
│   ├── plan.js              ← træningsplanen
│   ├── storage.js           ← Firestore / localStorage
│   └── app.js               ← UI-logik
└── README.md
```

## Sådan bruges appen

- **Plan-fanen**: Tryk på en træning for at åbne dialogen. Udfyld dato (default = i dag), distance (default = planlagt km) og tempo (fx `5:40`). Gem.
- **Logbog-fanen**: Alle gennemførte løb sorteret efter dato (nyeste øverst). Tryk `×` for at slette.
- **Flyt en træning**: Vælg bare den træning du faktisk løb i dag og registrér den. Logbogen sorteres altid efter din faktiske gennemførelses-dato.
- **Udvid planen**: Nederst på Plan-fanen, tryk `+ 12 uger mere`. Det bygger videre med 3-ugers rotationen (Tempo / Progression / Let uge).

## Træningsplan

- **Uge 1-4** – Opbygning (15 → 19 km/uge)
- **Uge 5-8** – Stabil opbygning (21 → 27 km/uge)
- **Uge 9-14** – Halvmaraton-niveau (op til 20 km lang tur)
- **Uge 15+** – Rotation: Tempo → Progression → Let uge

**Tempozoner (mål sub 2)**

| Type | Tempo | Følelse |
|------|-------|---------|
| Rolig | 6:15-6:45/km | Snakke-tempo |
| Stabil | 5:55-6:05/km | Kontrolleret |
| Tempo (HM-fart) | 5:35-5:45/km | Arbejdende |
| Interval | 5:10-5:25/km | Presset |
