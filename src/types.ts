export type LevelId = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type ContextId = 'business' | 'movies' | 'travel' | 'books' | 'everyday';
export interface UserProfile {
  name: string;
  level: LevelId;
  goals: string[];
  onboarding: boolean;
}
export interface UserSettings {
  contexts: ContextId[];
  dailyGoal: number;
  accent: 'en-US' | 'en-GB';
  rate: number;
  theme: 'dark' | 'light' | 'system';
}
export interface Level {
  id: LevelId;
  title: string;
  description: string;
  planned?: boolean;
}
export interface Module {
  id: string;
  level: LevelId;
  title: string;
  description: string;
}
export interface VocabularyWord {
  id: string;
  en: string;
  ru: string;
  ipa: string;
  part: string;
  level: LevelId;
  topic: ContextId;
  example: string;
  translation: string;
  addedAt: number;
  favorite: boolean;
  custom?: boolean;
  collectionIds: string[];
  review: WordReview;
}
export interface VocabularyCollection {
  id: string;
  name: string;
}
export interface WordReview {
  repetitions: number;
  interval: number;
  ease: number;
  due: number;
  history: { at: number; quality: number }[];
}
export type ExerciseType =
  'en-ru' | 'ru-en' | 'translation' | 'order' | 'blank' | 'choice' | 'dictation' | 'mistake';
export interface Exercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  answers: string[];
  options?: string[];
  tokens?: string[];
  audio?: string;
  hints: string[];
  explanation: string;
  skill: 'Vocabulary' | 'Grammar' | 'Listening' | 'Writing';
}
export interface LessonContext {
  id: ContextId;
  examples: { en: string; ru: string }[];
  exercises: Exercise[];
  words: Omit<VocabularyWord, 'addedAt' | 'favorite' | 'collectionIds' | 'review'>[];
}
export interface Lesson {
  id: string;
  moduleId: string;
  level: LevelId;
  title: string;
  subtitle: string;
  minutes: number;
  rule: string;
  formula: string;
  sections: { title: string; text: string }[];
  mistake: string;
  contexts: LessonContext[];
}
export interface ExerciseAttempt {
  id: string;
  sessionId: string;
  exerciseId: string;
  lessonId: string;
  context: ContextId;
  prompt: string;
  answer: string;
  expected: string;
  correct: boolean;
  hints: number;
  at: number;
  skill: Exercise['skill'];
}
export interface LessonProgress {
  lessonId: string;
  completedAt: number;
  bestScore: number;
  runs: number;
}
export interface StudySession {
  id: string;
  lessonId: string;
  at: number;
  seconds: number;
  total: number;
  correct: number;
  hintCount: number;
  kind: 'lesson' | 'mixed' | 'listening';
}
export interface ActiveSession {
  id: string;
  lessonId: string;
  context: ContextId;
  exercises: Exercise[];
  index: number;
  attempts: ExerciseAttempt[];
  startedAt: number;
  elapsed: number;
  kind: StudySession['kind'];
  feedback?: ExerciseAttempt;
  draft: string;
  selected: number[];
  hintCount: number;
}
export interface ListeningMaterial {
  id: string;
  title: string;
  level: LevelId;
  topic: ContextId;
  minutes: number;
  kind: 'dialogue' | 'youtube';
  description: string;
  transcript: { speaker: string; text: string; ru: string }[];
  exercises: Exercise[];
  words: string[];
  youtubeId?: string;
  subtitles?: boolean;
}
export interface ListeningAttempt {
  materialId: string;
  sessionId: string;
  at: number;
  correct: number;
  total: number;
}
export interface AppState {
  version: 1;
  profile: UserProfile;
  settings: UserSettings;
  vocabulary: VocabularyWord[];
  collections: VocabularyCollection[];
  progress: Record<string, LessonProgress>;
  attempts: ExerciseAttempt[];
  sessions: StudySession[];
  listeningAttempts: ListeningAttempt[];
  active: ActiveSession | null;
  lastLesson: string | null;
  updatedAt: number;
}
