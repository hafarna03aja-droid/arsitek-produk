
import React from 'react';
import { ProductType, GeneratedStructure, CourseStructure, EbookStructure, WebinarStructure } from '../types';

interface StructureDisplayProps {
  structure: GeneratedStructure | null;
  productType: ProductType | null;
  isLoading: boolean;
  error: string | null;
  onStructureChange: (newStructure: GeneratedStructure) => void;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-800/50 rounded-lg">
    <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="mt-4 text-lg font-medium text-slate-300">AI sedang merancang struktur Anda...</p>
    <p className="text-sm text-slate-400">Ini mungkin memakan waktu beberapa detik.</p>
  </div>
);

const InitialState: React.FC = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-700">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M12 20h.01"/><path d="M12 14h.01"/><path d="M12 8h.01"/><path d="M12 2h.01"/><path d="M20 12h.01"/><path d="M14 12h.01"/><path d="M8 12h.01"/><path d="M2 12h.01"/></svg>
        <h3 className="mt-4 text-xl font-semibold text-slate-200">Struktur Anda Akan Muncul di Sini</h3>
        <p className="mt-1 text-slate-400">Isi ide, pilih jenis produk, dan biarkan AI merancang kerangkanya untuk Anda.</p>
    </div>
);


export const StructureDisplay: React.FC<StructureDisplayProps> = ({ structure, productType, isLoading, error, onStructureChange }) => {

  const handleEdit = <T extends keyof any, V>(path: (string | number)[], field: T, value: V) => {
    const newStructure = JSON.parse(JSON.stringify(structure)); // Deep copy
    let current = newStructure;
    for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
    }
    current[path[path.length - 1]][field] = value;
    onStructureChange(newStructure);
  };
  
  const handleListEdit = (path: (string | number)[], index: number, value: string) => {
     const newStructure = JSON.parse(JSON.stringify(structure));
     let current = newStructure;
     for (const key of path) {
         current = current[key];
     }
     current[index] = value;
     onStructureChange(newStructure);
  };

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg">{error}</div>;
    if (!structure || !productType) return <InitialState />;

    switch (productType) {
      case ProductType.Course:
        const course = structure as CourseStructure;
        return (
          <div className="space-y-6">
            {course.map((mod, modIndex) => (
              <div key={modIndex} className="bg-slate-800/70 p-5 rounded-lg border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                    <span className="flex-shrink-0 bg-violet-500/20 text-violet-300 text-sm font-bold w-10 h-10 rounded-full flex items-center justify-center border-2 border-violet-500/50">{modIndex + 1}</span>
                    <input type="text" value={mod.title} onChange={(e) => handleEdit([modIndex], 'title', e.target.value)} className="w-full bg-transparent text-2xl font-bold text-violet-300 focus:outline-none focus:ring-1 focus:ring-violet-500 rounded px-2 py-1 -ml-2" />
                </div>
                <ul className="space-y-2 pl-8 border-l-2 border-slate-700 ml-5">
                  {(mod.lessons || []).map((lesson, lessonIndex) => (
                    <li key={lessonIndex} className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 flex-shrink-0"><path d="m9 18 6-6-6-6"/></svg>
                        <input type="text" value={lesson.title} onChange={(e) => handleEdit([modIndex, 'lessons', lessonIndex], 'title', e.target.value)} className="w-full bg-slate-800/0 hover:bg-slate-700/50 focus:bg-slate-700/50 p-2 rounded text-slate-300 focus:outline-none focus:ring-1 focus:ring-violet-600 transition-colors"/>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );
      case ProductType.Ebook:
        const ebook = structure as EbookStructure;
        return (
            <div className="space-y-6">
                {ebook.map((chap, chapIndex) => (
                  <div key={chapIndex} className="bg-slate-800/70 p-5 rounded-lg border border-slate-700">
                     <div className="flex items-center gap-3 mb-4">
                        <span className="flex-shrink-0 bg-sky-500/20 text-sky-300 text-sm font-bold w-10 h-10 rounded-full flex items-center justify-center border-2 border-sky-500/50">{chapIndex + 1}</span>
                        <input type="text" value={chap.title} onChange={(e) => handleEdit([chapIndex], 'title', e.target.value)} className="w-full bg-transparent text-2xl font-bold text-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-500 rounded px-2 py-1 -ml-2"/>
                    </div>
                    <ul className="space-y-2 pl-8 ml-5 list-disc list-inside text-slate-400">
                        {(chap.subPoints || []).map((point, pointIndex) => (
                             <li key={pointIndex}>
                                <input type="text" value={point} onChange={(e) => handleListEdit([chapIndex, 'subPoints'], pointIndex, e.target.value)} className="w-full inline bg-slate-800/0 hover:bg-slate-700/50 focus:bg-slate-700/50 p-2 rounded text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-600 transition-colors"/>
                            </li>
                        ))}
                    </ul>
                  </div>
                ))}
            </div>
        );
      case ProductType.Webinar:
        const webinar = structure as WebinarStructure;
        return (
            <div className="space-y-4">
                {webinar.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="bg-slate-800/70 p-5 rounded-lg border border-slate-700">
                    <input type="text" value={section.title} onChange={(e) => handleEdit([sectionIndex], 'title', e.target.value)} className="w-full bg-transparent text-xl font-bold text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-2 py-1 -ml-2 mb-2"/>
                    <textarea value={section.content} onChange={(e) => handleEdit([sectionIndex], 'content', e.target.value)} className="w-full bg-slate-800/0 hover:bg-slate-700/50 focus:bg-slate-700/50 p-2 rounded text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-colors h-24 resize-y"/>
                  </div>
                ))}
            </div>
        );
      default:
        return <InitialState />;
    }
  };

  return <div className="w-full mt-8">{renderContent()}</div>;
};
