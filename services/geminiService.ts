
import { GoogleGenAI, Type } from "@google/genai";
import { ProductType } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const Schemas = {
  [ProductType.Course]: {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "Judul modul kursus yang menarik dan jelas."
        },
        lessons: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "Judul pelajaran spesifik di dalam modul ini."
              },
            },
            required: ['title']
          },
          description: "Daftar pelajaran di dalam modul."
        },
      },
      required: ['title', 'lessons']
    }
  },
  [ProductType.Ebook]: {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "Judul bab e-book yang informatif."
        },
        subPoints: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          },
          description: "Daftar sub-poin atau ide kunci yang akan dibahas dalam bab ini."
        },
      },
      required: ['title', 'subPoints']
    }
  },
  [ProductType.Webinar]: {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "Nama bagian alur webinar, contoh: 'Pembukaan', 'Isi Utama 1', 'Penutup'."
        },
        content: {
          type: Type.STRING,
          description: "Deskripsi singkat atau poin-poin yang akan dibahas di bagian ini."
        },
      },
      required: ['title', 'content']
    }
  },
};

const Prompts = {
  [ProductType.Course]: (idea: string) => `Buatkan struktur kursus online yang komprehensif tentang topik: "${idea}". Strukturnya harus terdiri dari beberapa modul, dan setiap modul harus memiliki beberapa judul pelajaran yang relevan. Susun dari konsep dasar hingga ke tingkat mahir secara logis.`,
  [ProductType.Ebook]: (idea: string) => `Buatkan daftar isi atau kerangka detail untuk e-book tentang topik: "${idea}". Kerangka ini harus mencakup judul-judul bab utama, dan untuk setiap bab, berikan beberapa sub-poin penting yang harus dibahas secara mendalam.`,
  [ProductType.Webinar]: (idea: string) => `Rancang alur presentasi yang menarik untuk sebuah webinar dengan topik: "${idea}". Alurnya harus mencakup bagian: Pembukaan (perkenalan singkat dan hook yang kuat), Isi Utama (bagi menjadi 2-3 poin kunci), Penutup (ringkasan, kesimpulan, dan call-to-action yang jelas), dan Sesi T&J.`,
};

export const generateStructure = async (idea: string, productType: ProductType) => {
  const model = "gemini-2.5-flash";

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: Prompts[productType](idea),
      config: {
        systemInstruction: "Anda adalah seorang arsitek konten ahli yang berspesialisasi dalam merancang struktur produk digital. Anda membantu pengguna membuat kerangka yang logis, komprehensif, dan siap digunakan.",
        responseMimeType: "application/json",
        responseSchema: Schemas[productType],
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating structure with Gemini:", error);
    throw new Error("Gagal menghasilkan struktur. Silakan coba lagi.");
  }
};
