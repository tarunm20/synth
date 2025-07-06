import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface User {
  id: number
  username: string
  email: string
}

export interface Deck {
  id: number
  name: string
  description: string
  createdAt: string
  cards: Card[]
}

export interface Card {
  id: number
  question: string
  answer: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
}

export interface StudySession {
  id: number
  response: string
  score: number
  confidence: number
  feedback: string
  studiedAt: string
  card: Card
}

export interface DeckStats {
  id: number
  name: string
  description: string
  cardCount: number
  masteryScore: number
  lastStudied: string | null
  createdAt: string
}

export interface StudyProgress {
  id: number
  currentCardIndex: number
  totalCards: number
  cardsCompleted: number
  lastStudiedAt: string
  isCompleted: boolean
  deck: {
    id: number
    name: string
  }
}

export const userApi = {
  create: (data: { username: string; email: string; password: string }) => 
    api.post<User>('/users', data),
  getUser: (id: number) => api.get<User>(`/users/${id}`),
}

export const deckApi = {
  getDecks: () => api.get<Deck[]>('/decks'),
  getUserDecks: () => api.get<DeckStats[]>('/decks/stats'),
  getDeck: (id: number) => api.get<Deck>(`/decks/${id}`),
  createFromFile: (formData: FormData) => api.post<Deck>('/decks/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  createFromText: (data: { name: string; description?: string; content: string }) => 
    api.post<Deck>('/decks/text', data),
  deleteDeck: (id: number) => api.delete(`/decks/${id}`),
}

export const studyApi = {
  getCardsForStudy: (deckId: number) => api.get<Card[]>(`/study/deck/${deckId}`),
  submitAnswer: (data: { cardId: number; answer: string }) => 
    api.post<StudySession>('/study/answer', data),
  getSessions: () => api.get<StudySession[]>('/study/sessions'),
  getProgress: (deckId: number) => api.get<StudyProgress>(`/study/progress/${deckId}`),
  saveProgress: (deckId: number, data: { 
    currentCardIndex: number; 
    totalCards: number; 
    cardsCompleted: number; 
    isCompleted: boolean 
  }) => api.post<StudyProgress>(`/study/progress/${deckId}`, data),
  getActiveProgress: () => api.get<StudyProgress[]>('/study/progress'),
  clearProgress: (deckId: number) => api.delete(`/study/progress/${deckId}`),
}