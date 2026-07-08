// Træningsplan for halvmaraton sub 2 timer
// Uge 1-14: opbygningsfase (fra 5 km til 21 km)
// Uge 15+: 3-ugers rotation (Tempo / Progression / Let uge)

const BASE_PLAN = [
  // FASE 1 - Kom i gang (uge 1-4)
  { uge: 1, fase: "Opbygning", note: "Kom i gang roligt", trainings: [
    { type: "rolig", distance: 5, description: "5 km roligt", detail: "Snakke-tempo hele vejen. Bare kom i gang." },
    { type: "rolig", distance: 4, description: "4 km roligt", detail: "Snakke-tempo. Fokus på afslappet stil." },
    { type: "lang", distance: 6, description: "6 km roligt (lang tur)", detail: "Ugens længste. Roligt tempo hele vejen." }
  ]},
  { uge: 2, fase: "Opbygning", note: "Første fartleg", trainings: [
    { type: "rolig", distance: 5, description: "5 km roligt", detail: "Snakke-tempo." },
    { type: "tempo", distance: 5, description: "5 km med 3 × 2 min lidt hurtigere", detail: "10 min opvarmning roligt. Så 3 × 2 min lidt hurtigere med 2 min jog imellem. Afslut roligt." },
    { type: "lang", distance: 7, description: "7 km roligt (lang tur)", detail: "Roligt tempo hele vejen. Snakke-test." }
  ]},
  { uge: 3, fase: "Opbygning", note: "Let uge – kun 2 pas", trainings: [
    { type: "rolig", distance: 5, description: "5 km roligt", detail: "Restitution. Meget afslappet." },
    { type: "lang", distance: 6, description: "6 km roligt (lang tur)", detail: "Rolig, jævn tur. Ingen tempo." }
  ]},
  { uge: 4, fase: "Opbygning", note: "Fartleg med lidt mere volumen", trainings: [
    { type: "rolig", distance: 6, description: "6 km roligt", detail: "Snakke-tempo." },
    { type: "tempo", distance: 5, description: "5 km med 4 × 2 min tempo", detail: "Opvarmning 10 min. 4 × 2 min i pænt arbejdende tempo, 2 min jog imellem. Afslut roligt." },
    { type: "lang", distance: 8, description: "8 km roligt (lang tur)", detail: "Roligt tempo. Første 8-km tur." }
  ]},

  // FASE 2 - Stabil opbygning (uge 5-8)
  { uge: 5, fase: "Stabil opbygning", note: "Den lange tur vokser", trainings: [
    { type: "rolig", distance: 6, description: "6 km roligt", detail: "Snakke-tempo." },
    { type: "tempo", distance: 6, description: "6 km med 5 × 2 min tempo", detail: "Opvarmning 10 min. 5 × 2 min tempo, 2 min jog imellem. Afslut roligt." },
    { type: "lang", distance: 10, description: "10 km roligt (lang tur)", detail: "Første 10-km tur. Meget roligt tempo." }
  ]},
  { uge: 6, fase: "Stabil opbygning", note: "Længere tempo-blokke", trainings: [
    { type: "rolig", distance: 6, description: "6 km roligt", detail: "Snakke-tempo." },
    { type: "tempo", distance: 7, description: "7 km med 3 × 5 min tempo", detail: "Opvarmning 10 min. 3 × 5 min i kontrolleret tempo (arbejdende), 3 min jog imellem. Afslut roligt." },
    { type: "lang", distance: 11, description: "11 km roligt (lang tur)", detail: "Roligt tempo hele vejen." }
  ]},
  { uge: 7, fase: "Stabil opbygning", note: "Let uge – knæ og sener får ro", trainings: [
    { type: "rolig", distance: 6, description: "6 km roligt", detail: "Restitution." },
    { type: "lang", distance: 8, description: "8 km roligt (lang tur)", detail: "Rolig tur. Ingen tempo." }
  ]},
  { uge: 8, fase: "Stabil opbygning", note: "Tempo bliver længere", trainings: [
    { type: "rolig", distance: 7, description: "7 km roligt", detail: "Snakke-tempo." },
    { type: "tempo", distance: 7, description: "7 km med 4 × 4 min tempo", detail: "Opvarmning 10 min. 4 × 4 min i kontrolleret tempo, 2-3 min jog imellem. Afslut roligt." },
    { type: "lang", distance: 13, description: "13 km roligt (lang tur)", detail: "Roligt tempo. Halvmaraton-form begynder at bygges." }
  ]},

  // FASE 3 - Halvmaraton-niveau (uge 9-14)
  { uge: 9, fase: "Halvmaraton-niveau", note: "Nærmer os de lange ture", trainings: [
    { type: "rolig", distance: 7, description: "7 km roligt", detail: "Snakke-tempo." },
    { type: "tempo", distance: 8, description: "8 km med 4 × 5 min tempo", detail: "Opvarmning 10 min. 4 × 5 min tempo, 3 min jog imellem. Afslut roligt." },
    { type: "lang", distance: 15, description: "15 km roligt (lang tur)", detail: "Første 15-km tur. Meget roligt tempo hele vejen." }
  ]},
  { uge: 10, fase: "Halvmaraton-niveau", note: "Volumen øges", trainings: [
    { type: "rolig", distance: 8, description: "8 km roligt", detail: "Snakke-tempo." },
    { type: "tempo", distance: 8, description: "8 km med 6 × 3 min tempo", detail: "Opvarmning 10 min. 6 × 3 min tempo, 2 min jog imellem. Afslut roligt." },
    { type: "lang", distance: 17, description: "17 km roligt (lang tur)", detail: "Roligt tempo. Første 17-km tur." }
  ]},
  { uge: 11, fase: "Halvmaraton-niveau", note: "Let uge", trainings: [
    { type: "rolig", distance: 7, description: "7 km roligt", detail: "Restitution." },
    { type: "lang", distance: 12, description: "12 km roligt (lang tur)", detail: "Rolig tur. Ingen tempo." }
  ]},
  { uge: 12, fase: "Halvmaraton-niveau", note: "Længere tempo", trainings: [
    { type: "rolig", distance: 8, description: "8 km roligt", detail: "Snakke-tempo." },
    { type: "tempo", distance: 9, description: "9 km med 5 × 4 min tempo", detail: "Opvarmning 10 min. 5 × 4 min tempo, 3 min jog imellem. Afslut roligt." },
    { type: "lang", distance: 18, description: "18 km roligt (lang tur)", detail: "Første 18-km tur. Meget roligt tempo. Vand med hvis muligt." }
  ]},
  { uge: 13, fase: "Halvmaraton-niveau", note: "Toppen af opbygningen", trainings: [
    { type: "rolig", distance: 8, description: "8 km roligt", detail: "Snakke-tempo." },
    { type: "tempo", distance: 10, description: "10 km med 3 × 8 min tempo", detail: "Opvarmning 10 min. 3 × 8 min i kontrolleret HM-tempo (5:40/km sigte), 3-4 min jog imellem. Afslut roligt." },
    { type: "lang", distance: 20, description: "20 km roligt (lang tur)", detail: "Første 20-km tur. Meget roligt tempo hele vejen. Vand + evt. gel." }
  ]},
  { uge: 14, fase: "Halvmaraton-niveau", note: "Let uge – kroppen absorberer", trainings: [
    { type: "rolig", distance: 8, description: "8 km roligt", detail: "Restitution." },
    { type: "lang", distance: 14, description: "14 km roligt (lang tur)", detail: "Rolig tur. Ingen tempo. Nu er du klar til 21 km." }
  ]}
];

// Rotation for uge 15+ (3-ugers cyklus: Tempo / Progression / Let)
const ROTATION = [
  { fase: "Stabil fase", note: "Tempo-fokus (uge A)", trainings: [
    { type: "rolig", distance: 8, description: "8 km roligt", detail: "Snakke-tempo." },
    { type: "tempo", distance: 10, description: "10 km med 3 × 10 min i HM-tempo", detail: "Opvarmning 10 min. 3 × 10 min i 5:40/km (HM-tempo), 2-3 min jog imellem. Afslut roligt." },
    { type: "lang", distance: 18, description: "18 km roligt (lang tur)", detail: "Rolig 6:20-6:40/km tempo hele vejen." }
  ]},
  { fase: "Stabil fase", note: "Progression (uge B)", trainings: [
    { type: "rolig", distance: 8, description: "8 km roligt", detail: "Snakke-tempo." },
    { type: "tempo", distance: 12, description: "12 km progressiv", detail: "6 km rolig, så 4 km stabil (ca. 6:00/km), afslut med 2 km i 5:40/km. Lær at løbe hurtigt på trætte ben." },
    { type: "lang", distance: 21, description: "21 km roligt (lang tur)", detail: "Halvmaraton-distancen. Meget roligt tempo hele vejen. Vand + gel." }
  ]},
  { fase: "Stabil fase", note: "Let uge (uge C)", trainings: [
    { type: "rolig", distance: 8, description: "8 km roligt", detail: "Restitution." },
    { type: "lang", distance: 14, description: "14-15 km roligt (lang tur)", detail: "Rolig tur. Knæ, sener og motivation får ro." }
  ]}
];

// Genererer plan for et givent antal uger
function generatePlan(numWeeks = 24) {
  const plan = [];
  for (let i = 0; i < numWeeks; i++) {
    if (i < BASE_PLAN.length) {
      plan.push(BASE_PLAN[i]);
    } else {
      const rotationIndex = (i - BASE_PLAN.length) % ROTATION.length;
      const template = ROTATION[rotationIndex];
      plan.push({
        uge: i + 1,
        fase: template.fase,
        note: template.note,
        trainings: template.trainings.map(t => ({ ...t }))
      });
    }
  }
  return plan;
}
