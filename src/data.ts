export interface SnsItem {
  name: string;
  url: string;
}

export interface JournalItem {
  id: string;
  category: string;
  title: string;
  description: string;
  image: string;
  url: string;
}

export interface PortfolioData {
  profile: {
    name: string;
    lastName: string;
    introTitle: string;
    introDesc: string;
    image: string;
  };
  sns: SnsItem[];
  stats: {
    label: string;
    value: string;
    desc: string;
  }[];
  journal: JournalItem[];
  version: number;
}

export const initialData: PortfolioData = {
  profile: {
    name: "루시엔",
    lastName: "본",
    introTitle: "크리에이티브 전략가 & 내러티브 아키텍트",
    introDesc: "데이터 기반 심리학과 전위적인 미학 원칙의 교차점을 통해 영향력 있는 디지털 경험을 설계합니다. 기업의 비전과 문화적 관련성 사이의 격차를 해소합니다.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCTNBYqIIt1KZZ1eJCezIANCZ7hF6veOB4fvRBZHOwfK09ehwWMVfd1GhOu9XEzMwcXOj1OxKzuT05pNZrduQhkBPR4KQ-QZCf69YY-I5h51Z1Rg_twQ1PpTiifB7kcRBMyh_vMMD1ZgVpDKyxnO4Ew8nHW1yEbqCzlThW6IzAsiH5tC3unYhQjdwRTRI1jDQ2LY3AKSP3-ynfihBzm9iJGcA8hFmkdoWM0817nGTAd-tbn3a6AEEG1QxxKaFFZXHo25I0ndIAgyyg",
  },
  sns: [
    { name: "인스타그램", url: "#" },
    { name: "유튜브", url: "#" },
    { name: "링크드인", url: "#" },
    { name: "X / 트위터", url: "#" },
  ],
  stats: [
    { label: "활성 클라이언트", value: "14+", desc: "기술 및 패션 분야의 글로벌 브랜드." },
    { label: "경력", value: "08년", desc: "디지털 환경 마스터링." },
    { label: "위치", value: "LND / NYC", desc: "문화의 속도로 운영." },
  ],
  journal: [
    {
      id: "1",
      category: "전략",
      title: "랜딩 페이지의 종말: 왜 내러티브가 중요한가",
      description: "2024년 정적 전환에서 동적 사용자 스토리텔링으로 진화하는 방법.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDe3P2pnEhYU0pmWl-BywYsN3jV-YXEy9-azbQHoxpKHRnUI2rTXAhbdxlVwWQMq2_TBvOYnSiBvJZHGB3tACfHtYsj5wtEoUr9GuQsapWddiAP2XzucnFfuit9I8bswPL2iU4vMZDWfXN9LP0RBOoORaq-MdW5d9DEuS6ETY12s6oUlBHz5RWI7Dw63lOo0mhiMUN2ZsaLCuavK8h0yuKPLwnV3HMBpEVsPCC5BbIolhNmAt_qJeA2swzN2BTqGi03LYwCJKMnn1I",
      url: "https://naver.com",
    },
    {
      id: "2",
      category: "인사이트",
      title: "합성 콘텐츠 시대의 신뢰 구축",
      description: "생성형 AI 혁명 기간 동안의 브랜드 진정성에 대한 심층 분석.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtZT9Xl_GMYbI5jb_MYOuoKK5jD0IWbj9fVeFFVT3lXzG-9ZTSKxBP2hvSbcnQKoT1FYt6iTtFL9QZylfqsEPz4i96rC7HZNZHEYJ-Frext43R-ObYwVush_o_IkEn9sNOE-Up-zyFNonrx1VrJ7rPDFKyYoTP3jF2fyUbUDtP9AmfNkY0FDB9ABKUO006eAY5PI_UNeRmO3qsHjDbF72crltkFIjSTR58fHdpMtz5r86RyygLmuOBgPjXNeWjp2aBmnDIfoa6emo",
      url: "https://daum.net",
    },
  ],
  version: 1.2,
};
