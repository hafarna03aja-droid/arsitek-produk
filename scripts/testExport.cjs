// CommonJS test runner that registers ts-node so we can require .ts modules
require('ts-node/register');
const path = require('path');
const fs = require('fs');
const { Packer } = require('docx');

const svc = require(path.resolve(__dirname, '..', 'services', 'exportService.ts'));
const types = require(path.resolve(__dirname, '..', 'types.ts'));

async function run() {
  const sample = [
    { title: 'Modul 1', description: 'Deskripsi modul', objectives: ['Obj 1'], lessons: [{ title: 'Pel 1', description: 'Desc', durationMinutes: 30, resources: ['ref1'] }] }
  ];
  const doc = svc.buildDocument(sample, types.ProductType.Course, 'Ide Uji');
  if (!doc) { console.error('buildDocument returned null'); process.exit(1); }
  const buffer = await Packer.toBuffer(doc);
  const out = path.resolve(__dirname, '..', 'out-test.docx');
  fs.writeFileSync(out, buffer);
  console.log('Wrote', out);
}

run().catch(err => { console.error(err); process.exit(1); });
