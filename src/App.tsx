/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutGrid, 
  Sun, 
  ArrowUpRight, 
  ArrowRight, 
  ExternalLink, 
  Mail, 
  MapPin, 
  Lock, 
  X, 
  Plus, 
  Trash2, 
  LogOut, 
  Download,
  Share2,
  Settings,
  Save,
  Sparkles,
  User,
  Instagram,
  Linkedin,
  Youtube,
  Twitter,
  Home,
  Compass
} from "lucide-react";
import { initialData, PortfolioData, SnsItem, JournalItem } from "./data";

export default function App() {
  // Data State
  const [data, setData] = useState<PortfolioData>(() => {
    // 1. URL 매개변수 확인 (?d=...) : 기기 간 동기화용
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const dataParam = urlParams.get("d");
      
      if (dataParam) {
        try {
          // Base64 디코딩 (한글 포함 유니코드 대응)
          const jsonStr = decodeURIComponent(escape(window.atob(dataParam)));
          const importedData = JSON.parse(jsonStr);
          localStorage.setItem("portfolio_data", jsonStr);
          // URL 파라미터 제거
          window.history.replaceState({}, document.title, window.location.pathname);
          return importedData;
        } catch (e) {
          console.error("URL 데이터 파싱 실패", e);
        }
      }
    }

    const saved = localStorage.getItem("portfolio_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 버전이 다르거나 없을 경우 마이그레이션 수행
        if (!parsed.version || parsed.version < initialData.version) {
          console.log("New version detected, merging data...");
          // 기존 데이터 보존하면서 신규 필드(url 등) 추가
          return {
            ...initialData,
            ...parsed,
            profile: { ...initialData.profile, ...parsed.profile },
            // 배열 데이터의 경우 각 요소에 누락된 필드 보완
            journal: (parsed.journal || initialData.journal).map((item: any) => ({
              ...(initialData.journal.find(j => j.id === item.id) || {}),
              ...item,
              url: item.url || "#"
            })),
            version: initialData.version
          };
        }
        return parsed;
      } catch (e) {
        console.error("Error parsing saved data", e);
        return initialData;
      }
    }
    return initialData;
  });

  // Admin State
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Persistence
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedData = { ...data, version: initialData.version };
      
      // 1. 로컬 저장 (즉시 반영)
      localStorage.setItem("portfolio_data", JSON.stringify(updatedData));
      setData(updatedData);
      
      // 2. 전역 저장 (GitHub API 호출)
      const response = await fetch('/api/save-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: updatedData }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("성공적으로 저장되었습니다!\n\nGitHub 코드가 업데이트되었으며, Vercel에서 자동으로 다시 배포를 시작합니다. 약 1~2분 후 모든 기기(스마트폰 포함)에서 반영된 것을 확인하실 수 있습니다.");
        setIsAdmin(false);
        setShowAdminPanel(false);
      } else {
        throw new Error(result.error || '전역 저장 실패');
      }
    } catch (e: any) {
      console.error("Save error:", e);
      alert(`저장 중 오류가 발생했습니다: ${e.message}\n\n(로컬 브라우저에는 임시로 저장되었습니다.)`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateSyncLink = () => {
    try {
      // JSON -> Base64 (유니코드 대응)
      const jsonStr = JSON.stringify(data);
      const base64 = window.btoa(unescape(encodeURIComponent(jsonStr)));
      const syncUrl = `${window.location.origin}${window.location.pathname}?d=${base64}`;
      
      navigator.clipboard.writeText(syncUrl);
      alert("동기화 링크가 클립보드에 복사되었습니다!\n이 링크를 스마트폰에서 열면 데이터가 즉시 적용됩니다.");
    } catch (e) {
      console.error("Failed to generate sync link", e);
      alert("링크 생성에 실패했습니다.");
    }
  };

  const handleLogin = () => {
    if (password === "7788") {
      setIsAdmin(true);
      setShowLogin(false);
      setPassword("");
      setShowAdminPanel(true);
    } else {
      alert("비밀번호가 틀렸습니다.");
    }
  };

  const updateProfile = (field: keyof PortfolioData["profile"], value: string) => {
    setData(prev => ({
      ...prev,
      profile: { ...prev.profile, [field]: value }
    }));
  };

  const addSns = () => {
    setData(prev => ({
      ...prev,
      sns: [...prev.sns, { name: "새 SNS", url: "#" }]
    }));
  };

  const removeSns = (index: number) => {
    setData(prev => ({
      ...prev,
      sns: prev.sns.filter((_, i) => i !== index)
    }));
  };

  const updateSns = (index: number, field: keyof SnsItem, value: string) => {
    const newSns = [...data.sns];
    newSns[index] = { ...newSns[index], [field]: value };
    setData(prev => ({ ...prev, sns: newSns }));
  };

  const addJournal = () => {
    setData(prev => ({
      ...prev,
      journal: [
        ...prev.journal,
        {
          id: Date.now().toString(),
          category: "카테고리",
          title: "새 소식 제목",
          description: "소식 설명",
          image: "https://picsum.photos/seed/new/800/600",
          url: "#"
        }
      ]
    }));
  };

  const removeJournal = (id: string) => {
    setData(prev => ({
      ...prev,
      journal: prev.journal.filter(item => item.id !== id)
    }));
  };

  const updateJournal = (id: string, field: keyof JournalItem, value: string) => {
    setData(prev => ({
      ...prev,
      journal: prev.journal.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  return (
    <div className="min-h-screen font-sans selection:bg-[#aaffdc]/30 bg-[#0e0e0f] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#0e0e0f]/70 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-4">
          <LayoutGrid className="w-6 h-6 text-[#aaffdc] cursor-pointer active:scale-95 transition-transform" />
          <span className="text-xl font-black tracking-tighter text-[#aaffdc] font-headline">ARCHITECT</span>
        </div>
        <div className="hidden md:flex gap-8 items-center">
          <a href="#" className="text-[#aaffdc] font-bold font-headline tracking-tight">홈</a>
          <a href="#" className="text-[#adaaab] hover:text-[#aaffdc] font-headline tracking-tight transition-colors">업데이트</a>
          <a href="#" className="text-[#adaaab] hover:text-[#aaffdc] font-headline tracking-tight transition-colors">연락하기</a>
        </div>
        <div className="flex items-center gap-4">
          {isAdmin ? (
            <button 
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              className="flex items-center gap-2 text-[#aaffdc] font-bold text-sm bg-[#aaffdc]/10 px-3 py-1.5 rounded-lg border border-[#aaffdc]/20"
            >
              <Settings className="w-4 h-4" />
              관리자
            </button>
          ) : (
            <button 
              onClick={() => setShowLogin(true)}
              className="text-[#adaaab] hover:text-[#aaffdc] transition-colors"
            >
              <Lock className="w-5 h-5" />
            </button>
          )}
          <Sun className="w-6 h-6 text-[#aaffdc] cursor-pointer active:scale-95 transition-transform" />
        </div>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto space-y-20">
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 relative group overflow-hidden rounded-xl bg-[#262627] aspect-[4/5] lg:aspect-auto"
          >
            <img 
              src={data.profile.image} 
              alt={data.profile.name} 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0f] via-transparent to-transparent opacity-80"></div>
            <div className="absolute bottom-8 left-8 right-8">
              <span className="bg-[#aaffdc]/10 text-[#aaffdc] border border-[#aaffdc]/20 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold mb-4 inline-block">
                전략 컨설팅 가능
              </span>
              <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
                {data.profile.name} <br/><span className="text-[#aaffdc]">{data.profile.lastName}</span>
              </h1>
            </div>
          </motion.div>

          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-10 rounded-xl space-y-6 flex-grow flex flex-col justify-center"
            >
              <h2 className="font-headline text-2xl font-bold tracking-tight text-[#aaffdc]">{data.profile.introTitle}</h2>
              <p className="text-[#adaaab] text-lg leading-relaxed">
                {data.profile.introDesc}
              </p>
              <div className="pt-4">
                <button className="bg-gradient-to-br from-[#aaffdc] to-[#4ffcdc] text-[#00654b] font-bold py-4 px-8 rounded-lg shadow-[0_0_20px_rgba(170,255,220,0.3)] hover:shadow-[0_0_30px_rgba(170,255,220,0.5)] active:scale-95 transition-all duration-300">
                  포트폴리오 다운로드
                </button>
              </div>
            </motion.div>

            {/* Social Grid */}
            <div className="grid grid-cols-2 gap-4">
              {data.sns.map((social, idx) => (
                <motion.a 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  href={social.url} 
                  target="_blank"
                  className="glass-card p-6 rounded-xl flex items-center justify-between group hover:border-[#aaffdc]/30 transition-all duration-300 glow-accent"
                >
                  <span className="font-headline font-bold text-sm tracking-tight group-hover:text-[#aaffdc] transition-colors">{social.name}</span>
                  <ArrowUpRight className="w-5 h-5 text-[#adaaab] group-hover:text-[#aaffdc] transition-colors" />
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.stats.map((stat, idx) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#131314] p-8 rounded-xl border border-white/5 space-y-2"
            >
              <span className="text-[#00edb4] text-xs font-bold uppercase tracking-widest">{stat.label}</span>
              <div className="text-4xl font-headline font-black">{stat.value}</div>
              <p className="text-[#adaaab] text-sm">{stat.desc}</p>
            </motion.div>
          ))}
        </section>

        {/* Journal Section */}
        <section className="space-y-12">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <span className="text-[#aaffdc] font-bold uppercase tracking-[0.2em] text-[10px]">저널</span>
              <h2 className="font-headline text-4xl font-extrabold tracking-tighter">최신 소식</h2>
            </div>
            <a href="#" className="text-[#adaaab] hover:text-[#aaffdc] transition-colors text-sm font-bold flex items-center gap-2 group">
              전체 보기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.journal.map((article, idx) => (
              <motion.div 
                key={article.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
              >
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block group relative overflow-hidden rounded-xl aspect-[16/10] glass-card cursor-pointer"
                >
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-8 w-full space-y-3">
                    <span className="text-[#aaffdc] text-[10px] font-bold uppercase tracking-widest">{article.category}</span>
                    <h3 className="font-headline text-2xl font-bold leading-tight group-hover:text-[#aaffdc] transition-colors">{article.title}</h3>
                    <p className="text-[#adaaab] text-sm line-clamp-2">{article.description}</p>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Newsletter Section */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#262627] p-12 md:p-20 rounded-xl relative overflow-hidden border border-white/5"
        >
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#aaffdc]/10 to-transparent pointer-events-none"></div>
          <div className="max-w-2xl relative z-10 space-y-8">
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter leading-none">
              <span className="text-[#aaffdc]">Architect Intel</span> 구독하기
            </h2>
            <p className="text-[#adaaab] text-lg">크리에이티브 디렉션, 디지털 전략, 그리고 미래를 구축하는 도구들에 대한 주간 인사이트.</p>
            <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="email@example.com" 
                className="bg-[#201f21] border-none ring-1 ring-white/10 focus:ring-[#aaffdc] rounded-lg px-6 py-4 flex-grow text-white font-medium transition-all outline-none"
              />
              <button className="bg-white text-black font-black px-8 py-4 rounded-lg hover:bg-[#aaffdc] transition-colors whitespace-nowrap">
                지금 가입하기
              </button>
            </form>
          </div>
        </motion.section>
      </main>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#1a191b] p-8 rounded-2xl border border-white/10 w-full max-w-md space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold font-headline">관리자 로그인</h2>
                <X className="w-6 h-6 cursor-pointer text-[#adaaab]" onClick={() => setShowLogin(false)} />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#adaaab] uppercase tracking-widest">비밀번호</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="w-full bg-[#201f21] border-none ring-1 ring-white/10 focus:ring-[#aaffdc] rounded-lg px-4 py-3 text-white outline-none"
                    placeholder="비밀번호 입력 (****)"
                  />
                </div>
                <button 
                  onClick={handleLogin}
                  className="w-full bg-[#aaffdc] text-[#00654b] font-bold py-3 rounded-lg active:scale-95 transition-transform"
                >
                  로그인
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Panel */}
      <AnimatePresence>
        {showAdminPanel && (
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed top-0 right-0 h-full w-full md:w-[500px] z-[110] bg-[#1a191b] border-l border-white/10 shadow-2xl overflow-y-auto"
          >
            <div className="p-8 space-y-10">
              <div className="flex justify-between items-center sticky top-0 bg-[#1a191b] py-2 z-10 border-b border-white/5">
                <h2 className="text-2xl font-bold font-headline text-[#aaffdc]">관리자 패널</h2>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleGenerateSyncLink}
                      className="px-3 py-1.5 bg-[#aaffdc]/10 hover:bg-[#aaffdc]/20 text-[#aaffdc] text-xs rounded-lg border border-[#aaffdc]/20 transition-all flex items-center gap-1.5"
                      title="스마트폰 등 다른 기기로 데이터를 전송할 수 있는 링크를 생성합니다."
                    >
                      <Share2 size={12} />
                      동기화 링크 생성
                    </button>
                    <button 
                      onClick={() => {
                      const json = JSON.stringify(data, null, 2);
                      const blob = new Blob([json], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "data.json";
                      a.click();
                      alert("데이터가 JSON 파일로 다운로드되었습니다. 이 내용을 src/data.ts의 initialData에 붙여넣으면 영구적으로 반영됩니다.");
                    }}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs rounded-lg border border-white/10 transition-all"
                      title="전체 데이터를 JSON 파일로 다운로드합니다. 이 파일을 src/data.ts에 붙여넣으면 영구적으로 반영됩니다."
                    >
                      내보내기
                    </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`flex items-center gap-2 font-bold px-4 py-2 rounded-lg text-sm transition-all ${
                      isSaving 
                      ? "bg-[#aaffdc]/50 text-[#00654b] cursor-not-allowed" 
                      : "bg-[#aaffdc] text-[#00654b] hover:shadow-[0_0_20px_rgba(170,255,220,0.4)]"
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                          <Compass size={16} />
                        </motion.div>
                        배포 중...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        저장 및 배포
                      </>
                    )}
                  </button>
                  <X className="w-6 h-6 cursor-pointer text-[#adaaab]" onClick={() => setShowAdminPanel(false)} />
                </div>
              </div>

              {/* Profile Edit */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold border-b border-white/5 pb-2">프로필 수정</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#adaaab]">이름</label>
                    <input 
                      value={data.profile.name}
                      onChange={(e) => updateProfile("name", e.target.value)}
                      className="w-full bg-[#201f21] rounded-lg px-4 py-2 text-sm outline-none ring-1 ring-white/5 focus:ring-[#aaffdc]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#adaaab]">성</label>
                    <input 
                      value={data.profile.lastName}
                      onChange={(e) => updateProfile("lastName", e.target.value)}
                      className="w-full bg-[#201f21] rounded-lg px-4 py-2 text-sm outline-none ring-1 ring-white/5 focus:ring-[#aaffdc]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#adaaab]">프로필 사진 URL</label>
                    <input 
                      value={data.profile.image}
                      onChange={(e) => updateProfile("image", e.target.value)}
                      className="w-full bg-[#201f21] rounded-lg px-4 py-2 text-sm outline-none ring-1 ring-white/5 focus:ring-[#aaffdc]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#adaaab]">소개 제목</label>
                    <input 
                      value={data.profile.introTitle}
                      onChange={(e) => updateProfile("introTitle", e.target.value)}
                      className="w-full bg-[#201f21] rounded-lg px-4 py-2 text-sm outline-none ring-1 ring-white/5 focus:ring-[#aaffdc]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#adaaab]">소개 설명</label>
                    <textarea 
                      value={data.profile.introDesc}
                      onChange={(e) => updateProfile("introDesc", e.target.value)}
                      className="w-full bg-[#201f21] rounded-lg px-4 py-2 text-sm outline-none ring-1 ring-white/5 focus:ring-[#aaffdc] h-24 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* SNS Edit */}
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-lg font-bold">SNS 관리</h3>
                  <button onClick={addSns} className="text-[#aaffdc] hover:bg-[#aaffdc]/10 p-1 rounded">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  {data.sns.map((item, idx) => (
                    <div key={idx} className="bg-[#201f21] p-4 rounded-xl space-y-3 relative group">
                      <button 
                        onClick={() => removeSns(idx)}
                        className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          placeholder="이름"
                          value={item.name}
                          onChange={(e) => updateSns(idx, "name", e.target.value)}
                          className="bg-black/20 rounded px-2 py-1 text-xs outline-none focus:ring-1 ring-[#aaffdc]"
                        />
                        <input 
                          placeholder="URL"
                          value={item.url}
                          onChange={(e) => updateSns(idx, "url", e.target.value)}
                          className="bg-black/20 rounded px-2 py-1 text-xs outline-none focus:ring-1 ring-[#aaffdc]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Journal Edit */}
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-lg font-bold">최신 소식 관리</h3>
                  <button onClick={addJournal} className="text-[#aaffdc] hover:bg-[#aaffdc]/10 p-1 rounded">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-6">
                  {data.journal.map((item) => (
                    <div key={item.id} className="bg-[#201f21] p-4 rounded-xl space-y-3 relative group">
                      <button 
                        onClick={() => removeJournal(item.id)}
                        className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="space-y-2">
                        <input 
                          placeholder="카테고리"
                          value={item.category}
                          onChange={(e) => updateJournal(item.id, "category", e.target.value)}
                          className="w-full bg-black/20 rounded px-2 py-1 text-xs outline-none focus:ring-1 ring-[#aaffdc]"
                        />
                        <input 
                          placeholder="제목"
                          value={item.title}
                          onChange={(e) => updateJournal(item.id, "title", e.target.value)}
                          className="w-full bg-black/20 rounded px-2 py-1 text-xs outline-none focus:ring-1 ring-[#aaffdc]"
                        />
                        <input 
                          placeholder="이미지 URL"
                          value={item.image}
                          onChange={(e) => updateJournal(item.id, "image", e.target.value)}
                          className="w-full bg-black/20 rounded px-2 py-1 text-xs outline-none focus:ring-1 ring-[#aaffdc]"
                        />
                        <input 
                          placeholder="연결 URL (https://...)"
                          value={item.url}
                          onChange={(e) => updateJournal(item.id, "url", e.target.value)}
                          className="w-full bg-black/20 rounded px-2 py-1 text-xs outline-none focus:ring-1 ring-[#aaffdc]"
                        />
                        <textarea 
                          placeholder="설명"
                          value={item.description}
                          onChange={(e) => updateJournal(item.id, "description", e.target.value)}
                          className="w-full bg-black/20 rounded px-2 py-1 text-xs outline-none focus:ring-1 ring-[#aaffdc] h-16 resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50 flex justify-around items-center p-2 bg-[#131314]/60 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl">
        <a href="#" className="flex items-center justify-center bg-[#aaffdc] text-[#0e0e0f] rounded-xl p-3 shadow-[0_0_15px_rgba(170,255,220,0.4)] active:scale-90 duration-200">
          <Home className="w-6 h-6" />
        </a>
        <a href="#" className="flex items-center justify-center text-[#adaaab] p-3 hover:bg-white/5 rounded-xl transition-all active:scale-90 duration-200">
          <Compass className="w-6 h-6" />
        </a>
        <a href="#" className="flex items-center justify-center text-[#adaaab] p-3 hover:bg-white/5 rounded-xl transition-all active:scale-90 duration-200">
          <Sparkles className="w-6 h-6 fill-current" />
        </a>
        <a href="#" className="flex items-center justify-center text-[#adaaab] p-3 hover:bg-white/5 rounded-xl transition-all active:scale-90 duration-200">
          <User className="w-6 h-6" />
        </a>
      </nav>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 bg-[#131314] text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-xl font-black tracking-tighter text-[#adaaab] font-headline">ARCHITECT</span>
          <p className="text-[10px] text-[#767576] font-bold uppercase tracking-widest">© 2024 Lucien Vaughn. All Rights Reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs font-bold text-[#adaaab] hover:text-[#aaffdc] transition-colors uppercase tracking-widest">개인정보처리방침</a>
            <a href="#" className="text-xs font-bold text-[#adaaab] hover:text-[#aaffdc] transition-colors uppercase tracking-widest">이용약관</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
