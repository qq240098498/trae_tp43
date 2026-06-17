import type { Interpretation, InterpretationLevel, RatioBenchmark } from '@/types/financial';

function getLevelByBenchmark(
  value: number | null,
  benchmark: RatioBenchmark | null
): InterpretationLevel {
  if (value === null || benchmark === null) return 'normal';
  const { good, warning, danger, higherIsBetter } = benchmark;
  if (higherIsBetter) {
    if (value >= good) return 'excellent';
    if (value >= warning) return 'good';
    if (value >= danger) return 'normal';
    if (value >= danger * 0.5) return 'warning';
    return 'danger';
  } else {
    if (value <= good) return 'excellent';
    if (value <= warning) return 'good';
    if (value <= danger) return 'normal';
    if (value <= danger * 1.3) return 'warning';
    return 'danger';
  }
}

interface InterpreterTemplate {
  [id: string]: (value: number | null, level: InterpretationLevel) => Interpretation;
}

function displayValue(v: number | null, unit: string): string {
  if (v === null) return '暂不可计算（数据缺失）';
  if (unit === '%') return `${(v * 100).toFixed(2)}%`;
  if (unit === '天') return `${v.toFixed(1)} 天`;
  if (unit === '次') return `${v.toFixed(2)} 次`;
  return `${v.toFixed(2)} 倍`;
}

const templates: InterpreterTemplate = {
  'current-ratio': (v, level) => ({
    level,
    summary:
      level === 'excellent' || level === 'good'
        ? `流动比率为 ${displayValue(v, '倍')}，短期偿债能力良好`
        : level === 'warning' || level === 'danger'
        ? `流动比率仅 ${displayValue(v, '倍')}，短期偿债存在压力`
        : `流动比率为 ${displayValue(v, '倍')}，处于一般水平`,
    detail:
      level === 'excellent' || level === 'good'
        ? `公司每 1 元的短期负债，有 ${v?.toFixed(2)} 元的流动资产作为保障，说明企业短期内拿出钱还债的底气很足。即使遇到客户回款延迟，也能从容应对即将到期的借款和应付款。`
        : level === 'warning' || level === 'danger'
        ? `公司每 1 元的短期负债，仅能拿出 ${v?.toFixed(2)} 元的流动资产来对应。如果短期内出现集中还款或供应商催款，可能需要变卖存货、紧急借款才能周转，存在"钱不够用"的风险。`
        : `流动比率处于行业一般水平，短期偿债虽无大碍，但也谈不上宽裕。建议关注应收账款回款速度和存货周转，适当预留安全边际。`,
    analogy:
      level === 'excellent' || level === 'good'
        ? '类比家庭：每月房贷月供 5000 元，你手头有 2 万以上活期存款，还款毫无压力。'
        : level === 'warning' || level === 'danger'
        ? '类比家庭：每月房贷 5000 元，你手头只有 5 千元甚至更少现金，一旦工资晚发几天就要刷信用卡周转。'
        : '类比家庭：每月房贷 5000 元，你手头大约有 7500 元现金，刚好够还但剩不下多少应急钱。',
  }),

  'quick-ratio': (v, level) => ({
    level,
    summary:
      level === 'excellent' || level === 'good'
        ? `速动比率为 ${displayValue(v, '倍')}，即时偿债能力较强`
        : level === 'warning' || level === 'danger'
        ? `速动比率仅 ${displayValue(v, '倍')}，变现还债能力偏弱`
        : `速动比率为 ${displayValue(v, '倍')}，即时偿债一般`,
    detail:
      level === 'excellent' || level === 'good'
        ? `速动比率剔除了存货这种变现较慢的资产，更能反映"紧急情况下能否立刻还钱"。当前值表明：把最难卖的货排除后，公司的现金、应收款等快变资产仍能完全覆盖短期负债。`
        : level === 'warning' || level === 'danger'
        ? `公司扣掉存货后，可快速变现的资产不足以覆盖短期负债。意味着如果债主突然上门要求还钱，公司可能必须"赔本清库存"才能凑齐钱，甚至出现违约风险。`
        : `速动比率处于中性区间，紧急情况下勉强可以应对，但建议适当增加现金储备或加快应收账款回收。`,
    analogy:
      level === 'excellent' || level === 'good'
        ? '类比家庭：不算你家堆积的囤货和二手家电，光是钱包+活期存款就够还信用卡。'
        : level === 'warning' || level === 'danger'
        ? '类比家庭：不算家里的囤货，你钱包+银行卡里的钱不够还信用卡，只能紧急变卖二手物品凑钱。'
        : '类比家庭：不算家里的囤货，你钱包里的钱刚好差不多能还信用卡，只是没有缓冲余地。',
  }),

  'debt-ratio': (v, level) => ({
    level,
    summary:
      level === 'excellent' || level === 'good'
        ? `资产负债率为 ${displayValue(v, '%')}，整体负债水平健康`
        : level === 'warning' || level === 'danger'
        ? `资产负债率高达 ${displayValue(v, '%')}，债务负担偏重`
        : `资产负债率为 ${displayValue(v, '%')}，处于适中水平`,
    detail:
      level === 'excellent' || level === 'good'
        ? `公司每 100 元资产中，只有 ${(v! * 100).toFixed(0)} 元是借来的，其余 ${(100 - v! * 100).toFixed(0)} 元是股东自己的钱。财务结构稳健，抗风险能力强，即使行业不景气也有足够的安全垫。`
        : level === 'warning' || level === 'danger'
        ? `公司每 100 元资产中，有 ${(v! * 100).toFixed(0)} 元是借来的，股东自有资金占比偏低。这意味着公司每年要拿出大量利润偿还利息；若经营稍有不顺，就可能"赚的钱不够还利息"，严重时会面临资金链断裂。`
        : `资产负债率处于行业中等水平，杠杆运用适度。既利用了借款扩大经营的好处，也未过度承担风险。`,
    analogy:
      level === 'excellent' || level === 'good'
        ? '类比买房：一套 100 万的房子，你首付 60 万、贷款 40 万，月供压力很小。'
        : level === 'warning' || level === 'danger'
        ? '类比买房：一套 100 万的房子，你只付了 20 万首付、贷款 80 万，每月工资一半以上要还房贷，一旦失业就断供。'
        : '类比买房：一套 100 万的房子，首付 40 万、贷款 60 万，月供占工资约 3 成，属于典型比例。',
  }),

  'equity-multiplier': (v, level) => ({
    level,
    summary: `权益乘数为 ${displayValue(v, '倍')}，${
      level === 'excellent' || level === 'good' ? '杠杆适度' : level === 'warning' || level === 'danger' ? '杠杆偏高' : '杠杆中性'
    }`,
    detail:
      level === 'excellent' || level === 'good'
        ? `股东每投入 1 元钱，控制着 ${v?.toFixed(2)} 元的总资产规模，经营杠杆运用合理。`
        : level === 'warning' || level === 'danger'
        ? `股东每投入 1 元钱，就撬动了 ${v?.toFixed(2)} 元的总资产，放大经营的同时也放大了亏损风险。`
        : `权益乘数处于一般水平，经营规模与自有资金的匹配度适中。`,
    analogy:
      level === 'excellent' || level === 'good'
        ? '类比开店：你自己出 50 万，借 50 万，总共 100 万开店，盈亏放大 2 倍。'
        : level === 'warning' || level === 'danger'
        ? '类比开店：你自己只出 20 万，借了 80 万开店，赚得多但赔的时候本金很快亏完。'
        : '类比开店：你出 40 万，借 60 万，属于正常的"借钱生钱"模式。',
  }),

  'interest-coverage': (v, level) => ({
    level,
    summary:
      level === 'excellent' || level === 'good'
        ? `利息保障倍数为 ${displayValue(v, '倍')}，偿还利息毫无压力`
        : level === 'warning' || level === 'danger'
        ? `利息保障倍数仅 ${displayValue(v, '倍')}，付息能力堪忧`
        : `利息保障倍数为 ${displayValue(v, '倍')}，付息能力一般`,
    detail:
      level === 'excellent' || level === 'good'
        ? `公司当期赚的钱，是应付利息的 ${v?.toFixed(0)} 倍。就算银行利息翻倍上涨，公司的利润也足以覆盖，不会被利息压垮。`
        : level === 'warning' || level === 'danger'
        ? `公司当期经营利润几乎刚刚够还利息，甚至可能不够。相当于"辛辛苦苦干一年，全都给银行打工了"，如果经营再下滑一点，就会出现"还不上利息"的实质性违约。`
        : `利息保障倍数处于安全与危险的临界区。目前还能付息，但安全空间不大，建议降低有息负债。`,
    analogy:
      level === 'excellent' || level === 'good'
        ? '类比：你月收入 2 万，月供 5 千，收入是房贷的 4 倍，还贷轻松。'
        : level === 'warning' || level === 'danger'
        ? '类比：你月收入 6 千，月供 5 千，扣完房贷只剩生活费，压力山大。'
        : '类比：你月收入 1.2 万，月供 5 千，是房贷的 2.4 倍，勉强能过。',
  }),

  'gross-margin': (v, level) => ({
    level,
    summary:
      level === 'excellent' || level === 'good'
        ? `毛利率为 ${displayValue(v, '%')}，产品附加值较高`
        : level === 'warning' || level === 'danger'
        ? `毛利率仅 ${displayValue(v, '%')}，盈利空间偏薄`
        : `毛利率为 ${displayValue(v, '%')}，处于行业中等`,
    detail:
      level === 'excellent' || level === 'good'
        ? `公司每卖出 100 元商品，扣除直接成本后还剩 ${(v! * 100).toFixed(0)} 元可以覆盖销售、管理、研发等各项费用并最终形成利润。较高的毛利率意味着产品具备品牌、技术或稀缺性优势。`
        : level === 'warning' || level === 'danger'
        ? `公司每卖出 100 元商品，扣掉进货/生产成本后只剩 ${(v! * 100).toFixed(0)} 元。再扣掉销售员工资、办公室房租、高管工资、财务费用后，真正落到口袋的钱可能所剩无几，甚至亏本。`
        : `毛利率处于一般水平，产品有一定溢价能力但不突出。需要靠规模效应或精细的费用管理才能赚钱。`,
    analogy:
      level === 'excellent' || level === 'good'
        ? '类比：一杯咖啡成本 8 元，卖 40 元，扣掉咖啡豆和牛奶后还剩 32 元交房租、发工资。'
        : level === 'warning' || level === 'danger'
        ? '类比：一盘青菜成本 6 元，只卖 8 元，扣掉菜钱只剩 2 元，租金都赚不回。'
        : '类比：一件衣服成本 80 元，卖 160 元，毛利一半，属于常见服装模式。',
  }),

  'net-margin': (v, level) => ({
    level,
    summary:
      level === 'excellent' || level === 'good'
        ? `净利率为 ${displayValue(v, '%')}，最终盈利水平优秀`
        : level === 'warning' || level === 'danger'
        ? `净利率仅 ${displayValue(v, '%')}，几乎不赚钱甚至亏损`
        : `净利率为 ${displayValue(v, '%')}，盈利水平一般`,
    detail:
      level === 'excellent' || level === 'good'
        ? `公司每做 100 元生意，最终真正装进兜里的净利润有 ${(v! * 100).toFixed(2)} 元。这是扣除了所有成本、费用、税款之后的"真金白银"，说明公司综合盈利能力强。`
        : level === 'warning' || level === 'danger'
        ? `公司每做 100 元生意，最后能留下的只有 ${(v! * 100).toFixed(2)} 元甚至为负。看似生意做了不少，但被各种费用"吃掉了"大部分，相当于"忙了一年白忙活"。`
        : `净利率处于行业普通水平，有利润但不算丰厚。管理层应重点看费用管控和毛利率提升。`,
    analogy:
      level === 'excellent' || level === 'good'
        ? '类比：一个年营收百万的小店，真正揣进老板口袋的钱有 15 万以上。'
        : level === 'warning' || level === 'danger'
        ? '类比：年营收百万的小店，老板年底一算只剩 1 万，还不如去打工赚得多。'
        : '类比：年营收百万的小店，最后能剩 8-10 万，算正常生意。',
  }),

  'roe': (v, level) => ({
    level,
    summary:
      level === 'excellent' || level === 'good'
        ? `ROE 为 ${displayValue(v, '%')}，股东回报极佳`
        : level === 'warning' || level === 'danger'
        ? `ROE 仅 ${displayValue(v, '%')}，股东回报率偏低`
        : `ROE 为 ${displayValue(v, '%')}，回报尚可`,
    detail:
      level === 'excellent' || level === 'good'
        ? `股东最初投 100 元到公司，今年就赚回了 ${(v! * 100).toFixed(1)} 元。这个水平远超银行理财、国债等无风险收益，说明公司具备优秀的"赚钱机器"属性。`
        : level === 'warning' || level === 'danger'
        ? `股东投 100 元，一年只赚 ${(v! * 100).toFixed(1)} 元，甚至比不上存定期。股东的钱相当于被"低效占用"，不如撤资去做其他投资。`
        : `ROE 大致相当于理财产品收益水平，谈不上优秀但也过得去。需要从"提高利润率、加快周转、合理加杠杆"三方面改善。`,
    analogy:
      level === 'excellent' || level === 'good'
        ? '类比：开餐厅投入 100 万，当年就纯赚 20 万，5 年收回本金。'
        : level === 'warning' || level === 'danger'
        ? '类比：开餐厅投入 100 万，当年纯赚 2 万，存银行利息都比这多。'
        : '类比：投入 100 万，年纯利 10 万，10 年回本的正常生意。',
  }),

  'roa': (v, level) => ({
    level,
    summary:
      level === 'excellent' || level === 'good'
        ? `ROA 为 ${displayValue(v, '%')}，资产使用效率较高`
        : level === 'warning' || level === 'danger'
        ? `ROA 仅 ${displayValue(v, '%')}，资产未充分利用`
        : `ROA 为 ${displayValue(v, '%')}，资产使用效率一般`,
    detail:
      level === 'excellent' || level === 'good'
        ? `公司每 100 元资产能产生 ${(v! * 100).toFixed(1)} 元净利润，说明厂房、设备、现金等所有资源都在高效运转。`
        : level === 'warning' || level === 'danger'
        ? `公司资产庞大但产出微薄，每 100 元资产只赚 ${(v! * 100).toFixed(1)} 元，说明存在大量闲置资产或产能利用率不足。`
        : `资产整体使用效率处于行业平均水平，建议梳理低效资产、提高周转。`,
    analogy:
      level === 'excellent' || level === 'good'
        ? '类比：买了 100 台设备，90 台都在三班倒运转。'
        : level === 'warning' || level === 'danger'
        ? '类比：买了 100 台设备，常年只有 20 台在开工。'
        : '类比：100 台设备约 60 台在正常运转。',
  }),

  'operating-margin': (v, level) => ({
    level,
    summary:
      level === 'excellent' || level === 'good'
        ? `营业利润率为 ${displayValue(v, '%')}，主业盈利能力强`
        : level === 'warning' || level === 'danger'
        ? `营业利润率仅 ${displayValue(v, '%')}，主业几乎不赚钱`
        : `营业利润率为 ${displayValue(v, '%')}，主业盈利一般`,
    detail:
      level === 'excellent' || level === 'good'
        ? `每 100 元营业收入中，靠主营业务赚 ${(v! * 100).toFixed(1)} 元，排除了非经常性损益的干扰，反映公司"正经做生意"的盈利能力扎实。`
        : level === 'warning' || level === 'danger'
        ? `主营业务本身的利润空间已经很薄甚至倒挂，公司若还有利润可能来自卖资产、政府补贴等"外快"，这种盈利不可持续。`
        : `主业有利润但不突出，核心竞争力仍需加强。`,
    analogy:
      level === 'excellent' || level === 'good'
        ? '类比：你开餐厅靠卖饭菜赚了钱，不是靠变卖厨房设备。'
        : level === 'warning' || level === 'danger'
        ? '类比：餐厅饭菜不赚钱，最后靠卖掉一台旧冰箱才勉强盈利。'
        : '类比：餐厅饭菜利润不算高，但确实是靠主业支撑。',
  }),

  'expense-ratio': (v, level) => ({
    level,
    summary:
      level === 'excellent' || level === 'good'
        ? `费用率为 ${displayValue(v, '%')}，费用管控优秀`
        : level === 'warning' || level === 'danger'
        ? `费用率高达 ${displayValue(v, '%')}，费用吞噬过多利润`
        : `费用率为 ${displayValue(v, '%')}，费用管控一般`,
    detail:
      level === 'excellent' || level === 'good'
        ? `每 100 元营收中，销售、管理、财务、研发四项期间费用合计仅占 ${(v! * 100).toFixed(1)} 元，费用管控到位，毛利润能较多转化为净利润。`
        : level === 'warning' || level === 'danger'
        ? `每 100 元营收中，有 ${(v! * 100).toFixed(1)} 元花在员工工资、推广、租金、利息等上面。毛利润被费用严重侵蚀，管理层应逐项审查预算，区分"必须花"和"可以砍"。`
        : `费用率处于中等，建议通过精细化管理进一步压缩非必要开支。`,
    analogy:
      level === 'excellent' || level === 'good'
        ? '类比：一个家庭月收入 2 万，杂项花费（聚餐、旅游、人情）只花 3000 元。'
        : level === 'warning' || level === 'danger'
        ? '类比：月收入 2 万，人情应酬+冲动消费就花掉 7000，存不下钱。'
        : '类比：月收入 2 万，杂项花 5000，中等水平。',
  }),

  'ar-turnover': (v, level) => ({
    level,
    summary:
      level === 'excellent' || level === 'good'
        ? `应收账款周转率为 ${displayValue(v, '次')}，回款速度快`
        : level === 'warning' || level === 'danger'
        ? `应收账款周转率仅 ${displayValue(v, '次')}，回款缓慢`
        : `应收账款周转率为 ${displayValue(v, '次')}，回款速度一般`,
    detail:
      level === 'excellent' || level === 'good'
        ? `客户平均 ${(365 / (v || 1)).toFixed(0)} 天左右就会回款，公司几乎没有被拖欠的压力，相当于"货一出手，钱到账"，现金充沛。`
        : level === 'warning' || level === 'danger'
        ? `客户欠账时间过长，平均 ${(365 / (v || 1)).toFixed(0)} 天才回款，公司账上记了不少"收入"但真正收到的现金少。如果客户倒闭赖账，这些收入就变成坏账，后果严重。`
        : `回款速度处于行业一般水平，建议优化合同条款，对长期拖欠客户收紧信用政策。`,
    analogy:
      level === 'excellent' || level === 'good'
        ? '类比：你装修完一套房，业主 45 天内就把工程款打给你。'
        : level === 'warning' || level === 'danger'
        ? '类比：装修完工半年了，业主还拖着一半款不给，你没钱买下一套的建材。'
        : '类比：装修完工后约 3 个月业主回款，行业常见。',
  }),

  'ar-days': (v, level) => ({
    level,
    summary:
      level === 'excellent' || level === 'good'
        ? `应收账款周转天数为 ${displayValue(v, '天')}，回款周期短`
        : level === 'warning' || level === 'danger'
        ? `应收账款周转天数长达 ${displayValue(v, '天')}，资金被客户占用`
        : `应收账款周转天数为 ${displayValue(v, '天')}，回款周期一般`,
    detail:
      level === 'excellent' || level === 'good'
        ? `从卖出产品到收到客户的钱，平均只需 ${v?.toFixed(0)} 天，现金回流效率高，公司手上总有活钱可以用于备货、发工资。`
        : level === 'warning' || level === 'danger'
        ? `平均需要 ${v?.toFixed(0)} 天才能收回应收账款，相当于被客户"借用"了大半年资金，公司自己反而可能要去借钱周转，形成"两头被挤压"。`
        : `周转天数处于行业平均水平，建议建立客户分级信用制度。`,
    analogy:
      level === 'excellent' || level === 'good'
        ? '类比：你接外包项目，客户一个半月之内就把尾款结清。'
        : level === 'warning' || level === 'danger'
        ? '类比：外包做完半年，客户还没给你打款，你天天催债。'
        : '类比：做完项目约 3 个月客户付款，正常节奏。',
  }),

  'inventory-turnover': (v, level) => ({
    level,
    summary:
      level === 'excellent' || level === 'good'
        ? `存货周转率为 ${displayValue(v, '次')}，货卖得很快`
        : level === 'warning' || level === 'danger'
        ? `存货周转率仅 ${displayValue(v, '次')}，库存积压严重`
        : `存货周转率为 ${displayValue(v, '次')}，销售速度一般`,
    detail:
      level === 'excellent' || level === 'good'
        ? `仓库的货平均一年能卖空 ${v?.toFixed(0)} 次，几乎没有滞销库存，原材料和成品在公司"停留时间短"，不易贬值，也不用花大量仓储费。`
        : level === 'warning' || level === 'danger'
        ? `这批货一年都卖不完 ${v?.toFixed(1)} 次，意味着很多产品放了一年还在仓库。服装、食品、消费电子这类有时效性的产品可能早已贬值，存在"折价清仓"的减值风险。`
        : `存货周转处于行业一般水平，建议加强供应链预测，避免盲目生产。`,
    analogy:
      level === 'excellent' || level === 'good'
        ? '类比：水果店进货每周清空一次，水果新鲜不烂，资金周转快。'
        : level === 'warning' || level === 'danger'
        ? '类比：水果店进的草莓放了 3 个月还没卖完，早就长霉了。'
        : '类比：水果店进货 2 个月清完一次，正常节奏。',
  }),

  'inventory-days': (v, level) => ({
    level,
    summary:
      level === 'excellent' || level === 'good'
        ? `存货周转天数为 ${displayValue(v, '天')}，库存占用时间短`
        : level === 'warning' || level === 'danger'
        ? `存货周转天数长达 ${displayValue(v, '天')}，库存"睡大觉"`
        : `存货周转天数为 ${displayValue(v, '天')}，库存持有适中`,
    detail:
      level === 'excellent' || level === 'good'
        ? `原材料买回来，到成品最终卖出去，平均只用 ${v?.toFixed(0)} 天，资金被"锁死"在库存上的时间很短。`
        : level === 'warning' || level === 'danger'
        ? `产品平均要 ${v?.toFixed(0)} 天才能从仓库卖出去，相当于占用公司大量现金不流动。再过久一点，可能面临折价、过期、淘汰的三重损失。`
        : `库存持有天数处于正常区间，定期盘点即可。`,
    analogy:
      level === 'excellent' || level === 'good'
        ? '类比：你家冰箱里的菜，买完 1 个月内就吃完了，食材新鲜。'
        : level === 'warning' || level === 'danger'
        ? '类比：冰箱里的菜放了 8 个月，早已过期变味。'
        : '类比：冰箱里的菜一般 3 个月吃完，正常。',
  }),

  'asset-turnover': (v, level) => ({
    level,
    summary:
      level === 'excellent' || level === 'good'
        ? `总资产周转率为 ${displayValue(v, '次')}，整体运营效率高`
        : level === 'warning' || level === 'danger'
        ? `总资产周转率仅 ${displayValue(v, '次')}，资产运营低效`
        : `总资产周转率为 ${displayValue(v, '次')}，运营效率一般`,
    detail:
      level === 'excellent' || level === 'good'
        ? `每 1 元资产能产生 ${v?.toFixed(2)} 元的营业收入，说明公司的厂房、设备、存货、现金等所有资源都被充分调动起来做生意。`
        : level === 'warning' || level === 'danger'
        ? `每 1 元资产仅换来 ${v?.toFixed(2)} 元收入，公司"摊子铺得大、生意做得少"，可能存在闲置厂房、落后设备、库存积压等问题。`
        : `整体运营效率中等，可通过处置低效资产、提高产能利用率改善。`,
    analogy:
      level === 'excellent' || level === 'good'
        ? '类比：你买了辆货车，白天黑夜跑运输，几乎不停。'
        : level === 'warning' || level === 'danger'
        ? '类比：你买了辆货车，一个月只拉 3 趟活，油钱都赚不回。'
        : '类比：货车一个月拉约 15 趟活，平均水平。',
  }),

  'revenue-growth': (v, level) => ({
    level,
    summary:
      level === 'excellent' || level === 'good'
        ? `营业收入同比增长 ${displayValue(v, '%')}，业务扩张迅速`
        : level === 'warning' || level === 'danger'
        ? `营业收入增长仅 ${displayValue(v, '%')}，增长乏力甚至下滑`
        : `营业收入增长 ${displayValue(v, '%')}，增速一般`,
    detail:
      level === 'excellent' || level === 'good'
        ? `本期收入相比上期多了 ${(v! * 100).toFixed(1)}%，公司生意规模在显著扩大。但建议同时关注利润率和经营现金流，确认"增收也增利"。`
        : level === 'warning' || level === 'danger'
        ? `收入几乎没有增长甚至出现 ${(v! * 100).toFixed(1)}% 的下滑，说明公司市场份额可能被蚕食，产品需求萎缩，或定价权减弱。增长"失速"往往是公司陷入困境的第一步信号。`
        : `收入保持温和增长，需要观察能否持续，同时确保增长来自真实市场需求而非压货。`,
    analogy:
      level === 'excellent' || level === 'good'
        ? '类比：去年开 1 家店月销 10 万，今年开 2 家店月销 25 万，明显做大。'
        : level === 'warning' || level === 'danger'
        ? '类比：去年月销 10 万，今年月销还是 9.5 万，做了一年生意反而更小。'
        : '类比：去年月销 10 万，今年月销 11 万，稳步前进。',
  }),

  'net-profit-growth': (v, level) => ({
    level,
    summary:
      level === 'excellent' || level === 'good'
        ? `净利润同比增长 ${displayValue(v, '%')}，盈利大幅提升`
        : level === 'warning' || level === 'danger'
        ? `净利润变化 ${displayValue(v, '%')}，盈利下滑甚至腰斩`
        : `净利润增长 ${displayValue(v, '%')}，盈利稳步增长`,
    detail:
      level === 'excellent' || level === 'good'
        ? `净利润比去年多赚 ${(v! * 100).toFixed(1)}%，这是最有"含金量"的增长。如果利润增速高于收入增速，说明公司不仅做大了，还做得更精细、更赚钱。`
        : level === 'warning' || level === 'danger'
        ? `净利润下降了 ${(v! * 100).toFixed(1)}%，股东真正拿到手的回报在缩水。需要深入排查是毛利率下降、费用上涨、还是减值计提造成的，对症下药。`
        : `净利润保持适度增长，需注意后续年度的持续性。`,
    analogy:
      level === 'excellent' || level === 'good'
        ? '类比：去年纯存下 10 万，今年纯存下 14 万，日子越过越富。'
        : level === 'warning' || level === 'danger'
        ? '类比：去年纯存 10 万，今年只存 5 万，生活质量面临倒退。'
        : '类比：去年纯存 10 万，今年存 11.5 万，缓步改善。',
  }),

  'asset-growth': (v, level) => ({
    level,
    summary: `总资产同比变化 ${displayValue(v, '%')}`,
    detail:
      v && v > 0
        ? `公司"盘子"在扩大，资产总额较上期增长 ${(v * 100).toFixed(1)}%。需同时结合 ROA、ROE 判断资产扩张是否真的带来了更多利润，而不是盲目堆规模。`
        : `公司资产规模在收缩。可能是处置闲置资产、偿还债务，也可能是亏损侵蚀。需要结合资产结构进一步分析。`,
    analogy: v && v > 0
      ? '类比：你家今年又多买了一套房，总资产在扩大。'
      : '类比：你卖了辆车用于还债，家里资产规模变小。',
  }),

  'equity-growth': (v, level) => ({
    level,
    summary: `净资产同比变化 ${displayValue(v, '%')}`,
    detail:
      v && v > 0
        ? `归属于股东的净资产增长 ${(v * 100).toFixed(1)}%，说明公司通过利润留存或定向增资增厚了"家底"，股东的权益在增值。`
        : `股东净资产出现萎缩，通常是当期经营亏损、分红超过利润、或回购注销造成的，需仔细甄别原因。`,
    analogy: v && v > 0
      ? '类比：你家房贷还了一年，欠银行的钱变少，房产净值在增加。'
      : '类比：你今年亏损严重，不仅没存钱还把老本啃了。',
  }),
};

export function interpretRatio(
  id: string,
  name: string,
  value: number | null,
  benchmark: RatioBenchmark | null
): Interpretation {
  const level = getLevelByBenchmark(value, benchmark);
  if (templates[id]) return templates[id](value, level);
  return {
    level,
    summary: `${name}：${displayValue(value, '')}`,
    detail: `${name}的当前值为 ${displayValue(value, '')}。请结合行业与历史数据进行综合判断。`,
    analogy: '（暂无类比说明）',
  };
}
