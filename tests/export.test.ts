import { buildDocument } from '../services/exportService';
import { ProductType } from '../types';
import { test, expect } from 'vitest';

test('buildDocument returns Document for sample course', () => {
  const sample = [
    { title: 'Modul 1', description: 'Deskripsi modul', objectives: ['Obj 1'], lessons: [{ title: 'Pel 1', description: 'Desc', durationMinutes: 30, resources: ['ref1'] }] }
  ];
  const doc = buildDocument(sample as any, ProductType.Course, 'Ide Uji');
  expect(doc).toBeTruthy();
});
