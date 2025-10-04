import { Document, Packer, Paragraph, HeadingLevel, AlignmentType } from 'docx';
import { GeneratedStructure, ProductType, CourseStructure, EbookStructure, WebinarStructure } from '../types';

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

export const exportToDocx = async (
    structure: GeneratedStructure,
    productType: ProductType,
    idea: string
) => {
    if (!structure) return;

    // Membuat array untuk menampung semua elemen paragraf dan heading
    const children: Paragraph[] = [
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

    // Logika untuk setiap jenis produk
    switch (productType) {
        case ProductType.Course:
            const course = structure as CourseStructure;
            course.forEach((mod, modIndex) => {
                children.push(new Paragraph({
                    text: `Modul ${modIndex + 1}: ${mod.title}`,
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 200, after: 100 },
                }));
                (mod.lessons || []).forEach((lesson) => {
                    children.push(new Paragraph({
                        text: lesson.title,
                        bullet: { level: 0 },
                    }));
                });
            });
            break;

        case ProductType.Ebook:
            const ebook = structure as EbookStructure;
            ebook.forEach((chap, chapIndex) => {
                children.push(new Paragraph({
                    text: `Bab ${chapIndex + 1}: ${chap.title}`,
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 200, after: 100 },
                }));
                (chap.subPoints || []).forEach((point) => {
                    children.push(new Paragraph({
                        text: point,
                        bullet: { level: 0 },
                    }));
                });
            });
            break;

        case ProductType.Webinar:
            const webinar = structure as WebinarStructure;
            webinar.forEach((section) => {
                children.push(new Paragraph({
                    text: section.title,
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 200, after: 100 },
                }));
                children.push(new Paragraph({
                    text: section.content,
                    spacing: { after: 100 }
                }));
            });
            break;
    }

    const doc = new Document({
        sections: [{
            properties: {},
            children: children,
        }],
    });

    const blob = await Packer.toBlob(doc);
    saveDocumentToFile(blob, `AI-Architect-Struktur-${productType.replace(' ', '-')}.docx`);
};
