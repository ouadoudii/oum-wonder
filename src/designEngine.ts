import type { DesignConcept, DesignInput, Recommendation } from './types.js'

const roomMoves: Record<DesignInput['roomType'], { layout: string; signature: string; material: string }> = {
  Wohnzimmer: {
    layout: 'Möbel als ruhige Insel gruppieren, Laufwege freihalten und die größte Sichtachse bewusst inszenieren.',
    signature: 'Eine raumhohe, indirekt beleuchtete Funktionswand verbindet Stauraum, Kunst und Licht zu einem Element.',
    material: 'Matte Kalkfarbe, warmes Holz und wenige textile Flächen schaffen Tiefe ohne Unruhe.',
  },
  Küche: {
    layout: 'Arbeitsdreieck vereinfachen, Hochschränke bündeln und freie Arbeitsfläche an der hellsten Zone konzentrieren.',
    signature: 'Eine durchgehende Lichtfuge über Arbeitsfläche und Hochschrankzone lässt die Küche höher und präziser wirken.',
    material: 'Ruhige Fronten, eine durchgehende Arbeitsplatte und maximal zwei sichtbare Materialfamilien.',
  },
  Schlafzimmer: {
    layout: 'Bett als Mittelpunkt setzen, Schrankvolumen optisch zurücknehmen und Sichtlinien zur Tür beruhigen.',
    signature: 'Eine gepolsterte oder mineralische Kopfwand mit integriertem Licht ersetzt kleinteilige Deko.',
    material: 'Textile Oberflächen, gebrochene Naturtöne und weiche Holznuancen für visuelle Ruhe.',
  },
  Bad: {
    layout: 'Nasszone klar bündeln, Boden möglichst durchlaufen lassen und vertikale Flächen als ruhige Ebenen behandeln.',
    signature: 'Ein großer Spiegel mit seitlichem Licht verdoppelt gefühlt Licht und Raumtiefe.',
    material: 'Großformatige, matte Flächen mit einer einzigen Akzentstruktur statt vieler kleiner Fugenbilder.',
  },
  Arbeitszimmer: {
    layout: 'Arbeitsplatz ans beste Tageslicht, Stauraum in die Randzone und eine klare Hintergrundfläche für Fokus.',
    signature: 'Eine flache, raumhohe Arbeitswand kombiniert Regal, Licht und akustisch wirksame Oberfläche.',
    material: 'Warme, blendfreie Materialien mit ruhigen Texturen und wenig Spiegelung.',
  },
  Essbereich: {
    layout: 'Tisch als Zentrum setzen, Pendelleuchte exakt darüber ausrichten und den Randbereich bewusst leer lassen.',
    signature: 'Eine einzelne starke Deckenleuchte plus Wandlicht schafft Restaurantwirkung ohne Übermöblierung.',
    material: 'Holz, strukturierte Wandoberfläche und ein klarer Stoffakzent sorgen für Zusammenhalt.',
  },
  Flur: {
    layout: 'Boden und Wandlinien durchziehen, Stauraum flächenbündig integrieren und Engstellen optisch entlasten.',
    signature: 'Ein langer Spiegel mit indirektem Seitenlicht verlängert den Raum und verteilt vorhandenes Licht.',
    material: 'Helle, robuste Wandoberfläche und ein einheitlicher Boden minimieren visuelle Brüche.',
  },
  Andere: {
    layout: 'Die stärkste Raumachse freilegen, Funktionen bündeln und die Blickführung mit Licht statt mit mehr Möbeln steuern.',
    signature: 'Ein einziges architektonisches Statement bündelt Licht, Stauraum und Oberfläche.',
    material: 'Wenige, wiederkehrende Materialien geben dem Raum eine klare Sprache.',
  },
}

const palettes = {
  dim: ['#F3E9DC', '#C9B59B', '#745F4D', '#22201C'],
  warm: ['#EFE4D6', '#C8A989', '#8E765E', '#37322C'],
  cool: ['#E9ECEA', '#C7D0CA', '#7C8980', '#252A27'],
  vivid: ['#F0E7D8', '#C2B29B', '#A15F46', '#302C28'],
}

function choosePalette(input: DesignInput): string[] {
  if (input.signals.brightness < 0.42) return palettes.dim
  if (input.signals.saturation > 0.48) return palettes.vivid
  if (input.signals.warmth > 0.54) return palettes.warm
  return palettes.cool
}

function lightingAdvice(input: DesignInput): string {
  if (input.signals.brightness < 0.38) {
    return 'Drei Lichtschichten statt einer Deckenlampe: indirektes Grundlicht, vertikales Wandlicht und gezieltes Funktionslicht. Wände heller, Leuchten näher an reflektierende Flächen.'
  }
  if (input.signals.brightness < 0.58) {
    return 'Vorhandenes Tageslicht verstärken: helle vertikale Flächen, spiegelnde Akzente gegenüber dem Fenster und warmes, dimmbares Abendlicht auf zwei Höhen.'
  }
  return 'Das gute Licht nicht mit zu vielen Leuchten zerstören: wenige präzise Lichtpunkte, blendfreie Akzente und bewusst dunklere Zonen für Tiefe.'
}

function concernRecommendations(input: DesignInput): Recommendation[] {
  const text = input.concern.toLowerCase()
  const recs: Recommendation[] = []

  if (/dunkel|licht|hell/.test(text) || input.signals.brightness < 0.45) {
    recs.push({
      title: 'Licht zuerst lösen',
      detail: 'Vertikale Flächen aufhellen, eine indirekte Lichtlinie ergänzen und schwere Fensterzonen visuell öffnen. Das verändert den Raum stärker als neue Deko.',
      impact: 'hoch',
    })
  }
  if (/klein|eng|tiefe|höhe|niedrig/.test(text)) {
    recs.push({
      title: 'Proportionen optisch strecken',
      detail: 'Vorhänge und hohe Elemente bis zur Decke führen, Bodenlinien möglichst unterbrechungsfrei halten und niedrige Möbel in der Hauptsichtachse einsetzen.',
      impact: 'hoch',
    })
  }
  if (/möbel|ordnung|stauraum|voll|chaos/.test(text)) {
    recs.push({
      title: 'Volumen bündeln',
      detail: 'Kleine Einzelmöbel reduzieren und Stauraum in ein großes, ruhiges Volumen zusammenziehen. So entsteht freie Fläche statt nur mehr Platz zum Verstauen.',
      impact: 'hoch',
    })
  }
  if (/farbe|tapete|wand|langweilig/.test(text)) {
    recs.push({
      title: 'Eine Wandidee, nicht fünf',
      detail: 'Eine zusammenhängende Material- oder Farbfläche definieren und sie an angrenzenden Details wiederholen. Das wirkt hochwertiger als viele Akzentwände.',
      impact: 'mittel',
    })
  }

  return recs
}

export function createConcept(input: DesignInput): DesignConcept {
  const move = roomMoves[input.roomType]
  const palette = choosePalette(input)
  const recommendations = concernRecommendations(input)
  const base: Recommendation[] = [
    {
      title: 'Blickachse klären',
      detail: 'Der erste Blick beim Betreten bekommt ein bewusstes Ziel. Alles, was diese Achse zufällig unterbricht, wird verschoben, gebündelt oder optisch beruhigt.',
      impact: 'hoch',
    },
    {
      title: 'Wiederholung schafft Einheit',
      detail: 'Maximal drei Hauptmaterialien und eine Akzentfarbe werden konsequent wiederholt – bei Leuchten, Griffen, Textilien oder Kanten.',
      impact: 'mittel',
    },
  ]

  const modePhrase = input.mode === 'inspire'
    ? 'Ein überraschendes Konzept, das zuerst die Architektur des Raums nutzt und erst danach Möbel ergänzt.'
    : 'Ein präzises Konzept, das die genannten Störpunkte löst, ohne den Raum mit Einzelmaßnahmen zu überladen.'

  const budgetPhrase = input.budget === 'smart'
    ? 'mit maximaler Wirkung und wenig Umbau: Licht, Farbe, Umstellen und wenige gezielte Käufe'
    : input.budget === 'balanced'
      ? 'mit einer Mischung aus Oberflächen, Licht, Möbelanpassungen und einzelnen Einbauten'
      : 'mit architektonischen Eingriffen, maßgefertigten Elementen und einer konsequenten Materialidee'

  return {
    name: input.mode === 'inspire' ? 'The Quiet Wow' : 'Clear Space Reset',
    thesis: `${modePhrase} Die Richtung ist ${budgetPhrase}.`,
    palette,
    recommendations: [...recommendations, ...base].slice(0, 4),
    lighting: lightingAdvice(input),
    layout: move.layout,
    surfaces: move.material,
    signatureMove: move.signature,
    firstSteps: [
      'Hauptblickachse markieren und alles Temporäre aus dieser Zone entfernen.',
      'Lichtwirkung testen: vorhandene Leuchten ausschalten und mit zwei mobilen Lichtquellen verschiedene Höhen simulieren.',
      'Eine Material- und Farbpalette festlegen, bevor einzelne Möbel oder Deko gekauft werden.',
    ],
  }
}
