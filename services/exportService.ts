import { Document, Packer, Paragraph, HeadingLevel, AlignmentType, TextRun, Footer, Header, PageBreak, SimpleField, StyleLevel } from 'docx';
import { TableOfContents } from 'docx';
import { GeneratedStructure, ProductType, CourseStructure, EbookStructure, WebinarStructure, Module, Lesson, Chapter, SubPoint, WebinarSection } from '../types';

// Helper untuk memicu unduhan file di browser
const saveDocumentToFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const buildDocument = (
    structure: GeneratedStructure,
    productType: ProductType,
    idea: string
) => {
    if (!structure) return null;

    // Membuat array untuk menampung semua elemen paragraf, heading, dan file-child lain (TOC)
    const children: any[] = [
        new Paragraph({
            text: idea,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ 
            text: productType, 
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER, 
            spacing: { after: 400 } 
        }),
    ];

    // Tambahkan metadata dan ringkasan umum
    const now = new Date();
    children.push(new Paragraph({ text: `Tanggal: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, spacing: { after: 200 }, alignment: AlignmentType.CENTER }));
    children.push(new Paragraph({ text: `Ringkasan Struktur`, heading: HeadingLevel.HEADING_3, spacing: { before: 300, after: 100 } }));

    // Sisipkan heading Daftar Isi dan Table of Contents field yang bisa di-update di Word
    children.push(new Paragraph({ text: `Daftar Isi`, heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 80 } }));
    children.push(new TableOfContents('Daftar Isi', { headingStyleRange: '1-3', hyperlink: true, pageNumbersEntryLevelsRange: '1-3', entryAndPageNumberSeparator: '\t', preserveTabInEntries: true, stylesWithLevels: [ new StyleLevel('Heading 1', 1), new StyleLevel('Heading 2', 2), new StyleLevel('Heading 3', 3) ] }));

    // Helper kecil untuk membuat paragraf deskriptif
    const addDetailBlock = (title: string, text: string) => {
        children.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_4, spacing: { before: 150, after: 80 } }));
        children.push(new Paragraph({ text, spacing: { after: 120 } }));
    };

    // Logika untuk setiap jenis produk
    switch (productType) {
        case ProductType.Course:
            const course = structure as CourseStructure;
            // Page break after TOC (TOC already inserted above)
            children.push(new Paragraph({ children: [ new PageBreak() ] }));
            // Ringkasan singkat jumlah modul/lesson
            const totalModules = course.length;
            const totalLessons = course.reduce((s, m) => s + (m.lessons ? m.lessons.length : 0), 0);
            children.push(new Paragraph({ text: `Total Modul: ${totalModules}    |    Total Pelajaran: ${totalLessons}`, spacing: { after: 200 } }));

            course.forEach((mod, modIndex) => {
                children.push(new Paragraph({
                    text: `Modul ${modIndex + 1}: ${mod.title}`,
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 200, after: 100 },
                }));

                // Deskripsi modul (gunakan jika tersedia)
                addDetailBlock('Deskripsi Modul', mod.description || 'Tidak ada deskripsi modul.');

                // Tujuan pembelajaran umum untuk modul
                addDetailBlock('Tujuan Pembelajaran', (mod.objectives && mod.objectives.length) ? mod.objectives.map(o => `- ${o}`).join('\n') : '- (Tujuan belum ditambahkan)');

                (mod.lessons || []).forEach((lesson, lessonIndex) => {
                    // Judul lesson sebagai bullet
                    children.push(new Paragraph({ text: `${lessonIndex + 1}. ${lesson.title}`, bullet: { level: 0 } }));

                    // Rincian tiap lesson: deskripsi, aktivitas, estimasi waktu, resource
                    children.push(new Paragraph({ text: `Deskripsi:`, spacing: { after: 40 }, indent: { left: 720 } }));
                    children.push(new Paragraph({ text: lesson.description || '- (Deskripsi belum ditambahkan)', spacing: { after: 80 }, indent: { left: 720 } }));
                    children.push(new Paragraph({ text: `Aktivitas yang disarankan:`, spacing: { after: 40 }, indent: { left: 720 } }));
                    children.push(new Paragraph({ text: `- Diskusi / Tugas / Kuis singkat untuk mengecek pemahaman.`, spacing: { after: 80 }, indent: { left: 720 } }));
                    const durationText = lesson.durationMinutes ? `${lesson.durationMinutes} menit` : 'Estimasi durasi: 30 - 60 menit';
                    children.push(new Paragraph({ text: `Estimasi durasi: ${durationText}`, spacing: { after: 120 }, indent: { left: 720 } }));
                    children.push(new Paragraph({ text: `Sumber / Referensi:`, spacing: { after: 40 }, indent: { left: 720 } }));
                    children.push(new Paragraph({ text: (lesson.resources && lesson.resources.length) ? lesson.resources.map(r => `- ${r}`).join('\n') : '- (Tidak ada resource terdaftar)', spacing: { after: 120 }, indent: { left: 720 } }));
                });
                // Put a page break between modules to make DOC lebih terpisah
                children.push(new Paragraph({ children: [ new PageBreak() ] }));
            });
            break;

        case ProductType.Ebook:
            const ebook = structure as EbookStructure;
            // Ringkasan jumlah bab dan subpoint
            const totalChapters = ebook.length;
            const totalPoints = ebook.reduce((s, c) => s + (c.subPoints ? c.subPoints.length : 0), 0);
            children.push(new Paragraph({ text: `Total Bab: ${totalChapters}    |    Total Sub-poin: ${totalPoints}`, spacing: { after: 200 } }));

            // Page break after TOC (TOC already inserted above)
            children.push(new Paragraph({ children: [ new PageBreak() ] }));

            ebook.forEach((chap, chapIndex) => {
                children.push(new Paragraph({
                    text: `Bab ${chapIndex + 1}: ${chap.title}`,
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 200, after: 100 },
                }));

                addDetailBlock('Ringkasan Bab', chap.summary || 'Tidak ada ringkasan bab.');

                (chap.subPoints || []).forEach((point, pointIndex) => {
                    children.push(new Paragraph({ text: `${pointIndex + 1}. ${point.text}`, bullet: { level: 0 } }));
                    // Tambah deskripsi singkat untuk tiap sub-point
                    children.push(new Paragraph({ text: `Deskripsi: ${point.description || '- (Deskripsi belum ditambahkan)'}`, spacing: { after: 80 }, indent: { left: 720 } }));
                });
                // Put a page break after each chapter
                children.push(new Paragraph({ children: [ new PageBreak() ] }));
            });
            break;

        case ProductType.Webinar:
            const webinar = structure as WebinarStructure;
            // Ringkasan jumlah sesi dan total estimasi waktu sederhana
            const totalSections = webinar.length;
            children.push(new Paragraph({ text: `Total Sesi: ${totalSections}`, spacing: { after: 200 } }));

            // Page break after TOC (TOC already inserted above)
            children.push(new Paragraph({ children: [ new PageBreak() ] }));

            webinar.forEach((section, idx) => {
                children.push(new Paragraph({
                    text: `Sesi ${idx + 1}: ${section.title}`,
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 200, after: 100 },
                }));

                addDetailBlock('Ringkasan Konten', section.content || 'Tuliskan ringkasan konten sesi ini.');
                addDetailBlock('Tujuan Sesi', (section.objectives && section.objectives.length) ? section.objectives.map(o => `- ${o}`).join('\n') : '- (Tujuan belum ditambahkan)');
                addDetailBlock('Aktivitas & Format', (section.activities && section.activities.length) ? section.activities.map(a => `- ${a}`).join('\n') : '- (Aktivitas belum ditambahkan)');
                addDetailBlock('Estimasi Durasi', section.durationMinutes ? `${section.durationMinutes} menit` : '60 - 120 menit (atau sesuai kebutuhan)');
                addDetailBlock('Sumber / Resources', (section.resources && section.resources.length) ? section.resources.map(r => `- ${r}`).join('\n') : '- (Tidak ada resource terdaftar)');
                // Page break antar sesi agar tiap sesi punya ruang sendiri
                children.push(new Paragraph({ children: [ new PageBreak() ] }));
            });
            break;
    }

    const doc = new Document({
        sections: [{
            properties: {},
            headers: {
                default: new Header({ children: [ new Paragraph({ text: idea, alignment: AlignmentType.CENTER }) ] })
            },
            footers: {
                default: new Footer({ children: [ new Paragraph({ children: [ new TextRun({ text: `Generated by AI Architect • ${now.toLocaleDateString()} • ` }), new SimpleField('PAGE'), new TextRun({ text: ' / ' }), new SimpleField('NUMPAGES') ], alignment: AlignmentType.CENTER }) ] })
            },
            children: children,
        }],
    });

    return doc;
};

export const exportToDocx = async (
    structure: GeneratedStructure,
    productType: ProductType,
    idea: string
) => {
    const doc = buildDocument(structure, productType, idea);
    if (!doc) return;
    const blob = await Packer.toBlob(doc as Document);
    saveDocumentToFile(blob, `AI-Architect-Struktur-${productType.replace(' ', '-')}.docx`);
};
