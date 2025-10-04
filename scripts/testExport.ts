import fs from 'fs';
import { Packer } from 'docx';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  const svcPath = path.resolve(__dirname, '..', 'services', 'exportService.ts');
  const typesPath = path.resolve(__dirname, '..', 'types.ts');
  const { buildDocument } = await import(`file://${svcPath}`) as any;
  const { ProductType } = await import(`file://${typesPath}`) as any;

  const sample = [
    { title: 'Modul 1', description: 'Deskripsi modul', objectives: ['Obj 1'], lessons: [{ title: 'Pel 1', description: 'Desc', durationMinutes: 30, resources: ['ref1'] }] }
  ];
  const doc = buildDocument(sample as any, ProductType.Course, 'Ide Uji');
  if (!doc) { console.error('buildDocument returned null'); process.exit(1); }
  const buffer = await Packer.toBuffer(doc as any);
  const out = path.resolve(__dirname, '..', 'out-test.docx');
  fs.writeFileSync(out, buffer);
  console.log('Wrote', out);
})();
