import type { ConceptDirection, DesignConcept, DesignInput, Recommendation } from './types.js'

const roomMoves: Record<DesignInput['roomType'], { layout: string; signature: string; material: string }> = {
  Wohnzimmer: { layout: 'Möbel als ruhige Insel gruppieren, Laufwege freihalten und die größte Sichtachse bewusst inszenieren.', signature: 'Eine raumhohe, indirekt beleuchtete Funktionswand verbindet Stauraum, Kunst und Licht zu einem Element.', material: 'Matte Kalkfarbe, warmes Holz und wenige textile Flächen schaffen Tiefe ohne Unruhe.' },
  Küche: { layout: 'Arbeitsdreieck vereinfachen, Hochschränke bündeln und freie Arbeitsfläche an der hellsten Zone konzentrieren.', signature: 'Eine durchgehende Lichtfuge über Arbeitsfläche und Hochschrankzone lässt die Küche höher und präziser wirken.', material: 'Ruhige Fronten, eine durchgehende Arbeitsplatte und maximal zwei sichtbare Materialfamilien.' },
  Schlafzimmer: { layout: 'Bett als Mittelpunkt setzen, Schrankvolumen optisch zurücknehmen und Sichtlinien zur Tür beruhigen.', signature: 'Eine gepolsterte oder mineralische Kopfwand mit integriertem Licht ersetzt kleinteilige Deko.', material: 'Textile Oberflächen, gebrochene Naturtöne und weiche Holznuancen für visuelle Ruhe.' },
  Bad: { layout: 'Nasszone klar bündeln, Boden möglichst durchlaufen lassen und vertikale Flächen als ruhige Ebenen behandeln.', signature: 'Ein großer Spiegel mit seitlichem Licht verdoppelt gefühlt Licht und Raumtiefe.', material: 'Großformatige, matte Flächen mit einer einzigen Akzentstruktur statt vieler kleiner Fugenbilder.' },
  Arbeitszimmer: { layout: 'Arbeitsplatz ans beste Tageslicht, Stauraum in die Randzone und eine klare Hintergrundfläche für Fokus.', signature: 'Eine flache, raumhohe Arbeitswand kombiniert Regal, Licht und akustisch wirksame Oberfläche.', material: 'Warme, blendfreie Materialien mit ruhigen Texturen und wenig Spiegelung.' },
  Essbereich: { layout: 'Tisch als Zentrum setzen, Pendelleuchte exakt darüber ausrichten und den Randbereich bewusst leer lassen.', signature: 'Eine einzelne starke Deckenleuchte plus Wandlicht schafft Restaurantwirkung ohne Übermöblierung.', material: 'Holz, strukturierte Wandoberfläche und ein klarer Stoffakzent sorgen für Zusammenhalt.' },
  Flur: { layout: 'Boden und Wandlinien durchziehen, Stauraum flächenbündig integrieren und Engstellen optisch entlasten.', signature: 'Ein langer Spiegel mit indirektem Seitenlicht verlängert den Raum und verteilt vorhandenes Licht.', material: 'Helle, robuste Wandoberfläche und ein einheitlicher Boden minimieren visuelle Brüche.' },
  Andere: { layout: 'Die stärkste Raumachse freilegen, Funktionen bündeln und die Blickführung mit Licht statt mit mehr Möbeln steuern.', signature: 'Ein einziges architektonisches Statement bündelt Licht, Stauraum und Oberfläche.', material: 'Wenige, wiederkehrende Materialien geben dem Raum eine klare Sprache.' },
}

const palettes = {
  dim: ['#F3E9DC', '#C9B59B', '#745F4D', '#22201C'],
  warm: ['#EFE4D6', '#C8A989', '#8E765E', '#37322C'],
  cool: ['#E9ECEA', '#C7D0CA', '#7C8980', '#252A27'],
  vivid: ['#F0E7D8', '#C2B29B', '#A15F46', '#302C28'],
}

const directionProfiles: Record<ConceptDirection, { name: string; thesis: string; layout: string; surfaces: string; signature: string; recommendation: Recommendation }> = {
  0: {
    name: 'Architectural Calm',
    thesis: 'Die ruhigste Richtung: klare Linien, starke Proportionen und wenige präzise Materialien.',
    layout: 'Zusätzliche Möbel werden nur ergänzt, wenn sie die Hauptachse wirklich stärken.',
    surfaces: 'Flächen bleiben tonal nah beieinander, damit Licht und Raumform im Vordergrund stehen.',
    signature: 'Der stärkste Eingriff wirkt wie Architektur statt wie Dekoration.',
    recommendation: { title: 'Visuelle Ruhe konsequent halten', detail: 'Kleine Einzelakzente reduzieren und stattdessen wenige große, zusammenhängende Flächen gestalten.', impact: 'mittel' },
  },
  1: {
    name: 'Warm Layers',
    thesis: 'Die wohnlichste Richtung: Wärme entsteht über Licht, Textur und Materialschichten statt über mehr Deko.',
    layout: 'Sitz-, Arbeits- oder Ruhezone bekommt eine weichere räumliche Fassung durch Textilien, Licht und Holz.',
    surfaces: 'Warme Holznuancen, strukturierte Textilien und gebrochene Naturtöne bauen Tiefe in mehreren Schichten auf.',
    signature: 'Eine warme Materialzone mit integriertem Licht wird zum emotionalen Mittelpunkt des Raums.',
    recommendation: { title: 'Wärme in Schichten aufbauen', detail: 'Nicht alles beige machen: Holz, Textil, warmes Licht und eine mineralische Oberfläche gezielt kombinieren.', impact: 'hoch' },
  },
  2: {
    name: 'Bold Contrast',
    thesis: 'Die mutigste Richtung: ein bewusst gesetzter Kontrast gibt dem Raum Identität, ohne ihn unruhig zu machen.',
    layout: 'Eine starke Sichtachse oder Funktionszone darf bewusst betont werden; der Rest des Raums bleibt zurückhaltend.',
    surfaces: 'Eine dunklere, farbige oder markant strukturierte Fläche trifft auf eine ruhige helle Basis.',
    signature: 'Ein einziges kontrastreiches Architekturband bündelt Stauraum, Licht oder Kunst zu einem starken Statement.',
    recommendation: { title: 'Einen mutigen Kontrast setzen', detail: 'Nur eine Zone bekommt maximale Präsenz. Alle übrigen Flächen werden ruhiger, damit der Kontrast hochwertig statt laut wirkt.', impact: 'hoch' },
  },
}

const roomStartStep: Record<DesignInput['roomType'], string> = {
  Wohnzimmer: 'Sitzmöbel probeweise um die wichtigste Blickachse gruppieren und Laufwege mit mindestens einer freien Hauptlinie testen.',
  Küche: 'Arbeitsablauf einmal real durchspielen: Kühlschrank, Spüle und Kochfeld ablaufen und Engstellen oder fehlende Ablage markieren.',
  Schlafzimmer: 'Bettposition und Schrankvolumen zuerst mit Klebeband am Boden simulieren, bevor neue Möbel bestellt werden.',
  Bad: 'Nasszone, Spiegel und Stauraum als drei Funktionsbereiche markieren und prüfen, welche Fugen- und Bodenlinien durchlaufen können.',
  Arbeitszimmer: 'Schreibtisch am besten Tageslicht testen und Kamera-, Bildschirm- sowie Stauraumzone gemeinsam prüfen.',
  Essbereich: 'Tischposition inklusive Stuhlauszug am Boden markieren und die Leuchtenmitte exakt darüber bestimmen.',
  Flur: 'Engste Laufstelle messen und alle losen Stauraumelemente testweise aus der Hauptlinie entfernen.',
  Andere: 'Die stärkste Sicht- und Bewegungsachse markieren und vorhandene Funktionen darum neu ordnen.',
}

function choosePalette(input: DesignInput): string[] {
  if (input.direction === 1) return palettes.warm
  if (input.direction === 2) return palettes.vivid
  if (input.signals.brightness < 0.42) return palettes.dim
  if (input.signals.saturation > 0.48) return palettes.vivid
  if (input.signals.warmth > 0.54) return palettes.warm
  return palettes.cool
}

function lightingAdvice(input: DesignInput): string {
  if (input.signals.brightness < 0.38) return 'Drei Lichtschichten statt einer Deckenlampe: indirektes Grundlicht, vertikales Wandlicht und gezieltes Funktionslicht. Wände heller, Leuchten näher an reflektierende Flächen.'
  if (input.signals.brightness < 0.58) return 'Vorhandenes Tageslicht verstärken: helle vertikale Flächen, spiegelnde Akzente gegenüber dem Fenster und warmes, dimmbares Abendlicht auf zwei Höhen.'
  return 'Das gute Licht nicht mit zu vielen Leuchten zerstören: wenige präzise Lichtpunkte, blendfreie Akzente und bewusst dunklere Zonen für Tiefe.'
}

function addRecommendation(recs: Recommendation[], recommendation: Recommendation): void {
  if (!recs.some((item) => item.title === recommendation.title)) recs.push(recommendation)
}

function concernRecommendations(input: DesignInput): Recommendation[] {
  const text = input.concern.toLowerCase()
  const recs: Recommendation[] = []
  if (/dunkel|licht|hell|schatt|finster|beleuchtung/.test(text) || input.signals.brightness < 0.45) addRecommendation(recs, { title: 'Licht zuerst lösen', detail: 'Vertikale Flächen aufhellen, eine indirekte Lichtlinie ergänzen und schwere Fensterzonen visuell öffnen. Das verändert den Raum stärker als neue Deko.', impact: 'hoch' })
  if (/klein|eng|tiefe|höhe|niedrig|schmal|gedrückt|proportion/.test(text)) addRecommendation(recs, { title: 'Proportionen optisch strecken', detail: 'Vorhänge und hohe Elemente bis zur Decke führen, Bodenlinien möglichst unterbrechungsfrei halten und niedrige Möbel in der Hauptsichtachse einsetzen.', impact: 'hoch' })
  if (/möbel|ordnung|stauraum|voll|chaos|unruh|zugestellt|abstell/.test(text)) addRecommendation(recs, { title: 'Volumen bündeln', detail: 'Kleine Einzelmöbel reduzieren und Stauraum in ein großes, ruhiges Volumen zusammenziehen. So entsteht freie Fläche statt nur mehr Platz zum Verstauen.', impact: 'hoch' })
  if (/farbe|tapete|wand|langweilig|kalt|steril|gemütlich|atmosphäre/.test(text)) addRecommendation(recs, { title: 'Eine Wandidee, nicht fünf', detail: 'Eine zusammenhängende Material- oder Farbfläche definieren und sie an angrenzenden Details wiederholen. Das wirkt hochwertiger als viele Akzentwände.', impact: 'mittel' })
  if (/fenster|aussicht|tageslicht|vorhang|gardine/.test(text)) addRecommendation(recs, { title: 'Fensterzone als Raumverstärker nutzen', detail: 'Die Fensterzone frei und leicht halten, hohe Textilien seitlich parken und gegenüberliegende Flächen so wählen, dass sie Tageslicht tiefer in den Raum zurückwerfen.', impact: 'hoch' })
  if (/arbeitsfläche|funktion|ablauf|weg|laufweg|praktisch/.test(text)) addRecommendation(recs, { title: 'Funktion vor Dekoration ordnen', detail: 'Die häufigsten Wege und Handgriffe zuerst optimieren. Möbel und Stauraum folgen den Abläufen, nicht umgekehrt – dadurch wirkt der Raum automatisch großzügiger.', impact: 'hoch' })
  return recs
}

function photoOpportunities(input: DesignInput): Recommendation[] {
  const recs: Recommendation[] = []
  if (input.signals.brightness < 0.5) addRecommendation(recs, { title: 'Helle Flächen dort einsetzen, wo sie Licht zurückgeben', detail: 'Das Foto wirkt lichtarm. Besonders die Flächen gegenüber oder seitlich zum Fenster sollten heller und matter werden, damit vorhandenes Tageslicht tiefer in den Raum wandert.', impact: 'hoch' })
  if (input.signals.saturation > 0.5) addRecommendation(recs, { title: 'Farbkonkurrenz reduzieren', detail: 'Im Foto konkurrieren mehrere Farbreize. Eine ruhigere Grundpalette mit nur einem bewussten Akzent lässt Architektur und Möbel hochwertiger wirken.', impact: 'mittel' })
  if (input.signals.warmth < 0.42) addRecommendation(recs, { title: 'Kühle Raumwirkung ausbalancieren', detail: 'Warme Holz- oder Textilflächen und Licht um etwa 2700–3000 K geben dem Raum Wärme, ohne ihn dunkler oder rustikaler wirken zu lassen.', impact: 'mittel' })
  if (input.signals.warmth > 0.64) addRecommendation(recs, { title: 'Warme Töne präziser dosieren', detail: 'Die warme Bildwirkung bleibt erhalten, bekommt aber mehr Tiefe durch gebrochene helle Flächen und einzelne kühlere Kontraste statt noch mehr Beige oder Holz.', impact: 'mittel' })
  return recs
}

function firstSteps(input: DesignInput): string[] {
  const concern = input.concern.toLowerCase()
  const first = input.signals.brightness < 0.45 || /dunkel|licht|hell|fenster|tageslicht/.test(concern)
    ? 'Lichttest vor jedem Kauf: tagsüber und abends drei Fotos aus gleicher Position machen und mit mobilen Leuchten bzw. hellen Testflächen prüfen, welche Zone wirklich Licht braucht.'
    : roomStartStep[input.roomType]

  const second = /möbel|ordnung|stauraum|voll|chaos|zugestellt/.test(concern)
    ? 'Alles Bewegliche aus der wichtigsten Sicht- und Laufachse räumen und erst danach entscheiden, welcher Stauraum tatsächlich zurückkommen muss.'
    : roomStartStep[input.roomType]

  const budgetStep = input.budget === 'smart'
    ? 'Clever starten: zuerst Umstellen, Licht, Farbe und vorhandene Möbel testen; erst kaufen, wenn die Wirkung mit diesen günstigen Proben bestätigt ist.'
    : input.budget === 'balanced'
      ? 'Ausgewogen planen: Maße und Materialmuster für die zwei wirksamsten Änderungen sammeln und diese zuerst als zusammenhängendes Mini-Paket umsetzen.'
      : 'Neu gedacht vorbereiten: vor Einbauten oder baulichen Änderungen Maße, Anschlüsse und Materialübergänge dokumentieren und daraus ein verbindliches Umsetzungsbriefing erstellen.'

  const directionStep = input.mode === 'inspire' && input.direction === 1
    ? 'Für die gewählte warme Richtung drei echte Materialproben nebeneinander bei Tages- und Kunstlicht prüfen, bevor Farbtöne festgelegt werden.'
    : input.mode === 'inspire' && input.direction === 2
      ? 'Für die mutige Richtung eine einzige Kontrastzone mit Klebeband oder großem Farbmuster markieren und den restlichen Raum bewusst ruhig lassen.'
      : 'Palette festlegen: maximal drei Hauptmaterialien und eine Akzentfarbe nebeneinander prüfen, bevor Einzelteile bestellt werden.'

  return [first, second === first ? directionStep : second, budgetStep]
}

function baseConceptName(input: DesignInput): string {
  if (input.mode === 'solve') {
    if (input.signals.brightness < 0.42) return 'Light & Flow Reset'
    if (/klein|eng|schmal|höhe|tiefe/.test(input.concern.toLowerCase())) return 'Bigger Than It Looks'
    return 'Clear Space Reset'
  }
  if (input.roomType === 'Küche') return 'Kitchen, Reframed'
  if (input.roomType === 'Wohnzimmer') return 'The Quiet Wow'
  if (input.roomType === 'Schlafzimmer') return 'Soft Architecture'
  return 'Hidden Potential'
}

export function createConcept(input: DesignInput): DesignConcept {
  const move = roomMoves[input.roomType]
  const direction = input.direction ?? 0
  const profile = directionProfiles[direction]
  const palette = choosePalette(input)
  const recommendations = concernRecommendations(input)
  const photo = photoOpportunities(input)
  const base: Recommendation[] = [
    { title: 'Blickachse klären', detail: 'Der erste Blick beim Betreten bekommt ein bewusstes Ziel. Alles, was diese Achse zufällig unterbricht, wird verschoben, gebündelt oder optisch beruhigt.', impact: 'hoch' },
    { title: 'Wiederholung schafft Einheit', detail: 'Maximal drei Hauptmaterialien und eine Akzentfarbe werden konsequent wiederholt – bei Leuchten, Griffen, Textilien oder Kanten.', impact: 'mittel' },
  ]

  const modePhrase = input.mode === 'inspire'
    ? `Ein überraschendes Konzept mit der Richtung „${profile.name}“. ${profile.thesis}`
    : 'Ein präzises Konzept, das die genannten Störpunkte löst, ohne den Raum mit Einzelmaßnahmen zu überladen.'
  const budgetPhrase = input.budget === 'smart'
    ? 'mit maximaler Wirkung und wenig Umbau: Licht, Farbe, Umstellen und wenige gezielte Käufe'
    : input.budget === 'balanced'
      ? 'mit einer Mischung aus Oberflächen, Licht, Möbelanpassungen und einzelnen Einbauten'
      : 'mit architektonischen Eingriffen, maßgefertigten Elementen und einer konsequenten Materialidee'

  const prioritized: Recommendation[] = []
  for (const recommendation of [...recommendations, ...(input.mode === 'inspire' ? [profile.recommendation] : []), ...photo, ...base]) addRecommendation(prioritized, recommendation)

  return {
    name: input.mode === 'inspire' && direction > 0 ? profile.name : baseConceptName(input),
    thesis: `${modePhrase} Die Richtung ist ${budgetPhrase}.`,
    palette,
    recommendations: prioritized.slice(0, 4),
    lighting: lightingAdvice(input),
    layout: input.mode === 'inspire' ? `${move.layout} ${profile.layout}` : move.layout,
    surfaces: input.mode === 'inspire' ? `${move.material} ${profile.surfaces}` : move.material,
    signatureMove: input.mode === 'inspire' && direction > 0 ? profile.signature : move.signature,
    firstSteps: firstSteps({ ...input, direction }),
  }
}
