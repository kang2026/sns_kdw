import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { data } = req.body;
  const { GITHUB_PAT, GITHUB_OWNER, GITHUB_REPO } = process.env;

  if (!GITHUB_PAT || !GITHUB_OWNER || !GITHUB_REPO) {
    const missing = [
      !GITHUB_PAT && 'GITHUB_PAT',
      !GITHUB_OWNER && 'GITHUB_OWNER',
      !GITHUB_REPO && 'GITHUB_REPO'
    ].filter(Boolean).join(', ');
    
    return res.status(500).json({ 
      error: `설정 누락 (${missing}): Vercel 프로젝트 설정에서 해당 환경 변수들이 정확히 등록되었는지 확인해 주세요. 등록 후에는 다시 배포가 필요할 수 있습니다.` 
    });
  }

  const path = 'src/data.ts';
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;

  try {
    // 1. GitHub에서 현재 파일 정보(SHA) 가져오기
    const getFileResponse = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_PAT}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!getFileResponse.ok) {
      throw new Error(`GitHub에서 파일을 가져오지 못했습니다: ${getFileResponse.statusText}`);
    }

    const fileData: any = await getFileResponse.json();
    const sha = fileData.sha;

    // 2. 새로운 파일 내용 준비 (src/data.ts 형식에 맞춰 재생성)
    const content = `export interface SnsItem {
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

export const initialData: PortfolioData = ${JSON.stringify(data, null, 2)};
`;

    // 3. GitHub API를 통해 파일 업데이트 커밋
    const updateResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_PAT}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Update portfolio data via CMS Admin',
        content: Buffer.from(content).toString('base64'),
        sha: sha,
      }),
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(`GitHub 업데이트 실패: ${JSON.stringify(errorData)}`);
    }

    return res.status(200).json({ success: true, message: 'GitHub 코드가 업데이트되었습니다. 잠시 후 재배포가 완료됩니다.' });
  } catch (error: any) {
    console.error('Save Data Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
