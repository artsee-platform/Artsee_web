import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, Target, GraduationCap, Briefcase, MapPin, TrendingUp, Globe, Sparkles, Quote, Layout, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface SectionDetailProps {
  type: 'philosophy' | 'curriculum' | 'career';
  majorName: string;
  onClose: () => void;
}

// --- Philosophy Detail ---
const PhilosophyDetail = ({ majorName, onClose }: { majorName: string; onClose: () => void }) => {
  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Visual Side (Desktop) / Header (Mobile) */}
      <div className="w-full md:w-1/2 bg-ink p-8 md:p-20 text-white flex flex-col justify-center relative overflow-hidden shrink-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
           <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cobalt blur-[120px] rounded-full animate-pulse" />
           <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900 blur-[150px] rounded-full" />
        </div>
        
        <div className="relative z-10 space-y-8 md:space-y-12">
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-cobalt">
            <Target size={40} className="md:w-12 md:h-12" />
          </div>
          <div className="space-y-4">
            <span className="text-xs md:text-sm font-black tracking-[0.35em] text-white/40">核心理念</span>
            <h2 className="text-3xl md:text-6xl font-serif font-black italic italic-none text-white leading-tight tracking-tighter">驱动未来文明的<br />设计主义</h2>
          </div>
          <p className="text-lg md:text-2xl font-light text-white/60 leading-relaxed max-w-xl">
             在 {majorName} 领域，我们拒绝平庸的装饰。我们追求的是通过设计对现实社会结构进行“无害化手术”。
          </p>
        </div>
      </div>

      {/* Content Side */}
      <div className="flex-1 bg-porcelain p-8 md:p-20 overflow-y-auto no-scrollbar space-y-16">
        <div className="space-y-12">
          <div className="flex items-center gap-4 text-cobalt">
            <div className="w-10 h-[2px] bg-cobalt" />
            <span className="text-[10px] font-black tracking-widest">理念宣言</span>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {[
              { title: '设计即权利', desc: '设计不只是美学，更是分配注意力、重新定义交互层级的一种权力。我们教导学生如何平衡这种权力。' },
              { title: '批判性技术', desc: '不盲从工具。我们强调对媒介本身的批判，探讨 AI、算法与生态系统在设计中的真正边界。' },
              { title: '社会化生产', desc: '项目必须在真实的社会噪音中诞生，而非真空中。解决真实世界中那些“难以言喻”的痛点。' },
              { title: '可持续叙事', desc: '不仅仅是环保材料，更是观念的可持续。如何创造一个能跨越时间、引起几代人共鸣的叙事结构。' }
            ].map((item, i) => (
              <div key={i} className="space-y-4 p-8 bg-white rounded-[2rem] shadow-sm border border-silver/10 hover:shadow-xl transition-all">
                <h4 className="text-xl font-serif font-bold italic text-ink">{item.title}</h4>
                <p className="text-sm text-ink/50 leading-relaxed font-light">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-ink p-10 md:p-16 rounded-[3rem] text-white space-y-8 relative overflow-hidden">
             <Quote size={48} className="text-cobalt/20 absolute -top-4 -right-4" />
             <p className="text-2xl md:text-4xl font-serif font-light italic leading-tight relative z-10">
               “设计是最终的<span className="text-cobalt">解药</span>，也是最初的<span className="text-cobalt">陷阱</span>。我们的理念是教你如何在使用解药的同时，绕过陷阱。”
             </p>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20">
                   <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" alt="" />
                </div>
                <div>
                   <p className="text-xs font-bold">亚历山大·沃斯 教授</p>
                   <p className="text-[10px] text-white/40 tracking-widest font-black">战略设计方向负责人</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Curriculum Detail ---
const CurriculumDetail = ({ majorName, onClose }: { majorName: string; onClose: () => void }) => {
  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden">
      {/* Timeline Controls (Desktop) */}
      <aside className="hidden md:flex w-24 bg-ink border-r border-white/5 flex-col items-center py-12 gap-8 shrink-0">
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} className="flex flex-col items-center gap-3">
               <div className={cn("w-1 h-12 rounded-full", idx === 1 ? "bg-cobalt" : "bg-white/10")} />
               <span className={cn("text-[10px] font-black rotate-90 my-4", idx === 1 ? "text-white" : "text-white/20")}>第 {idx} 学年</span>
            </div>
          ))}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-porcelain">
        {/* Header Hero */}
        <div className="p-8 md:p-20 bg-white border-b border-silver/10 space-y-12">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-cobalt">
                <GraduationCap size={20} />
                <span className="text-[10px] font-black tracking-widest">自适应学习体系</span>
              </div>
              <h2 className="text-4xl md:text-7xl font-serif font-black italic tracking-tighter text-ink leading-[0.9]">教学体系<br />深度解构</h2>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-[10px] font-black tracking-[0.35em] text-ink/20 mb-2">学分要求</p>
              <p className="text-4xl font-mono font-bold text-ink">180</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { label: '核心专业课', val: '65%', color: 'bg-cobalt' },
              { label: '跨学科选修', val: '25%', color: 'bg-indigo-400' },
              { label: '商业/行业实践', val: '10%', color: 'bg-emerald-400' }
            ].map(item => (
              <div key={item.label} className="bg-porcelain/50 p-6 rounded-3xl border border-silver/10 space-y-4">
                 <div className="flex items-center justify-between">
                   <p className="text-[10px] font-black text-ink/40 tracking-widest">{item.label}</p>
                   <p className="text-sm font-mono font-bold text-ink">{item.val}</p>
                 </div>
                 <div className="h-1.5 w-full bg-ink/5 rounded-full overflow-hidden">
                    <div className={cn("h-full", item.color)} style={{ width: item.val }} />
                 </div>
              </div>
            ))}
          </div>
        </div>

        {/* Semester Modules */}
        <div className="p-8 md:p-20 space-y-16">
          <section className="space-y-10">
             <div className="flex items-center gap-4">
               <Layout size={18} className="text-cobalt" />
               <h3 className="text-xl md:text-3xl font-serif font-black text-ink">阶段重点 · 核心模块</h3>
             </div>

             <div className="space-y-6">
               {[
                 { year: '第一学年', title: '思维重塑与原型研究', desc: '打破传统艺术边界，学习计算建模与生成式设计的基础逻辑。', tags: ['计算艺术', '批判理论'] },
                 { year: '第二学年', title: '社会化实验与系统工程', desc: '进入真实的社会场景，针对特定政策或生态痛点进行系统性设计，包含跨媒介叙事。', tags: ['社会设计', '系统思维'] },
                 { year: '第三学年', title: '前沿实验室与协同创新', desc: '与行业顶尖实验室联动，研究人工智能、人机交互或生物设计等方向，探索未来栖居可能。', tags: ['推测性设计', '生物艺术'] },
                 { year: '第四学年', title: '毕业设计：高维叙事与行业交付', desc: '整合四年的学识，完成具备行业影响力的毕业项目，并进行面向全球的路演预演。', tags: ['毕业设计', '战略整合'] }
               ].map((module, i) => (
                 <div key={i} className="group bg-white p-8 md:p-12 rounded-[2.5rem] border border-silver/10 hover:border-cobalt transition-all flex flex-col md:flex-row gap-8 md:items-center">
                    <div className="shrink-0 flex md:flex-col items-center gap-2">
                       <span className="text-xs font-serif font-black italic text-cobalt">{module.year}</span>
                       <div className="hidden md:block w-px h-12 bg-silver/20" />
                    </div>
                    <div className="flex-1 space-y-4">
                       <h4 className="text-xl md:text-2xl font-serif font-bold italic text-ink group-hover:text-cobalt transition-colors">{module.title}</h4>
                       <p className="text-sm md:text-base text-ink/50 font-light leading-relaxed max-w-2xl">{module.desc}</p>
                       <div className="flex flex-wrap gap-2 pt-2">
                          {module.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-porcelain rounded-lg text-[9px] font-bold tracking-widest text-ink/40 group-hover:bg-cobalt/5 group-hover:text-cobalt transition-all">#{tag}</span>
                          ))}
                       </div>
                    </div>
                    <div className="md:w-16 flex items-center justify-center">
                       <ChevronLeft size={24} className="rotate-180 text-ink/10 group-hover:text-cobalt transition-all" />
                    </div>
                 </div>
               ))}
             </div>
          </section>

          {/* Student Success Box */}
          <div className="bg-cobalt/5 rounded-[3rem] p-10 md:p-16 border border-cobalt/10 flex flex-col md:flex-row gap-12">
             <div className="w-full md:w-1/3 aspect-[4/5] rounded-[2rem] overflow-hidden border border-cobalt/20 shrink-0">
                <img src="https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" alt="" />
             </div>
             <div className="space-y-8 flex-1">
                <div className="space-y-4">
                   <span className="text-[10px] font-black tracking-[0.35em] text-cobalt">代表性工作室项目</span>
                   <h4 className="text-3xl md:text-5xl font-serif font-black text-ink">「联觉城市 Synaptic City」</h4>
                   <p className="text-base text-ink/60 font-light leading-relaxed">
                      该项目由大三学生团队与国际科技实验室联合推进，探讨情绪数据如何通过动态建筑立面反馈给居住者，曾获 INDEX 设计奖提名。
                   </p>
                </div>
                <button className="h-14 px-8 border border-cobalt text-cobalt rounded-2xl text-[10px] font-bold tracking-widest hover:bg-cobalt hover:text-white transition-all">查看案例深度解析</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Career Detail ---
const CareerDetail = ({ majorName, onClose }: { majorName: string; onClose: () => void }) => {
  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Strategic Board (Desktop) */}
      <div className="w-full md:w-1/2 bg-porcelain p-8 md:p-20 overflow-y-auto no-scrollbar space-y-16">
        <div className="space-y-12">
          <div className="space-y-4">
             <div className="flex items-center gap-3 text-cobalt">
                <Briefcase size={20} />
                <span className="text-[10px] font-black tracking-widest">职业趋势洞察</span>
             </div>
             <h2 className="text-4xl md:text-7xl font-serif font-black italic tracking-tighter text-ink leading-[0.9]">就业趋势<br />与行业权重</h2>
          </div>

          {/* Salary Data */}
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-silver/10 space-y-8">
             <div className="flex items-center justify-between">
                <h4 className="text-xs font-black tracking-widest text-ink/30">毕业生薪资参考（美元）</h4>
                <TrendingUp size={16} className="text-cobalt" />
             </div>
             <div className="space-y-6">
                {[
                  { label: '起步薪资', val: '$85k - $120k', p: 80 },
                  { label: '三年经验', val: '$140k - $210k', p: 95 },
                  { label: '五年+战略岗', val: '$280k+', p: 100 }
                ].map(item => (
                  <div key={item.label} className="space-y-3">
                     <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-ink italic">{item.label}</span>
                        <span className="text-xs font-mono font-bold text-cobalt">{item.val}</span>
                     </div>
                     <div className="h-2 w-full bg-porcelain rounded-full overflow-hidden">
                        <div className="h-full bg-cobalt" style={{ width: `${item.p}%` }} />
                     </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Industry Distribution */}
          <div className="grid grid-cols-2 gap-6">
               {[
               { label: '科技巨头', val: '42%', icon: <Globe /> },
               { label: '创意与文化机构', val: '28%', icon: <Sparkles /> },
               { label: '公共部门', val: '15%', icon: <MapPin /> },
               { label: '创业创新', val: '15%', icon: <TrendingUp /> }
             ].map(item => (
               <div key={item.label} className="bg-white p-8 rounded-[2.5rem] border border-silver/10 space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-porcelain flex items-center justify-center text-cobalt">
                     {React.cloneElement(item.icon as any, { size: 18 })}
                  </div>
                  <div className="space-y-1">
                     <p className="text-2xl font-serif font-black italic text-ink">{item.val}</p>
                     <p className="text-[10px] font-bold text-ink/30 tracking-widest">{item.label}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Partners / Alumni Side */}
      <div className="flex-1 bg-ink text-white p-8 md:p-20 overflow-y-auto no-scrollbar relative">
         <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_bottom_left,#1d4ed8_0%,transparent_50%)]" />
         
         <div className="relative z-10 space-y-20">
            {/* Top Recruiters */}
            <div className="space-y-12">
               <div className="flex items-center gap-4 text-white/40">
                  <div className="w-10 h-[1px] bg-white/20" />
                  <span className="text-[10px] font-black tracking-widest">重点招聘合作方</span>
               </div>
               <div className="grid grid-cols-2 gap-x-12 gap-y-16">
                  {['Google', 'Tesla', 'IDEO', 'Meta', 'Apple', 'Frog Design'].map(brand => (
                    <div key={brand} className="text-2xl md:text-4xl font-serif font-bold italic opacity-20 hover:opacity-100 transition-all cursor-crosshair">
                      {brand}
                    </div>
                  ))}
               </div>
            </div>

            {/* Career Velocity Box */}
            <div className="bg-white/5 backdrop-blur-3xl p-10 md:p-16 rounded-[3rem] border border-white/10 space-y-10">
               <div className="space-y-4">
                  <h4 className="text-sm font-black tracking-[0.35em] text-cobalt">校友职业发展速度</h4>
                  <p className="text-xl md:text-3xl font-serif font-light italic leading-loose text-white/60">
                     我们的毕业生平均在入职第 <span className="text-white font-black">2.4</span> 年晋升至中高层决策岗位，职业增速远超行业平均水平 <span className="text-white font-black">1.8</span> 倍。
                  </p>
               </div>
               
               <div className="flex flex-col gap-4">
                  {[
                    { name: 'David W.', role: '高级体验设计负责人 · 知名住宿科技平台', desc: '从毕业设计到进入核心产品团队约 18 个月。' },
                    { name: 'Chen L.', role: '「Nova」工作室创始人', desc: '主导亚太区多个地标型数字艺术装置的设计与落地。' }
                  ].map((alumnus, i) => (
                    <div key={i} className="flex gap-6 p-6 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                       <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 shrink-0">
                          <User size={24} className="m-auto mt-3 text-white/20" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-cobalt tracking-widest">{alumnus.name}</p>
                          <p className="text-sm font-bold italic">{alumnus.role}</p>
                          <p className="text-[10px] text-white/30 font-medium">{alumnus.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <button className="w-full h-20 bg-white text-ink rounded-3xl text-xs font-bold tracking-[0.2em] hover:bg-cobalt hover:text-white transition-all shadow-2xl shadow-cobalt/20">
               获取定制就业报告
            </button>
         </div>
      </div>
    </div>
  );
};

// --- Main Container ---
export const MajorSectionDetail = ({ type, majorName, onClose }: SectionDetailProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[250] flex items-center justify-center p-0 md:p-8"
    >
      <div className="absolute inset-0 bg-ink/95 backdrop-blur-3xl" onClick={onClose} />
      
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 32, stiffness: 280 }}
        className="relative w-full h-full max-h-screen md:max-h-[85vh] md:max-w-[1400px] bg-white md:rounded-[4rem] overflow-hidden shadow-[0_60px_100px_-20px_rgba(0,0,0,0.4)]"
      >
        {/* Navigation / Close */}
        <div className="absolute top-6 right-6 md:top-12 md:right-12 z-50 flex items-center gap-4">
           <button 
             onClick={onClose}
             className="w-12 h-12 md:w-20 md:h-20 bg-white/80 backdrop-blur-md rounded-full shadow-2xl flex items-center justify-center text-ink hover:bg-ink hover:text-white transition-all border border-silver/10"
           >
             <X size={24} />
           </button>
        </div>

        <div className="h-full">
           {type === 'philosophy' && <PhilosophyDetail majorName={majorName} onClose={onClose} />}
           {type === 'curriculum' && <CurriculumDetail majorName={majorName} onClose={onClose} />}
           {type === 'career' && <CareerDetail majorName={majorName} onClose={onClose} />}
        </div>
      </motion.div>
    </motion.div>
  );
};
