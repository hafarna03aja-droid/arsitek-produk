import React, { useState, useCallback, useEffect } from 'react';
import { ProductType, GeneratedStructure } from './types';
import { generateStructure } from './services/geminiService';
import { StructureDisplay } from './components/StructureDisplay';
import { exportToDocx } from './services/exportService';

const productOptions = [
  { id: ProductType.Course, label: 'Kursus Online', icon: '🎓', color: 'violet' },
  { id: ProductType.Ebook, label: 'E-book', icon: '📖', color: 'sky' },
  { id: ProductType.Webinar, label: 'Webinar', icon: '💻', color: 'emerald' },
];

const App: React.FC = () => {
  const [productIdea, setProductIdea] = useState<string>('');
  const [productType, setProductType] = useState<ProductType | null>(null);
  const [structure, setStructure] = useState<GeneratedStructure | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!productIdea || !productType) {
      setError('Harap masukkan ide dan pilih jenis produk terlebih dahulu.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setStructure(null);

    try {
      const result = await generateStructure(productIdea, productType);
      setStructure(result);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan yang tidak diketahui.');
    } finally {
      setIsLoading(false);
    }
  }, [productIdea, productType]);
  
  const handleStructureChange = useCallback((newStructure: GeneratedStructure) => {
    setStructure(newStructure);
    try {
      localStorage.setItem('ai-architect-structure', JSON.stringify(newStructure));
    } catch {}
  }, []);

  // load persisted state on mount
  useEffect(() => {
    try {
      const idea = localStorage.getItem('ai-architect-idea');
      const type = localStorage.getItem('ai-architect-type');
      const struct = localStorage.getItem('ai-architect-structure');
      if (idea) setProductIdea(idea);
      if (type) setProductType((type as unknown) as ProductType);
      if (struct) setStructure(JSON.parse(struct));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('ai-architect-idea', productIdea); } catch {}
  }, [productIdea]);

  useEffect(() => {
    try { localStorage.setItem('ai-architect-type', productType as string); } catch {}
  }, [productType]);

  const handleExport = useCallback(async () => {
    if (structure && productType && productIdea) {
      try {
        await exportToDocx(structure, productType, productIdea);
      } catch (err) {
        console.error("Gagal mengekspor dokumen:", err);
        setError("Gagal mengekspor dokumen. Silakan coba lagi.");
      }
    }
  }, [structure, productType, productIdea]);


  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        
        <header className="text-center mb-10">
            <div className="inline-block bg-gradient-to-r from-violet-500 to-sky-500 p-1 rounded-full mb-4">
                <div className="bg-slate-900 rounded-full p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-200"><path d="M12 20h.01"/><path d="M12 14h.01"/><path d="M12 8h.01"/><path d="M12 2h.01"/><path d="M20 12h.01"/><path d="M14 12h.01"/><path d="M8 12h.01"/><path d="M2 12h.01"/></svg>
                </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-slate-400">
                AI Architect
            </h1>
            <p className="mt-2 text-lg text-slate-400">Rancang Struktur Produk Digital Anda dalam Hitungan Detik</p>
        </header>

        <main className="bg-slate-800/50 p-6 sm:p-8 rounded-2xl border border-slate-700/50 shadow-2xl shadow-slate-950/50">
          <div className="space-y-6">
            <div>
              <label htmlFor="productIdea" className="block text-sm font-medium text-slate-300 mb-2">
                1. Masukkan Ide Produk Digital Anda
              </label>
              <textarea
                id="productIdea"
                value={productIdea}
                onChange={(e) => setProductIdea(e.target.value)}
                placeholder="Contoh: Belajar React untuk pemula dengan studi kasus membangun toko online"
                className="w-full h-24 p-3 bg-slate-900/70 border border-slate-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all placeholder-slate-500"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                2. Pilih Jenis Produk
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {productOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setProductType(opt.id)}
                    disabled={isLoading}
                    className={`p-4 rounded-lg border-2 text-left transition-all duration-200 flex items-center gap-4
                      ${productType === opt.id 
                        ? `bg-${opt.color}-500/10 border-${opt.color}-500 shadow-lg shadow-${opt.color}-500/10` 
                        : 'bg-slate-800 border-slate-700 hover:border-slate-500'}
                      ${isLoading ? 'cursor-not-allowed opacity-60' : ''}`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                        <span className="font-semibold text-slate-100">{opt.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <button
                onClick={handleGenerate}
                disabled={isLoading || !productIdea || !productType}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:from-violet-500 hover:to-sky-500 transition-transform duration-200 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 5 6 6-6 6"/><path d="M4 11h17"/></svg>
                    <span>Buat Kerangka Struktur</span>
                  </>
                )}
              </button>
              {error && !isLoading && <p className="text-red-400 mt-2 text-center">{error}</p>}
            </div>
          </div>
          
          <div className="mt-8 border-t-2 border-slate-700/50">
             <div className="flex justify-between items-center pt-8 mb-6 sm:px-2">
                 <h2 className="text-2xl font-bold text-slate-300">Hasil Rancangan AI</h2>
                 {structure && !isLoading && (
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                        title="Export sebagai dokumen Word (.docx)"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
                        <span className="hidden sm:inline">Export DOC</span>
                    </button>
                 )}
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-slate-600 rounded" onClick={() => {
              // force save current structure
              try { localStorage.setItem('ai-architect-structure', JSON.stringify(structure)); } catch {}
            }}>Simpan</button>
            <button className="px-3 py-1 bg-slate-600 rounded" onClick={() => {
              try {
                const s = localStorage.getItem('ai-architect-structure');
                if (s) setStructure(JSON.parse(s));
              } catch {}
            }}>Load</button>
            <button className="px-3 py-1 bg-red-700 rounded" onClick={() => {
              try { localStorage.removeItem('ai-architect-structure'); setStructure(null); setProductIdea(''); setProductType(null);} catch {}
            }}>Reset</button>
          </div>
             </div>
             <StructureDisplay 
                structure={structure}
                productType={productType}
                isLoading={isLoading}
                error={error && isLoading ? error : null}
                onStructureChange={handleStructureChange}
             />
          </div>

        </main>
        
        <footer className="text-center mt-12 pb-4">
            <p className="text-sm text-slate-500">
                Dibuat bersama 24 Learning Centre
            </p>
        </footer>

      </div>
    </div>
  );
};

export default App;