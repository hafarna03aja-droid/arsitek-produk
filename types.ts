
export enum ProductType {
  Course = 'Kursus',
  Ebook = 'E-book',
  Webinar = 'Webinar'
}

// Course Structure
export interface Lesson {
  title: string;
  description?: string; // deskripsi singkat untuk lesson
  durationMinutes?: number; // estimasi durasi dalam menit
  resources?: string[]; // daftar resource / referensi
}

export interface Module {
  title: string;
  description?: string; // deskripsi modul
  objectives?: string[]; // tujuan pembelajaran modul
  lessons: Lesson[];
}

export type CourseStructure = Module[];


// E-book Structure
// E-book Structure
export interface SubPoint {
  text: string;
  description?: string; // penjelasan untuk sub-point
}

export interface Chapter {
  title: string;
  summary?: string; // ringkasan bab
  subPoints: SubPoint[];
}

export type EbookStructure = Chapter[];


// Webinar Structure
// Webinar Structure
export interface WebinarSection {
  title: string;
  content?: string;
  objectives?: string[];
  durationMinutes?: number;
  activities?: string[];
  resources?: string[];
}

export type WebinarStructure = WebinarSection[];

// Union type for any generated structure
export type GeneratedStructure = CourseStructure | EbookStructure | WebinarStructure;
