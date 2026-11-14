export type Role = 'admin' | 'user';
export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  bio?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface Brand {
  _id: string;
  name: string;
  country?: string;
  logoUrl?: string;
}

export interface Product {
  _id: string;
  name: string;
  brand: string;
  category: string;
  price?: number;
  description?: string;
  imageUrl?: string;
}

export interface Tag {
  _id: string;
  name: string;
  color: string;
}

export interface TutorialStep {
  order: number;
  title: string;
  description: string;
  imageUrl?: string;
  tip?: string;
}

export interface Tutorial {
  _id: string;
  title: string;
  summary: string;
  description?: string;
  level: Level;
  categoryId: string;
  style?: string;
  durationMinutes?: number;
  coverImage?: string;
  videoUrl?: string;
  steps: TutorialStep[];
  productIds: string[];
  tags: string[];
  status: 'draft' | 'published';
  authorId: string;
  authorName: string;
  ratingAvg: number;
  ratingCount: number;
  commentsCount: number;
  views: number;
  createdAt: string;
}

/** Detalle de un tutorial: incluye la categoría y los productos ya resueltos. */
export interface TutorialDetail extends Tutorial {
  category: Category | null;
  products: Product[];
}

export interface TutorialInput {
  title: string;
  summary: string;
  description?: string;
  level: Level;
  categoryId: string;
  style?: string;
  durationMinutes?: number;
  coverImage?: string;
  videoUrl?: string;
  steps: { title: string; description: string; imageUrl?: string; tip?: string }[];
  productIds: string[];
  tags: string[];
  status: 'draft' | 'published';
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface TutorialQuery {
  search?: string;
  level?: string;
  categoryId?: string;
  tag?: string;
  authorId?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface CommentItem {
  _id: string;
  tutorialId: string;
  authorId: string;
  authorName: string;
  message: string;
  parentId?: string;
  createdAt: string;
}

export interface ReviewItem {
  _id: string;
  tutorialId: string;
  userId: string;
  userName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Progress {
  completedSteps: number[];
  totalSteps: number;
  percent: number;
  status: 'in_progress' | 'completed';
}

export interface ProgressSummary extends Progress {
  tutorialId: string;
  updatedAt: string;
  completedAt?: string;
  tutorial: Pick<Tutorial, '_id' | 'title' | 'coverImage' | 'level' | 'authorName'>;
}

export interface KitItem {
  _id: string;
  productName: string;
  quantity: number;
  notes?: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ActivityItem {
  _id: string;
  action: string;
  description: string;
  createdAt: string;
}

export interface Stats {
  tutorials: number;
  creators: number;
  learners: number;
  comments: number;
  categories: number;
}
