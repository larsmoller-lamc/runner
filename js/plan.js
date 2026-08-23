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
    { type: "progressiv", distance: 12, description: "12 km progressiv", detail: "6 km rolig, så 4 km stabil (ca. 6:00/km), afslut med 2 km i 5:40/km. Lær at løbe hurtigt på trætte ben." },
    { type: "lang", distance: 21, description: "21 km roligt (lang tur)", detail: "Halvmaraton-distancen. Meget roligt tempo hele vejen. Vand + gel." }
  ]},
  { fase: "Stabil fase", note: "Let uge (uge C)", trainings: [
    { type: "rolig", distance: 8, description: "8 km roligt", detail: "Restitution." },
    { type: "lang", distance: 14, description: "14-15 km roligt (lang tur)", detail: "Rolig tur. Knæ, sener og motivation får ro." }
  ]}
];

/**
 * Beregner forventede datoer for ikke-gennemførte træninger baseret på:
 *  - Base: seneste gennemførte løbs dato (eller i dag hvis ingen)
 *  - Samme uge:
 *      · 2-løbs uge: 3 hviledage mellem løbene (+4 dage)
 *      · 3-løbs uge: 1 hviledag mellem løbene (+2 dage)
 *  - Skift til ny uge: 1 hviledag mellem sidste løb i forrige uge og
 *    første løb i næste uge (+2 dage).
 *
 * Returnerer et map: { "u{uge}-t{idx}": "YYYY-MM-DD" }
 *
 * @param {Array} plan - Trænings-plan (fra generatePlan)
 * @param {Array} completions - Gennemførte løb (med .uge, .trainingIndex, .date)
 * @returns {Object} Map af nøgle → ISO-dato
 */
function computeExpectedDates(plan, completions) {
  const result = {};
  const completionMap = new Map();
  completions.forEach(c => {
    completionMap.set(`u${c.uge}-t${c.trainingIndex}`, c.date);
  });

  // Find anker-dato: seneste gennemførte løb, eller i dag
  let anchorDate = null;
  let anchorWeekIdx = -1;
  let anchorTrainingCount = 0;

  if (completions.length > 0) {
    // Sorter completions efter dato, tag den seneste
    const sorted = [...completions].sort((a, b) => a.date.localeCompare(b.date));
    const last = sorted[sorted.length - 1];
    anchorDate = last.date;
    anchorWeekIdx = plan.findIndex(w => w.uge === last.uge);
    anchorTrainingCount = last.trainingIndex + 1; // 0-indekseret + 1 = antal "brugte" i den uge
  }

  // Start-punkt for iteration: første ikke-gennemførte træning
  let startWeekIdx = 0;
  let startTrainingIdx = 0;

  if (anchorDate !== null) {
    startWeekIdx = anchorWeekIdx;
    startTrainingIdx = anchorTrainingCount; // næste træning efter den seneste gennemførte
    // Hvis vi er ud over ugens træninger, gå til næste uge
    while (
      startWeekIdx < plan.length &&
      startTrainingIdx >= plan[startWeekIdx].trainings.length
    ) {
      startWeekIdx++;
      startTrainingIdx = 0;
    }
  }

  // Hvis ingen anker: startdato = i dag (før første ikke-gennemførte)
  // vi vil sætte første ikke-gennemførte til i dag
  let prevDate = anchorDate; // null hvis intet anker
  let prevWeekIdx = anchorDate !== null ? anchorWeekIdx : -1;

  const addDays = (isoDate, days) => {
    const d = new Date(isoDate + "T00:00:00");
    d.setDate(d.getDate() + days);
    const off = d.getTimezoneOffset();
    const local = new Date(d.getTime() - off * 60000);
    return local.toISOString().slice(0, 10);
  };

  const todayLocal = () => {
    const d = new Date();
    const off = d.getTimezoneOffset();
    const local = new Date(d.getTime() - off * 60000);
    return local.toISOString().slice(0, 10);
  };

  // Iterér gennem alle træninger fra start-punktet og fremad
  for (let wIdx = startWeekIdx; wIdx < plan.length; wIdx++) {
    const week = plan[wIdx];
    const numTrainings = week.trainings.length;
    const tStart = (wIdx === startWeekIdx) ? startTrainingIdx : 0;

    for (let tIdx = tStart; tIdx < numTrainings; tIdx++) {
      const key = `u${week.uge}-t${tIdx}`;

      // Spring over hvis træningen allerede er gennemført
      // (kan ske hvis gennemførte løb ikke er i kronologisk rækkefølge
      //  ift. plan-rækkefølgen)
      if (completionMap.has(key)) {
        prevDate = completionMap.get(key);
        prevWeekIdx = wIdx;
        continue;
      }

      let expected;
      if (prevDate === null) {
        // Ingen anker overhovedet → første ikke-gennemførte = i dag
        expected = todayLocal();
      } else if (wIdx === prevWeekIdx) {
        // Samme uge som forrige
        const gap = numTrainings === 2 ? 4 : 2; // 2-løbs-uge: 3 hviledage; ellers 1 hviledag
        expected = addDays(prevDate, gap);
      } else {
        // Ny uge → 1 hviledag efter sidste løb
        expected = addDays(prevDate, 2);
      }

      result[key] = expected;
      prevDate = expected;
      prevWeekIdx = wIdx;
    }
  }

  return result;
}

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
