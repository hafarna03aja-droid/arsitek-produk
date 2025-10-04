
export enum ProductType {
  Course = 'Kursus',
  Ebook = 'E-book',
  Webinar = 'Webinar'
}

// Course Structure
export interface Lesson {
  title: string;
}

export interface Module {
  title: string;
  lessons: Lesson[];
}

export type CourseStructure = Module[];


// E-book Structure
export interface Chapter {
  title: string;
  subPoints: string[];
}

export type EbookStructure = Chapter[];


// Webinar Structure
export interface WebinarSection {
  title: string;
  content: string;
}

export type WebinarStructure = WebinarSection[];

// Union type for any generated structure
export type GeneratedStructure = CourseStructure | EbookStructure | WebinarStructure;
