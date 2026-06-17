import type { PeerCompany, IndustryCategory, CompanyScale, IndustryInfo } from '@/types/financial';

export const industryLabels: Record<IndustryCategory, string> = {
  manufacturing: '智能制造装备',
  retail: '零售贸易',
  technology: '信息技术',
  services: '商务服务',
  realestate: '房地产',
  finance: '金融',
};

export const scaleLabels: Record<CompanyScale, string> = {
  small: '小型（营收<5亿）',
  medium: '中型（营收5-20亿）',
  large: '大型（营收20-100亿）',
  xlarge: '超大型（营收>100亿）',
};

export const defaultIndustryInfo: IndustryInfo = {
  industry: 'manufacturing',
  industryLabel: industryLabels.manufacturing,
  scale: 'medium',
  scaleLabel: scaleLabels.medium,
};

function createManufacturingPeers(): PeerCompany[] {
  const seed = [
    { name: '三一重工股份有限公司', code: '600031', scale: 'xlarge' as CompanyScale, rev: 8180000, assets: 14200000 },
    { name: '中联重科股份有限公司', code: '000157', scale: 'xlarge' as CompanyScale, rev: 4860000, assets: 9800000 },
    { name: '徐工集团工程机械股份有限公司', code: '000425', scale: 'xlarge' as CompanyScale, rev: 7680000, assets: 11500000 },
    { name: '柳工机械股份有限公司', code: '000528', scale: 'large' as CompanyScale, rev: 2680000, assets: 4200000 },
    { name: '安徽合力股份有限公司', code: '600761', scale: 'large' as CompanyScale, rev: 1440000, assets: 2100000 },
    { name: '杭叉集团股份有限公司', code: '603298', scale: 'large' as CompanyScale, rev: 1380000, assets: 1800000 },
    { name: '浙江鼎力机械股份有限公司', code: '603338', scale: 'large' as CompanyScale, rev: 540000, assets: 860000 },
    { name: '巨星科技股份有限公司', code: '002444', scale: 'large' as CompanyScale, rev: 1180000, assets: 1500000 },
    { name: '山东威达机械股份有限公司', code: '002026', scale: 'medium' as CompanyScale, rev: 280000, assets: 420000 },
    { name: '合锻智能股份有限公司', code: '603011', scale: 'medium' as CompanyScale, rev: 120000, assets: 320000 },
    { name: '日发精机股份有限公司', code: '002520', scale: 'medium' as CompanyScale, rev: 210000, assets: 480000 },
    { name: '海天精工股份有限公司', code: '601882', scale: 'medium' as CompanyScale, rev: 320000, assets: 520000 },
    { name: '国盛智科股份有限公司', code: '688558', scale: 'medium' as CompanyScale, rev: 138000, assets: 260000 },
    { name: '浙海德曼机械股份有限公司', code: '688577', scale: 'medium' as CompanyScale, rev: 98000, assets: 180000 },
    { name: '科德数控股份有限公司', code: '688305', scale: 'medium' as CompanyScale, rev: 112000, assets: 240000 },
    { name: '华明电力装备股份有限公司', code: '002270', scale: 'medium' as CompanyScale, rev: 186000, assets: 360000 },
    { name: '山东章鼓科技股份有限公司', code: '002598', scale: 'medium' as CompanyScale, rev: 156000, assets: 280000 },
    { name: '江苏神通阀门股份有限公司', code: '002438', scale: 'medium' as CompanyScale, rev: 218000, assets: 340000 },
    { name: '中密控股股份有限公司', code: '300470', scale: 'medium' as CompanyScale, rev: 128000, assets: 240000 },
    { name: '鲍斯股份有限公司', code: '300441', scale: 'small' as CompanyScale, rev: 78000, assets: 160000 },
    { name: '金盾股份有限公司', code: '300411', scale: 'small' as CompanyScale, rev: 62000, assets: 140000 },
    { name: '百达精工股份有限公司', code: '603331', scale: 'small' as CompanyScale, rev: 88000, assets: 120000 },
    { name: '联诚精密制造股份有限公司', code: '002921', scale: 'small' as CompanyScale, rev: 72000, assets: 100000 },
    { name: '长盛轴承股份有限公司', code: '300718', scale: 'small' as CompanyScale, rev: 56000, assets: 98000 },
  ];

  const ratioTemplates = [
    { gm: 0.312, nm: 0.148, dr: 0.523, it: 6.8, at: 0.92, roe: 0.185, cr: 1.45 },
    { gm: 0.285, nm: 0.112, dr: 0.586, it: 5.2, at: 0.78, roe: 0.128, cr: 1.32 },
    { gm: 0.268, nm: 0.095, dr: 0.631, it: 4.5, at: 0.85, roe: 0.098, cr: 1.18 },
    { gm: 0.245, nm: 0.078, dr: 0.562, it: 5.8, at: 0.76, roe: 0.115, cr: 1.52 },
    { gm: 0.228, nm: 0.082, dr: 0.485, it: 7.2, at: 0.95, roe: 0.142, cr: 1.68 },
    { gm: 0.256, nm: 0.105, dr: 0.452, it: 8.5, at: 1.02, roe: 0.168, cr: 1.82 },
    { gm: 0.368, nm: 0.185, dr: 0.385, it: 3.2, at: 0.88, roe: 0.225, cr: 2.15 },
    { gm: 0.342, nm: 0.156, dr: 0.428, it: 4.8, at: 0.95, roe: 0.198, cr: 1.85 },
    { gm: 0.215, nm: 0.065, dr: 0.525, it: 5.5, at: 0.82, roe: 0.088, cr: 1.48 },
    { gm: 0.198, nm: 0.042, dr: 0.612, it: 3.8, at: 0.56, roe: 0.052, cr: 1.15 },
    { gm: 0.282, nm: 0.095, dr: 0.548, it: 2.8, at: 0.62, roe: 0.095, cr: 1.38 },
    { gm: 0.265, nm: 0.128, dr: 0.412, it: 5.2, at: 0.88, roe: 0.178, cr: 1.92 },
    { gm: 0.305, nm: 0.135, dr: 0.385, it: 4.2, at: 0.75, roe: 0.148, cr: 2.08 },
    { gm: 0.335, nm: 0.152, dr: 0.356, it: 3.8, at: 0.68, roe: 0.132, cr: 2.25 },
    { gm: 0.385, nm: 0.205, dr: 0.285, it: 2.5, at: 0.58, roe: 0.185, cr: 2.68 },
    { gm: 0.412, nm: 0.188, dr: 0.445, it: 6.2, at: 0.72, roe: 0.215, cr: 1.65 },
    { gm: 0.295, nm: 0.118, dr: 0.412, it: 5.8, at: 0.82, roe: 0.155, cr: 1.78 },
    { gm: 0.358, nm: 0.165, dr: 0.328, it: 7.5, at: 0.95, roe: 0.208, cr: 2.12 },
    { gm: 0.382, nm: 0.192, dr: 0.268, it: 4.2, at: 0.68, roe: 0.175, cr: 2.45 },
    { gm: 0.225, nm: 0.058, dr: 0.512, it: 3.5, at: 0.72, roe: 0.072, cr: 1.28 },
    { gm: 0.185, nm: 0.028, dr: 0.658, it: 2.2, at: 0.52, roe: 0.035, cr: 0.98 },
    { gm: 0.248, nm: 0.078, dr: 0.485, it: 4.8, at: 0.88, roe: 0.108, cr: 1.65 },
    { gm: 0.212, nm: 0.055, dr: 0.525, it: 5.2, at: 0.85, roe: 0.085, cr: 1.42 },
    { gm: 0.268, nm: 0.095, dr: 0.412, it: 6.5, at: 0.82, roe: 0.138, cr: 1.75 },
  ];

  return seed.map((s, i) => ({
    id: `peer-mfg-${i + 1}`,
    name: s.name,
    stockCode: s.code,
    industry: 'manufacturing' as IndustryCategory,
    scale: s.scale,
    revenue: s.rev,
    totalAssets: s.assets,
    ratios: {
      'gross-margin': ratioTemplates[i].gm,
      'net-margin': ratioTemplates[i].nm,
      'debt-ratio': ratioTemplates[i].dr,
      'inventory-turnover': ratioTemplates[i].it,
      'asset-turnover': ratioTemplates[i].at,
      'roe': ratioTemplates[i].roe,
      'current-ratio': ratioTemplates[i].cr,
    },
  }));
}

export const peerCompanies: PeerCompany[] = [
  ...createManufacturingPeers(),
];

export function getPeerCompaniesByIndustry(
  industry: IndustryCategory,
  scale?: CompanyScale
): PeerCompany[] {
  return peerCompanies.filter((p) => {
    if (p.industry !== industry) return false;
    if (scale) {
      const scaleOrder: CompanyScale[] = ['small', 'medium', 'large', 'xlarge'];
      const targetIdx = scaleOrder.indexOf(scale);
      const peerIdx = scaleOrder.indexOf(p.scale);
      return Math.abs(peerIdx - targetIdx) <= 1;
    }
    return true;
  });
}

export function detectIndustryInfo(data: {
  revenue?: number;
  totalAssets?: number;
}): IndustryInfo {
  const revenue = data.revenue ?? 98000;

  let scale: CompanyScale;
  if (revenue < 50000) {
    scale = 'small';
  } else if (revenue < 200000) {
    scale = 'medium';
  } else if (revenue < 1000000) {
    scale = 'large';
  } else {
    scale = 'xlarge';
  }

  return {
    industry: 'manufacturing',
    industryLabel: industryLabels.manufacturing,
    scale,
    scaleLabel: scaleLabels[scale],
  };
}
