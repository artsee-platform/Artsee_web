import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { INSTITUTIONS_DATA, Institution, InstitutionData } from '../data/institutions';
import { Search, ExternalLink, GraduationCap, ChevronRight, Sparkles, Zap, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { ShareSheet } from '../components/ShareSheet';

interface InstitutionsViewProps {
  institutionsData?: InstitutionData;
  onInstitutionClick: (inst: Institution) => void;
  onCompareOpen: () => void;
}

const institutionTagLabelMap: Record<string, string> = {
  fine_arts: '纯艺术',
  visual_arts: '视觉艺术',
  art_and_design: '艺术与设计',
  'art_&_design': '艺术与设计',
  'studio_art_&_fine_arts': '工作室艺术与纯艺术',
  art_history: '艺术史',
  graphic_design: '平面设计',
  communication_design: '传达设计',
  visual_communication: '视觉传达',
  interaction_design: '交互设计',
  industrial_design: '工业设计',
  product_design: '产品设计',
  architecture: '建筑',
  fashion_design: '服装设计',
  studio_art: '工作室艺术',
  'studio_art_(bfa)': '工作室艺术 BFA',
  'studio_art_(mfa)': '工作室艺术 MFA',
  'master_of_fine_arts_(mfa)': '艺术硕士 MFA',
  painting: '绘画',
  painting_and_drawing: '绘画与素描',
  sculpture: '雕塑',
  printmaking: '版画',
  ceramics: '陶瓷',
  photography: '摄影',
  digital_media: '数字媒体',
  media_art: '媒体艺术',
  theatre: '戏剧',
  theatre_and_performance: '戏剧与表演',
  music: '音乐',
};

const toInstitutionTagLabel = (tag: string) => {
  const key = tag.trim().toLowerCase().replace(/[\s-]+/g, '_');
  return institutionTagLabelMap[key] || tag;
};

const toUniqueOptions = (values: Array<string | undefined>) => {
  return Array.from(new Set(values.map(value => value?.trim()).filter(Boolean) as string[]))
    .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
};

const toUniqueArrayOptions = (values: Array<string[] | undefined>) => {
  return toUniqueOptions(values.flatMap(value => value || []));
};

interface FilterSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

const FilterSelect = ({ label, value, options, onChange }: FilterSelectProps) => (
  <label className="min-w-[9rem] flex-1 md:flex-none space-y-2">
    <span className="text-[8px] md:text-[9px] font-black text-ink/30 uppercase tracking-[0.25em]">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={!options.length}
      className="w-full h-10 px-3 bg-white/70 border border-silver/30 rounded-xl text-[10px] md:text-[11px] font-bold text-ink/60 outline-none transition-all hover:border-cobalt/30 focus:border-cobalt/40 disabled:cursor-not-allowed disabled:text-ink/20"
    >
      <option value="">全部{label}</option>
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </label>
);

export const InstitutionsView = ({ institutionsData = INSTITUTIONS_DATA, onInstitutionClick, onCompareOpen }: InstitutionsViewProps) => {
  const [activeRegion, setActiveRegion] = useState("中国香港");
  const [searchQuery, setSearchQuery] = useState("");
  const [regionTagFilter, setRegionTagFilter] = useState("");
  const [schoolTypeFilter, setSchoolTypeFilter] = useState("");
  const [strengthFilter, setStrengthFilter] = useState("");
  const [shareInst, setShareInst] = useState<Institution | null>(null);

  const regions = useMemo(() => Object.keys(institutionsData), [institutionsData]);
  const allInstitutions = useMemo(() => Object.values(institutionsData).flat(), [institutionsData]);
  const hasAdvancedFilters = !!(regionTagFilter || schoolTypeFilter || strengthFilter);
  const regionTagOptions = useMemo(() => toUniqueOptions(allInstitutions.map(inst => inst.regionTag)), [allInstitutions]);
  const schoolTypeOptions = useMemo(() => toUniqueOptions(allInstitutions.map(inst => inst.schoolType)), [allInstitutions]);
  const strengthOptions = useMemo(() => toUniqueArrayOptions(allInstitutions.map(inst => inst.strengthDisciplines || inst.majorStrengths)), [allInstitutions]);

  useEffect(() => {
    if (regions.length && !regions.includes(activeRegion)) {
      setActiveRegion(regions[0]);
    }
  }, [activeRegion, regions]);
  
  const currentInstitutions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const base = query || hasAdvancedFilters ? allInstitutions : institutionsData[activeRegion] || [];

    return base.filter(inst => {
      const matchesSearch = !query ||
        inst.name.toLowerCase().includes(query) ||
        inst.originalName?.toLowerCase().includes(query) ||
        inst.location.toLowerCase().includes(query);
      const matchesRegionTag = !regionTagFilter || inst.regionTag === regionTagFilter;
      const matchesSchoolType = !schoolTypeFilter || inst.schoolType === schoolTypeFilter;
      const strengths = inst.strengthDisciplines || inst.majorStrengths || [];
      const matchesStrength = !strengthFilter || strengths.includes(strengthFilter);

      return matchesSearch && matchesRegionTag && matchesSchoolType && matchesStrength;
    });
  }, [
    activeRegion,
    allInstitutions,
    hasAdvancedFilters,
    institutionsData,
    regionTagFilter,
    schoolTypeFilter,
    searchQuery,
    strengthFilter,
  ]);

  const resetFilters = () => {
    setRegionTagFilter("");
    setSchoolTypeFilter("");
    setStrengthFilter("");
  };

  return (
    <div className="bg-porcelain min-h-screen pb-20 selection:bg-cobalt selection:text-white">
      {/* Decorative Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-cobalt/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-silver/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 pt-10 relative z-10">
        {/* Header Section */}
        <header className="mb-8 space-y-4">
           <div className="flex items-center gap-3 text-cobalt">
              <div className="w-8 h-[1px] bg-cobalt" />
              <span className="text-[8px] md:text-[11px] font-bold uppercase tracking-[0.2em] italic">ArtLink Global Archive</span>
           </div>
           
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-serif font-light text-ink italic leading-[1] tracking-tight">
                全球顶尖艺术院校
              </h1>
              <p className="text-sm text-ink/40 font-light max-w-lg leading-relaxed">
                汇聚全球顶尖创意人才，探索通往艺术殿堂的学术路径。
              </p>
              <button 
                onClick={onCompareOpen}
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-cobalt text-white rounded-full text-[8px] md:text-[11px] font-bold uppercase tracking-widest hover:bg-ink transition-all shadow-lg shadow-cobalt/10"
              >
                <Sparkles size={12} />
                进入智能对比中心
              </button>
            </div>

            {/* Enhanced Search */}
            <div className="relative group w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/20 group-focus-within:text-cobalt transition-colors" size={14} />
              <input 
                type="text" 
                placeholder={searchQuery.trim() ? "搜索..." : `快速检索...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-white/50 backdrop-blur-xl border border-silver/30 rounded-xl text-[10px] focus:outline-none focus:ring-0 focus:border-cobalt/30 transition-all placeholder:text-ink/20"
              />
            </div>
          </div>
        </header>

        {/* Region Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <nav className="flex flex-wrap gap-2 p-1 bg-silver/10 rounded-xl backdrop-blur-sm w-fit">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => {
                  setActiveRegion(region);
                  setSearchQuery(""); 
                  resetFilters();
                }}
                className={cn(
                  "px-4 py-2 rounded-lg text-[8px] md:text-[11px] font-bold tracking-normal transition-all",
                  activeRegion === region && !searchQuery.trim()
                    ? "bg-white text-cobalt shadow-sm" 
                    : "text-ink/40 hover:text-ink hover:bg-white/50"
                )}
              >
                {region}
              </button>
            ))}
          </nav>
        </div>

        {/* School Metadata Filters */}
        <div className="mb-8 rounded-2xl border border-silver/20 bg-white/60 backdrop-blur-xl p-4 md:p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cobalt/5 text-cobalt flex items-center justify-center">
                <SlidersHorizontal size={16} />
              </div>
              <div>
                <p className="text-xs font-black text-ink tracking-wide">院校筛选</p>
                <p className="text-[9px] text-ink/30 font-bold uppercase tracking-[0.25em]">Region Tag / Type / Strengths</p>
              </div>
            </div>
            {hasAdvancedFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="w-fit flex items-center gap-2 px-3 py-2 rounded-xl bg-silver/20 text-[9px] font-black text-ink/40 uppercase tracking-widest hover:bg-cobalt hover:text-white transition-all"
              >
                <X size={12} />
                清除筛选
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:flex-wrap gap-3">
            <FilterSelect label="区域标签" value={regionTagFilter} options={regionTagOptions} onChange={setRegionTagFilter} />
            <FilterSelect label="院校类型" value={schoolTypeFilter} options={schoolTypeOptions} onChange={setSchoolTypeFilter} />
            <FilterSelect label="优势学科" value={strengthFilter} options={strengthOptions} onChange={setStrengthFilter} />
          </div>
        </div>

        {/* List Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <AnimatePresence mode="wait">
            {currentInstitutions.map((inst, index) => (
              <motion.div
                key={inst.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onClick={() => onInstitutionClick(inst)}
                className="group bg-white rounded-2xl md:rounded-xl p-4 md:p-5 border border-silver/20 hover:border-cobalt/30 transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                <div className="flex flex-col h-full">
                  {/* Top Header: Identity (Weibo style) - Fixed height on MD for alignment */}
                  <div className="flex items-start justify-between md:h-14 mb-2">
                     <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 md:w-10 md:h-10 bg-porcelain rounded-full md:rounded-lg flex items-center justify-center text-ink/20 group-hover:bg-cobalt group-hover:text-white transition-all overflow-hidden border border-silver/10 shrink-0">
                           <GraduationCap size={16} />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <h3 className="text-sm md:text-base font-bold text-ink leading-tight truncate">{inst.name}</h3>
                          <span className="text-[10px] md:text-[10px] text-ink/30 font-bold uppercase tracking-widest leading-none mt-1 truncate">{inst.location}</span>
                        </div>
                     </div>
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         setShareInst(inst);
                       }} 
                       className="p-2 -mr-2 text-ink/10 hover:text-cobalt transition-colors shrink-0"
                     >
                        <ExternalLink size={14} />
                     </button>
                  </div>

                  {/* Middle Content: Tags - Fixed height/min-height on MD for alignment */}
                  <div className="flex flex-wrap gap-2 md:h-12 mb-4 content-start">
                    {inst.majorStrengths?.slice(0, 3).map(tag => (
                      <span key={tag} className="px-3 py-1 bg-cobalt/5 text-cobalt rounded-full text-[9px] font-bold tracking-widest border border-cobalt/10 whitespace-nowrap">{toInstitutionTagLabel(tag)}</span>
                    ))}
                  </div>

                  {/* Media Content: Large centered image */}
                  <div className="aspect-video md:aspect-[16/9] w-full rounded-xl overflow-hidden relative shadow-inner mb-4">
                    <img 
                      src={inst.image} 
                      alt={inst.name} 
                      className="w-full h-full object-cover md:group-hover:scale-105 transition-all duration-1000"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  </div>

                  {/* Bottom Footer: Analysis interaction */}
                  <div className="pt-4 mt-auto border-t border-silver/10 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="bg-cobalt/10 p-1.5 rounded-lg">
                          <Zap size={10} className="text-cobalt" />
                        </div>
                        <span className="text-[9px] md:text-[11px] font-bold text-ink/20 uppercase tracking-[0.2em]">Institutional Analysis</span>
                     </div>
                     <button 
                       onClick={() => onInstitutionClick(inst)}
                       className="flex items-center gap-2 px-4 py-2 bg-silver/5 hover:bg-cobalt text-ink/30 hover:text-white rounded-full transition-all group/btn"
                     >
                        <span className="text-[9px] font-black uppercase tracking-widest">Detail</span>
                        <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                     </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {currentInstitutions.length === 0 && (
          <div className="py-32 text-center space-y-4">
             <div className="w-16 h-16 bg-silver/10 rounded-full flex items-center justify-center mx-auto text-silver">
                <Search size={24} />
             </div>
             <p className="text-ink/30 font-serif italic text-xl">未能找到相关院校</p>
          </div>
        )}

        <ShareSheet 
          isOpen={!!shareInst}
          onClose={() => setShareInst(null)}
          title="分享艺术院校"
          itemTitle={shareInst?.name}
        />
      </div>
    </div>
  );
};
