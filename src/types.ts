export type Mode = 'inspire' | 'solve'
export type RoomType = 'Wohnzimmer' | 'Küche' | 'Schlafzimmer' | 'Bad' | 'Arbeitszimmer' | 'Essbereich' | 'Flur' | 'Andere'
export type Budget = 'smart' | 'balanced' | 'bold'

export interface ImageSignals {
  brightness: number
  warmth: number
  saturation: number
}

export interface DesignInput {
  mode: Mode
  roomType: RoomType
  concern: string
  budget: Budget
  signals: ImageSignals
}

export interface Recommendation {
  title: string
  detail: string
  impact: 'hoch' | 'mittel'
}

export interface DesignConcept {
  name: string
  thesis: string
  palette: string[]
  recommendations: Recommendation[]
  lighting: string
  layout: string
  surfaces: string
  signatureMove: string
  firstSteps: string[]
}
