export interface Character {
  id: string
  name: string
  title: string
  description: string
  avatar: string
  background: string
  secret?: string
  goal: string
  skills?: string[]
}

export interface Clue {
  id: string
  name: string
  description: string
  type: 'document' | 'testimony' | 'object' | 'scene'
  icon: string
  discovered: boolean
  content?: string
}

export interface GamePhase {
  id: string
  name: string
  description: string
  duration?: number // 分钟
  actions?: string[]
}

export interface GameScript {
  id: string
  title: string
  description: string
  maxPlayers: number
  minPlayers: number
  estimatedTime: number // 分钟
  difficulty: 'easy' | 'medium' | 'hard'
  characters: Character[]
  phases: GamePhase[]
  clues: Clue[]
  storyline: string[]
}

export interface PlayerRole {
  playerId: string
  characterId: string
  isAlive: boolean
  hasVoted: boolean
  discoveredClues: string[]
  inventory: string[]
}

export interface GameState {
  scriptId: string
  phase: string
  round: number
  startTime: number
  players: PlayerRole[]
  discoveredClues: string[]
  votes: Record<string, string>
  gameLog: GameLogEntry[]
  winner?: string
  isEnded: boolean
}

export interface GameLogEntry {
  timestamp: number
  type: 'system' | 'action' | 'discovery' | 'vote' | 'message'
  content: string
  playerId?: string
  data?: any
}