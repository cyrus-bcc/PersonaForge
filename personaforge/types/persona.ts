export type RiskAffinity = 'conservative' | 'moderate' | 'balanced' | 'growth'
export type PersonaStatus = 'active' | 'learning' | 'paused'
export type Channel = 'email' | 'sms' | 'whatsapp' | 'app push'

export type Persona = {
  id: string
  name: string
  summary: string
  status: PersonaStatus
  riskAffinity: RiskAffinity
  tonePreference: 'friendly' | 'professional' | 'empathetic' | 'concise' | string
  contactChannels: Channel[]
  goals: string[]
  createdAt: string
  updatedAt: string
}
