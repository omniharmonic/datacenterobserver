import type { OrgRelationshipEdge } from '@/lib/types';

export const ORG_RELATIONSHIPS: OrgRelationshipEdge[] = [
  // ── Stargate consortium (Jan 2025) ─────────────────────────────
  {
    source: 'openai',
    target: 'stargate',
    relationship: 'joint_venture',
    description: 'OpenAI is operating partner of the Stargate Project.',
  },
  {
    source: 'softbank',
    target: 'stargate',
    relationship: 'joint_venture',
    description: 'SoftBank is financial lead and chair of Stargate.',
    value_usd: 100_000_000_000,
  },
  {
    source: 'oracle',
    target: 'stargate',
    relationship: 'joint_venture',
    description: 'Oracle provides cloud + infrastructure for Stargate.',
  },
  {
    source: 'mgx',
    target: 'stargate',
    relationship: 'joint_venture',
    description: 'MGX is technology partner and equity investor.',
  },
  {
    source: 'nvidia',
    target: 'stargate',
    relationship: 'supplies',
    description: 'NVIDIA supplies the GPU systems powering Stargate sites.',
  },
  {
    source: 'crusoe-energy',
    target: 'stargate',
    relationship: 'partners_with',
    description: 'Crusoe is the developer/operator of the Stargate flagship Abilene TX campus.',
  },
  {
    source: 'bechtel',
    target: 'crusoe-energy',
    relationship: 'contracted_by',
    description: 'Bechtel is the EPC contractor for Stargate Abilene.',
  },
  {
    source: 'softbank',
    target: 'openai',
    relationship: 'invests_in',
    description: 'SoftBank led OpenAI\'s $40B primary round (closed Mar 31, 2025; $300B post-money). Separate from the Stargate JV; SoftBank itself committed ~$30B of the $40B.',
    value_usd: 40_000_000_000,
    source_url: 'https://www.cnbc.com/2025/03/31/openai-closes-40-billion-in-funding-the-largest-private-fundraise-in-history-softbank-chatgpt.html',
  },

  // ── Anthropic compute partnerships ─────────────────────────────
  {
    source: 'amazon',
    target: 'anthropic',
    relationship: 'invests_in',
    description: 'Amazon committed $8B to Anthropic (Sept 2023 + Nov 2024); April 2026 added a further $5B immediate + up to $20B milestone-tied, bringing announced total to ~$33B.',
    value_usd: 8_000_000_000,
    source_url: 'https://www.aboutamazon.com/news/company-news/amazon-invests-additional-5-billion-anthropic-ai',
  },
  {
    source: 'google',
    target: 'anthropic',
    relationship: 'invests_in',
    description: 'Google committed ~$2B in Oct 2023 ($500M up-front + $1.5B convertible note), on top of an earlier ~10% stake; Bloomberg reported in April 2026 Google plans up to $40B more.',
    value_usd: 2_000_000_000,
    source_url: 'https://www.cnbc.com/2023/10/27/google-commits-to-invest-2-billion-in-openai-competitor-anthropic.html',
  },

  // ── Blackstone / QTS ────────────────────────────────────────────
  {
    source: 'blackstone',
    target: 'qts',
    relationship: 'acquired',
    description: 'Blackstone acquired QTS Realty Trust in a $10B take-private (2021).',
    value_usd: 10_000_000_000,
  },

  // ── KKR + GIP + BlackRock chain (CyrusOne) ─────────────────────
  {
    source: 'kkr',
    target: 'cyrusone',
    relationship: 'acquired',
    description: 'KKR + GIP took CyrusOne private for $15B (2022).',
    value_usd: 15_000_000_000,
  },
  {
    source: 'gip',
    target: 'cyrusone',
    relationship: 'acquired',
    description: 'Co-acquirer with KKR.',
    value_usd: 15_000_000_000,
  },
  {
    source: 'blackrock',
    target: 'gip',
    relationship: 'acquired',
    description: 'BlackRock acquired GIP for $12.5B (2024), inheriting CyrusOne stake.',
    value_usd: 12_500_000_000,
  },

  // ── DigitalBridge holdings ─────────────────────────────────────
  {
    source: 'digitalbridge',
    target: 'vantage',
    relationship: 'owns',
    description: 'DigitalBridge is majority owner of Vantage Data Centers.',
  },
  {
    source: 'digitalbridge',
    target: 'databank',
    relationship: 'owns',
    description: 'DigitalBridge is the largest shareholder in DataBank.',
  },
  {
    source: 'digitalbridge',
    target: 'switch',
    relationship: 'acquired',
    description: 'DigitalBridge + IFM Investors took Switch private for $11B (2022).',
    value_usd: 11_000_000_000,
  },

  // ── Macquarie / Aligned ────────────────────────────────────────
  {
    source: 'macquarie',
    target: 'aligned-dc',
    relationship: 'owns',
    description: 'Macquarie Asset Management is majority owner of Aligned Data Centers.',
  },

  // ── Blue Owl / IPI / Stack ─────────────────────────────────────
  {
    source: 'blue-owl',
    target: 'ipi-partners',
    relationship: 'acquired',
    description: 'Blue Owl acquired IPI Partners for $1B (2024).',
    value_usd: 1_000_000_000,
  },
  {
    source: 'ipi-partners',
    target: 'stack-infra',
    relationship: 'owns',
    description: 'IPI Partners (now under Blue Owl) is owner of Stack Infrastructure.',
  },

  // ── Brookfield holdings ────────────────────────────────────────
  {
    source: 'brookfield',
    target: 'compass-dc',
    relationship: 'owns',
    description: 'Brookfield Infrastructure (with Ontario Teachers) owns Compass Datacenters.',
  },
  {
    source: 'brookfield',
    target: 'microsoft',
    relationship: 'partners_with',
    description: '$10B+ renewable PPA framework agreement (2024) for Microsoft\'s AI campuses.',
    value_usd: 10_000_000_000,
  },

  // ── NVIDIA equity stakes / GPU supply chain ────────────────────
  {
    source: 'nvidia',
    target: 'coreweave',
    relationship: 'invests_in',
    description: 'NVIDIA is a significant equity holder and GPU supplier to CoreWeave.',
  },
  {
    source: 'nvidia',
    target: 'lambda-labs',
    relationship: 'invests_in',
    description: 'NVIDIA participated in Lambda\'s 2024 $500M Series C.',
  },
  {
    source: 'nvidia',
    target: 'together-ai',
    relationship: 'invests_in',
    description: 'NVIDIA invested in Together AI\'s Series A/B.',
  },
  {
    source: 'nvidia',
    target: 'applied-digital',
    relationship: 'supplies',
    description: 'NVIDIA GPUs power Applied Digital\'s ND HPC campus.',
  },
  {
    source: 'nvidia',
    target: 'iren',
    relationship: 'supplies',
    description: 'NVIDIA H100/H200 supply to IREN Childress TX AI hosting.',
  },
  {
    source: 'nvidia',
    target: 'microsoft',
    relationship: 'supplies',
    description: 'Largest single buyer of NVIDIA GPUs (FY25).',
  },
  {
    source: 'nvidia',
    target: 'meta',
    relationship: 'supplies',
  },
  {
    source: 'nvidia',
    target: 'amazon',
    relationship: 'supplies',
  },
  {
    source: 'nvidia',
    target: 'oracle',
    relationship: 'supplies',
  },
  {
    source: 'nvidia',
    target: 'xai',
    relationship: 'supplies',
    description: 'xAI Colossus uses ~200K NVIDIA H100/H200 GPUs.',
  },

  // ── Nuclear / power-purchase deals ─────────────────────────────
  {
    source: 'constellation',
    target: 'microsoft',
    relationship: 'supplies',
    description: 'Constellation\'s 20-year PPA to restart Three Mile Island Unit 1 for Microsoft (2024).',
    value_usd: 1_600_000_000,
  },
  {
    source: 'vistra',
    target: 'microsoft',
    relationship: 'partners_with',
    description: 'Comanche Peak nuclear PPA discussions with Microsoft.',
  },
  {
    source: 'talen',
    target: 'amazon',
    relationship: 'supplies',
    description: 'Talen sold Cumulus campus to AWS adjacent to Susquehanna nuclear plant; FERC reviewing.',
    value_usd: 650_000_000,
  },
  {
    source: 'ecp',
    target: 'constellation',
    relationship: 'acquired',
    description: 'Constellation acquiring Calpine from ECP for $26.6B (announced Jan 2025) — gas+geothermal scale.',
    value_usd: 26_600_000_000,
  },

  // ── Utility supply (to hyperscalers) ───────────────────────────
  {
    source: 'dominion-energy',
    target: 'amazon',
    relationship: 'supplies',
    description: 'Dominion supplies the Virginia Data Center Alley.',
  },
  {
    source: 'dominion-energy',
    target: 'microsoft',
    relationship: 'supplies',
  },
  {
    source: 'dominion-energy',
    target: 'meta',
    relationship: 'supplies',
  },
  {
    source: 'dominion-energy',
    target: 'google',
    relationship: 'supplies',
  },
  {
    source: 'georgia-power',
    target: 'meta',
    relationship: 'supplies',
  },
  {
    source: 'georgia-power',
    target: 'google',
    relationship: 'supplies',
  },
  {
    source: 'georgia-power',
    target: 'microsoft',
    relationship: 'supplies',
  },
  {
    source: 'aep',
    target: 'google',
    relationship: 'supplies',
  },
  {
    source: 'aep',
    target: 'amazon',
    relationship: 'supplies',
  },
  {
    source: 'tva',
    target: 'xai',
    relationship: 'supplies',
    description: 'TVA supplies grid power to xAI Colossus.',
  },
  {
    source: 'tva',
    target: 'google',
    relationship: 'supplies',
  },
  {
    source: 'entergy',
    target: 'meta',
    relationship: 'supplies',
    description: 'Entergy Louisiana serving Meta\'s Hyperion campus (Richland Parish).',
  },
  {
    source: 'duke-energy',
    target: 'google',
    relationship: 'supplies',
  },
  {
    source: 'duke-energy',
    target: 'amazon',
    relationship: 'supplies',
  },
  {
    source: 'aps',
    target: 'microsoft',
    relationship: 'supplies',
  },
  {
    source: 'aps',
    target: 'google',
    relationship: 'supplies',
  },
  {
    source: 'srp',
    target: 'meta',
    relationship: 'supplies',
    description: 'SRP serves Mesa/Queen Creek Meta campus.',
  },
  {
    source: 'srp',
    target: 'google',
    relationship: 'supplies',
  },
  {
    source: 'xcel',
    target: 'microsoft',
    relationship: 'supplies',
  },
  {
    source: 'xcel',
    target: 'meta',
    relationship: 'supplies',
  },
  {
    source: 'pacificorp',
    target: 'amazon',
    relationship: 'supplies',
  },
  {
    source: 'pacificorp',
    target: 'meta',
    relationship: 'supplies',
  },
  {
    source: 'nextera',
    target: 'google',
    relationship: 'supplies',
    description: 'PPA framework for renewables tied to Google data centers.',
  },
  {
    source: 'nextera',
    target: 'meta',
    relationship: 'supplies',
  },

  // ── Utility parent-subsidiary structure ────────────────────────
  {
    source: 'georgia-power',
    target: 'southern-co',
    relationship: 'subsidiary_of',
    description: 'Georgia Power is a subsidiary of Southern Company.',
  },

  // ── Grid operator / regulator relationships ────────────────────
  {
    source: 'pjm',
    target: 'dominion-energy',
    relationship: 'partners_with',
    description: 'PJM coordinates the bulk power market that Dominion participates in.',
  },
  {
    source: 'pjm',
    target: 'aep',
    relationship: 'partners_with',
  },
  {
    source: 'pjm',
    target: 'talen',
    relationship: 'partners_with',
  },
  {
    source: 'ercot',
    target: 'vistra',
    relationship: 'partners_with',
  },
  {
    source: 'miso',
    target: 'entergy',
    relationship: 'partners_with',
  },
  {
    source: 'ferc',
    target: 'talen',
    relationship: 'partners_with',
    description: 'FERC reviewing the AWS-Talen co-location amendment (2024-25).',
  },

  // ── Construction partnerships ──────────────────────────────────
  {
    source: 'mortenson',
    target: 'microsoft',
    relationship: 'contracted_by',
    description: 'Mortenson has constructed multiple Microsoft hyperscale campuses.',
  },
  {
    source: 'mortenson',
    target: 'meta',
    relationship: 'contracted_by',
  },
  {
    source: 'holder',
    target: 'meta',
    relationship: 'contracted_by',
    description: 'Holder is a primary GC on Meta data-center builds.',
  },
  {
    source: 'holder',
    target: 'google',
    relationship: 'contracted_by',
  },
  {
    source: 'dpr',
    target: 'google',
    relationship: 'contracted_by',
  },
  {
    source: 'dpr',
    target: 'microsoft',
    relationship: 'contracted_by',
  },
  {
    source: 'turner',
    target: 'amazon',
    relationship: 'contracted_by',
  },
  {
    source: 'burns-mcdonnell',
    target: 'amazon',
    relationship: 'contracted_by',
    description: 'Substation + interconnect EPC for AWS Virginia campuses.',
  },
  {
    source: 'burns-mcdonnell',
    target: 'dominion-energy',
    relationship: 'contracted_by',
  },
  {
    source: 'hdr',
    target: 'meta',
    relationship: 'contracted_by',
  },

  // ── Lobbying-firm representation ───────────────────────────────
  {
    source: 'akin-gump',
    target: 'amazon',
    relationship: 'lobbies_for',
    description: 'Akin Gump is one of Amazon\'s top retained federal lobby firms.',
  },
  {
    source: 'akin-gump',
    target: 'oracle',
    relationship: 'lobbies_for',
  },
  {
    source: 'brownstein-hyatt',
    target: 'meta',
    relationship: 'lobbies_for',
  },
  {
    source: 'brownstein-hyatt',
    target: 'nvidia',
    relationship: 'lobbies_for',
  },
  {
    source: 'brownstein-hyatt',
    target: 'dominion-energy',
    relationship: 'lobbies_for',
  },
  {
    source: 'invariant',
    target: 'microsoft',
    relationship: 'lobbies_for',
  },
  {
    source: 'invariant',
    target: 'openai',
    relationship: 'lobbies_for',
  },
  {
    source: 'capitol-counsel',
    target: 'aep',
    relationship: 'lobbies_for',
  },
  {
    source: 'capitol-counsel',
    target: 'duke-energy',
    relationship: 'lobbies_for',
  },

  // ── Crypto-to-AI converter partnerships ────────────────────────
  {
    source: 'coreweave',
    target: 'microsoft',
    relationship: 'partners_with',
    description: 'Microsoft is CoreWeave\'s largest customer (multi-billion-dollar capacity commitments).',
  },
  {
    source: 'coreweave',
    target: 'openai',
    relationship: 'partners_with',
    description: '$11.9B 5-year capacity deal (March 2025).',
    value_usd: 11_900_000_000,
  },
  {
    source: 'iren',
    target: 'microsoft',
    relationship: 'partners_with',
    description: 'GPU-hosting capacity agreement (2025).',
  },

  // ── Anthropic / Fluidstack / Google triangle (Nov 2025+) ───────
  {
    source: 'anthropic',
    target: 'fluidstack',
    relationship: 'partners_with',
    description: 'Anthropic\'s $50B US infrastructure plan anchors with Fluidstack at Lake Mariner NY and Texas.',
    source_url: 'https://www.anthropic.com/news/anthropic-invests-50-billion-in-american-ai-infrastructure',
  },
  {
    source: 'fluidstack',
    target: 'terawulf',
    relationship: 'partners_with',
    description: 'Fluidstack leases GPU capacity at TeraWulf\'s Lake Mariner site.',
  },
  {
    source: 'google',
    target: 'fluidstack',
    relationship: 'invests_in',
    description: 'Google has backstopped Fluidstack lease commitments tied to its Anthropic compute investment.',
  },
  {
    source: 'terawulf',
    target: 'anthropic',
    relationship: 'supplies',
    description: 'TeraWulf hosts the Lake Mariner facility used for Anthropic Claude training.',
  },

  // ── Apple supply chain ─────────────────────────────────────────
  {
    source: 'duke-energy',
    target: 'apple',
    relationship: 'supplies',
    description: 'Duke Energy serves the Maiden NC iCloud / Apple Intelligence campus.',
  },

  // ── Tract / Fleet ─────────────────────────────────────────────
  {
    source: 'tract',
    target: 'fleet-data-centers',
    relationship: 'owns',
    description: 'Tract backs Fleet; Fleet closed a $4.6B financing for its Storey County NV campus in May 2026.',
    value_usd: 4_600_000_000,
  },
  {
    source: 'nv-energy',
    target: 'tract',
    relationship: 'supplies',
  },
  {
    source: 'nv-energy',
    target: 'fleet-data-centers',
    relationship: 'supplies',
  },

  // ── Stargate site developers ──────────────────────────────────
  {
    source: 'vantage',
    target: 'stargate',
    relationship: 'partners_with',
    description: 'Vantage is developer of two Stargate sites: Project Frontier (Shackelford TX) and Project Lighthouse (Port Washington WI).',
  },
  {
    source: 'related-digital',
    target: 'stargate',
    relationship: 'partners_with',
    description: 'Developer of The Barn (Stargate Saline Township, MI).',
  },
  {
    source: 'dte-energy',
    target: 'stargate',
    relationship: 'supplies',
    description: 'MPSC approved 1.4 GW DTE delivery to Stargate Saline; uses existing transmission + battery storage.',
  },
  {
    source: 'we-energies',
    target: 'stargate',
    relationship: 'supplies',
    description: 'We Energies serves Stargate Port Washington (Project Lighthouse).',
  },
  {
    source: 'voltagrid',
    target: 'crusoe-energy',
    relationship: 'partners_with',
    description: 'VoltaGrid operates the on-site natural-gas microgrid (~700 MW, 210 gensets) at Stargate Abilene.',
  },

  // ── Meta utility ties for new sites ───────────────────────────
  {
    source: 'alliant-energy',
    target: 'meta',
    relationship: 'supplies',
    description: 'Serves Meta Beaver Dam WI.',
  },
  {
    source: 'black-hills-energy',
    target: 'meta',
    relationship: 'supplies',
    description: 'Serves Meta Cheyenne WY.',
  },
  {
    source: 'alabama-power',
    target: 'meta',
    relationship: 'supplies',
    description: 'Serves Meta Montgomery and Huntsville expansions.',
  },
  {
    source: 'alabama-power',
    target: 'southern-co',
    relationship: 'subsidiary_of',
  },

  // ── Pass-3 money-map additions (verified 2026-05-14) ───────────────────

  // Stargate equity breakdown ($100B initial tranche)
  {
    source: 'softbank',
    target: 'stargate',
    relationship: 'invests_in',
    description: 'SoftBank equity in Stargate: $19B of the initial $100B tranche (40% interest).',
    value_usd: 19_000_000_000,
    source_url: 'https://openai.com/index/announcing-the-stargate-project/',
  },
  {
    source: 'openai',
    target: 'stargate',
    relationship: 'invests_in',
    description: 'OpenAI equity in Stargate: $19B of the initial $100B tranche (40% interest).',
    value_usd: 19_000_000_000,
    source_url: 'https://openai.com/index/announcing-the-stargate-project/',
  },
  {
    source: 'oracle',
    target: 'stargate',
    relationship: 'invests_in',
    description: 'Oracle equity in Stargate: $7B of the initial $100B tranche.',
    value_usd: 7_000_000_000,
    source_url: 'https://openai.com/index/announcing-the-stargate-project/',
  },
  {
    source: 'mgx',
    target: 'stargate',
    relationship: 'invests_in',
    description: 'MGX equity in Stargate: $7B of the initial $100B tranche.',
    value_usd: 7_000_000_000,
    source_url: 'https://openai.com/index/announcing-the-stargate-project/',
  },

  // Stargate Abilene financing
  {
    source: 'blue-owl-real-assets',
    target: 'crusoe-energy',
    relationship: 'invests_in',
    description: 'Lead financier of Crusoe\'s $11.6B debt+equity raise for the Stargate Abilene Phase 2 campus.',
    value_usd: 11_600_000_000,
    source_url: 'https://www.datacenterdynamics.com/en/news/crusoe-secures-116bn-in-debt-and-equity-for-openais-stargate-data-center-campus-in-abilene-texas/',
  },
  {
    source: 'lancium',
    target: 'crusoe-energy',
    relationship: 'partners_with',
    description: 'Lancium owns the land + electrical infrastructure at the Crusoe Stargate Abilene campus.',
  },
  {
    source: 'mubadala',
    target: 'crusoe-energy',
    relationship: 'invests_in',
    description: 'Mubadala participant in the Dec 2024 Crusoe $600M Series D (Founders Fund lead).',
    value_usd: 600_000_000,
    source_url: 'https://www.crusoe.ai/resources/newsroom/crusoe-closes-series-d-funding',
  },

  // ADQ + ECP $25B power JV
  {
    source: 'adq',
    target: 'ecp',
    relationship: 'joint_venture',
    description: 'March 2025: $25B / 25 GW JV with Energy Capital Partners for US data-center power generation.',
    value_usd: 25_000_000_000,
    source_url: 'https://www.adq.ae/newsroom/adq-and-energy-capital-partners-to-establish-a-usd-25-billion-us-based-investment-partnership-focused-on-developing-new-power-generation-to-serve-the-growing-electricity-needs-of-data-centers/',
  },

  // AIP / Aligned acquisition ($40B)
  {
    source: 'aip',
    target: 'aligned-dc',
    relationship: 'acquired',
    description: 'AI Infrastructure Partnership (BlackRock/GIP + Microsoft + MGX + NVIDIA) led the $40B EV acquisition of Aligned (closing H1 2026).',
    value_usd: 40_000_000_000,
    source_url: 'https://www.macquarie.com/us/en/about/news/2025/macquarie-asset-management-to-lead-sale-of-aligned-data-centers-at-an-enterprise-value-of-us-40-billion.html',
  },
  {
    source: 'blackrock',
    target: 'aip',
    relationship: 'joint_venture',
    description: 'BlackRock / GIP is a founding partner of the AI Infrastructure Partnership consortium.',
  },
  {
    source: 'microsoft',
    target: 'aip',
    relationship: 'joint_venture',
  },
  {
    source: 'mgx',
    target: 'aip',
    relationship: 'joint_venture',
  },
  {
    source: 'nvidia',
    target: 'aip',
    relationship: 'joint_venture',
  },

  // Equinix xScale JV
  {
    source: 'gic',
    target: 'equinix',
    relationship: 'joint_venture',
    description: '$15B+ Equinix xScale JV (GIC 37.5% + CPPIB 37.5% + Equinix 25%).',
    value_usd: 15_000_000_000,
    source_url: 'https://www.gic.com.sg/newsroom/all/equinix-agrees-to-form-greater-than-15b-jv-to-expand-hyperscale-data-centers-in-the-u-s-and-support-growing-ai-and-cloud-innovation/',
  },
  {
    source: 'cppib',
    target: 'equinix',
    relationship: 'joint_venture',
    description: '37.5% co-investor with GIC in the $15B+ xScale JV.',
    value_usd: 15_000_000_000,
  },

  // Compass Datacenters ownership
  {
    source: 'ontario-teachers',
    target: 'compass-dc',
    relationship: 'owns',
    description: 'Joint owner with Brookfield Infrastructure (~$5.5B enterprise value, 2024 acquisition).',
    value_usd: 5_500_000_000,
    source_url: 'https://www.paulweiss.com/practices/transactional/private-equity/news/ontario-teachers-pension-plan-and-brookfield-infrastructure-to-acquire-compass-datacenters?id=47181',
  },

  // Switch take-private structure
  {
    source: 'ifm-investors',
    target: 'switch',
    relationship: 'acquired',
    description: 'Co-acquirer with DigitalBridge in the $11B 2022 take-private of Switch.',
    value_usd: 11_000_000_000,
  },
  {
    source: 'aware-super',
    target: 'switch',
    relationship: 'invests_in',
    description: '$500M post-take-private investment in Switch.',
    value_usd: 500_000_000,
    source_url: 'https://www.datacenterdynamics.com/en/news/aware-super-invests-500-million-into-switch-inc/',
  },

  // CPPIB / Calpine exit
  {
    source: 'cppib',
    target: 'constellation',
    relationship: 'invests_in',
    description: 'Net ~$1.9B in Constellation stock + ~$700M cash from the Calpine sale (CPPIB held 15.75% of Calpine since 2018).',
    value_usd: 1_900_000_000,
    source_url: 'https://www.cppinvestments.com/newsroom/cpp-investments-to-sell-stake-in-calpine-corporation/',
  },

  // xAI funding rounds
  {
    source: 'mgx',
    target: 'xai',
    relationship: 'invests_in',
    description: 'MGX participant in xAI Series C (Dec 2024 $6B round) and Series E (Jan 2026 $20B round).',
    source_url: 'https://techfundingnews.com/xai-nears-a-230b-valuation-with-20b-funding-from-nvidia-and-others-to-challenge-openai-and-anthropic/',
  },
  {
    source: 'qia',
    target: 'xai',
    relationship: 'invests_in',
    description: 'QIA participant in xAI Series C and Series E.',
  },
  {
    source: 'humain',
    target: 'xai',
    relationship: 'invests_in',
    description: 'Saudi PIF\'s HUMAIN invested $3B in xAI (2025).',
    value_usd: 3_000_000_000,
    source_url: 'https://datacentremagazine.com/news/humain-invests-us-3bn-in-xai-as-saudi-ai-data-centres-expand',
  },
  {
    source: 'nvidia',
    target: 'xai',
    relationship: 'invests_in',
    description: 'NVIDIA participant in xAI Series C and Series E.',
  },

  // Anthropic Series F (Sept 2025 — $13B at $183B post-money)
  {
    source: 'qia',
    target: 'anthropic',
    relationship: 'invests_in',
    description: 'Participant in the Sept 2025 Series F ($13B at $183B post-money).',
    source_url: 'https://www.anthropic.com/news/anthropic-raises-series-f-at-usd183b-post-money-valuation',
  },
  {
    source: 'gic',
    target: 'anthropic',
    relationship: 'invests_in',
    description: 'Participant in the Sept 2025 Series F.',
  },
  {
    source: 'ontario-teachers',
    target: 'anthropic',
    relationship: 'invests_in',
    description: 'Participant in the Sept 2025 Series F.',
  },
  {
    source: 'blackrock',
    target: 'anthropic',
    relationship: 'invests_in',
    description: 'Participant in the Sept 2025 Series F.',
  },
  {
    source: 'blackstone',
    target: 'anthropic',
    relationship: 'invests_in',
    description: 'Participant in the Sept 2025 Series F.',
  },

  // CoreWeave debt facilities
  {
    source: 'blackstone',
    target: 'coreweave',
    relationship: 'invests_in',
    description: 'Lead arranger of $7.5B debt facility (May 2024) and $2.3B facility (Aug 2023).',
    value_usd: 7_500_000_000,
    source_url: 'https://www.blackstone.com/news/press/coreweave-secures-7-5-billion-debt-financing-facility-led-by-blackstone-and-magnetar/',
  },

  // Vantage equity ($9.2B June 2024)
  {
    source: 'digitalbridge',
    target: 'vantage',
    relationship: 'invests_in',
    description: 'Lead of the $9.2B June 2024 equity raise (upsized from $2.8B); $13B total incremental funding in 2024.',
    value_usd: 9_200_000_000,
    source_url: 'https://www.digitalbridge.com/news/2024-06-13-vantage-data-centers-completes-92-billion-equity-investment-led-by-digitalbridge-and-silver-lake',
  },

  // Talen-AWS restructured PPA
  {
    source: 'talen',
    target: 'amazon',
    relationship: 'supplies',
    description: 'Restructured as 17-year, $18B grid-connected retail PPA (up to 1.92 GW from Susquehanna) after FERC twice rejected behind-the-meter co-location ISA (Nov 2024 + Apr 2025).',
    value_usd: 18_000_000_000,
    source_url: 'https://www.powermag.com/talen-amazon-launch-18b-nuclear-ppa-a-grid-connected-ipp-model-for-the-data-center-era/',
  },

  // IREN-Microsoft and Hut 8 hyperscaler deals
  {
    source: 'iren',
    target: 'microsoft',
    relationship: 'supplies',
    description: '$9.7B AI cloud agreement (Sweetwater, TX). NVIDIA holds a $2.1B warrant on IREN as part of a 5 GW pipeline.',
    value_usd: 9_700_000_000,
    source_url: 'https://iren.com/resources/blog/iren-signs97-billion-agreement-with-microsoft-to-deploy-ai-cloud-infrastructure',
  },
  {
    source: 'hut-8',
    target: 'fluidstack',
    relationship: 'supplies',
    description: '15-year, $7.0B Fluidstack lease at the River Bend LA campus (245 MW IT; 330 MW utility).',
    value_usd: 7_000_000_000,
    source_url: 'https://www.prnewswire.com/news-releases/hut-8-signs-15-year-245-mw-ai-data-center-lease-at-river-bend-campus-with-total-contract-value-of-7-0-billion-302644600.html',
  },

  // Federal contracts
  {
    source: 'amazon',
    target: 'ferc',
    relationship: 'partners_with',
    description: 'AWS holds a slice of the DOD JWCC $9B cloud contract (Dec 2022, 5.5-year ceiling).',
    value_usd: 9_000_000_000,
    source_url: 'https://defensescoop.com/2022/12/07/pentagon-awards-aws-google-microsoft-oracle-spots-on-joint-warfighting-cloud-capability-solicitation/',
  },
  {
    source: 'microsoft',
    target: 'ferc',
    relationship: 'partners_with',
    description: 'Microsoft Azure holds a slice of DOD JWCC.',
  },
  {
    source: 'google',
    target: 'ferc',
    relationship: 'partners_with',
    description: 'Google Cloud holds a slice of DOD JWCC.',
  },
  {
    source: 'oracle',
    target: 'ferc',
    relationship: 'partners_with',
    description: 'Oracle Cloud holds a slice of DOD JWCC.',
  },
  {
    source: 'constellation',
    target: 'microsoft',
    relationship: 'partners_with',
    description: '$1B DOE Loan Programs Office loan guarantee (Nov 18, 2025) financing the Crane (TMI-1) restart that supplies Microsoft\'s 20-yr PPA.',
    value_usd: 1_000_000_000,
    source_url: 'https://www.nucnet.org/news/constellation-secures-usd1-billion-federal-loann-for-three-mile-island-restart-11-3-2025',
  },

  // ── Pass-5 enrichment edges ──────────────────────────────────────────

  // Blackstone → Tallgrass → Crusoe Project Jade
  {
    source: 'blackstone-infrastructure',
    target: 'tallgrass-energy',
    relationship: 'owns',
    description: 'Blackstone Infrastructure majority-owns Tallgrass Energy.',
    source_url: 'https://www.datacenterdynamics.com/en/news/crusoe-gets-go-ahead-for-18gw-data-center-campus-and-power-plant-in-cheyenne-wyoming/',
  },
  {
    source: 'tallgrass-energy',
    target: 'crusoe-energy',
    relationship: 'joint_venture',
    description: '~$7B committed to BFC Power + Cheyenne Power Hub gas generation for Project Jade.',
    value_usd: 7_000_000_000,
    source_url: 'https://newprojectmedia.com/origination-crusoe-tallgrass-receive-laramie-county-wy-approvals-for-usd-50bn-2-7-gw-data-center-and-power-plant-project/',
  },

  // Project Sail / Prologis chain
  {
    source: 'prologis',
    target: 'atlas-development',
    relationship: 'partners_with',
    description: 'Prologis under contract to take the 832-acre Coweta GA site originated by Atlas Development.',
    source_url: 'https://www.ajc.com/news/2025/05/a-new-group-steps-in-to-develop-17b-project-sail-data-center-near-atlanta/',
  },
  {
    source: 'georgialink-public-affairs',
    target: 'atlas-development',
    relationship: 'lobbies_for',
    description: 'Arthur Edge IV of GeorgiaLink represented Atlas Development on Project Sail at zoning.',
    source_url: 'https://www.desmog.com/2025/08/18/arthur-edge-data-center-lobbyists-project-sail-sargent-coweta-county-georgia/',
  },

  // PowerHouse VA
  {
    source: 'american-real-estate-partners',
    target: 'powerhouse-data-centers',
    relationship: 'owns',
    description: 'PowerHouse Data Centers is wholly owned by AREP.',
    source_url: 'https://www.americanrepartners.com/property-types/data-centers',
  },
  {
    source: 'harrison-street',
    target: 'powerhouse-data-centers',
    relationship: 'invests_in',
    description: '~$1B JV to build out six PowerHouse data centers across Northern Virginia.',
    value_usd: 1_000_000_000,
    source_url: 'https://www.harrisonst.com/wp-content/uploads/2024/02/PowerHouse-95.pdf',
  },

  // CleanArc Caroline VA cap table
  {
    source: '547-energy',
    target: 'cleanarc',
    relationship: 'invests_in',
    description: 'Founding investor in CleanArc.',
  },
  {
    source: 'snowhawk',
    target: 'cleanarc',
    relationship: 'owns',
    description: 'Majority owner of CleanArc after Sept 2025 investment.',
    source_url: 'https://www.datacenterdynamics.com/en/news/cleanarc-gets-green-light-for-600mw-data-center-campus-in-caroline-county-virginia/',
  },
  {
    source: 'townsend-group',
    target: 'cleanarc',
    relationship: 'invests_in',
    description: 'Real-assets manager; follow-on investor.',
  },
  {
    source: 'nuveen',
    target: 'cleanarc',
    relationship: 'invests_in',
    description: 'TIAA asset manager; follow-on investor.',
  },

  // Coatue / Fluidstack / Google / Anthropic structure
  {
    source: 'coatue-management',
    target: 'next-frontier',
    relationship: 'owns',
    description: 'Coatue launched Next Frontier as its data-center land-development vehicle.',
    source_url: 'https://techcrunch.com/2026/05/01/coatue-has-a-plan-to-buy-up-land-for-data-centers-possibly-for-anthropic/',
  },
  {
    source: 'next-frontier',
    target: 'fluidstack',
    relationship: 'joint_venture',
    description: 'JV building the 430 MW New Lebanon IN campus.',
    source_url: 'https://www.datacenterdynamics.com/en/news/coatue-sets-up-data-center-venture-partners-with-fluidstack-for-430mw-campus-in-indiana/',
  },
  {
    source: 'google',
    target: 'fluidstack',
    relationship: 'partners_with',
    description: 'Google guarantees Fluidstack\'s leases — assumes the lease or pays a termination fee if Fluidstack defaults — at New Lebanon and other Fluidstack sites.',
    source_url: 'https://www.datacenterdynamics.com/en/news/coatue-sets-up-data-center-venture-partners-with-fluidstack-for-430mw-campus-in-indiana/',
  },

  // Saudi PIF → Humain → Global AI
  {
    source: 'saudi-pif',
    target: 'humain',
    relationship: 'owns',
    description: 'PIF launched Humain May 2025 and wholly owns it.',
    source_url: 'https://www.pif.gov.sa/en/news-and-insights/press-releases/2025/hrh-crown-prince-launches-humain-as-global-ai-powerhouse/',
  },
  {
    source: 'humain',
    target: 'global-ai',
    relationship: 'joint_venture',
    description: 'Humain to deploy compute capacity in Global AI US facilities including Windsor CO.',
    source_url: 'https://www.datacenterdynamics.com/en/news/global-ai-set-to-develop-data-center-outside-denver-colorado/',
  },
  {
    source: 'humain',
    target: 'blackstone',
    relationship: 'joint_venture',
    description: '$3B data-center venture announced in parallel with the Global AI partnership.',
    value_usd: 3_000_000_000,
  },

  // Prometheus / Oklo / In-Q-Tel
  {
    source: 'oklo',
    target: 'prometheus-hyperscale',
    relationship: 'supplies',
    description: '20-year LOI for ~100 MW from Aurora fast-fission reactors covering all Prometheus sites.',
    source_url: 'https://www.prometheushyperscale.com/news/oklo-partners-with-wyoming-hyperscale-to-deliver-100-megawatts-to-its-data-centers',
  },
  {
    source: 'in-q-tel',
    target: 'prometheus-hyperscale',
    relationship: 'invests_in',
    description: 'CIA-affiliated strategic VC; disclosed backer.',
    source_url: 'https://www.datacenterdynamics.com/en/analysis/prometheus-hyperscale-in-harmony-with-nature/',
  },
  {
    source: 'lumen-technologies',
    target: 'prometheus-hyperscale',
    relationship: 'supplies',
    description: 'Fiber and connectivity across Prometheus sites.',
    source_url: 'https://www.prnewswire.com/news-releases/lumen-partners-with-prometheus-hyperscale-to-enhance-connectivity-for-sustainable-ai-driven-data-centers-302333590.html',
  },
  {
    source: 'engie',
    target: 'prometheus-hyperscale',
    relationship: 'supplies',
    description: 'Power partner for the Prometheus portfolio.',
  },
  {
    source: 'conduit-power',
    target: 'prometheus-hyperscale',
    relationship: 'supplies',
    description: 'Power partner for the Prometheus portfolio.',
  },

  // CoreSite parent
  {
    source: 'american-tower',
    target: 'coresite',
    relationship: 'owns',
    description: 'American Tower acquired CoreSite in 2021 for $10.1B.',
    value_usd: 10_100_000_000,
  },

  // Centra / Columbia Capital
  {
    source: 'columbia-capital',
    target: 'centra',
    relationship: 'invests_in',
    description: '$230M growth round to fund Reno (Keystone Ave) + Minneapolis build-outs.',
    value_usd: 230_000_000,
    source_url: 'https://www.datacenterdynamics.com/en/news/columbia-capital-leads-230m-centra-investment-for-data-center-build-outs-in-reno-and-minneapolis/',
  },

  // Carlyle / Copia Power
  {
    source: 'carlyle',
    target: 'copia-power',
    relationship: 'invests_in',
    description: 'Carlyle provides project equity and parent guarantees for the $11B Monarch Lyon County development.',
    source_url: 'https://newprojectmedia.com/origination-copia-power-plans-usd-11bn-data-center-campus-with-carlyle-backing-in-lyon-county-nv/',
  },

  // Beale / Blue Owl
  {
    source: 'blue-owl',
    target: 'beale-infrastructure',
    relationship: 'owns',
    description: 'Beale Infrastructure is owned by Blue Owl Capital.',
    source_url: 'https://www.datacenterdynamics.com/en/news/amazon-backs-out-of-project-blue-data-center-campus-in-arizona-report/',
  },

  // US Army / Carlyle Fort Bliss
  {
    source: 'carlyle',
    target: 'us-army',
    relationship: 'contracted_by',
    description: 'Conditional Army selection to develop the Fort Bliss 3 GW hyperscale data center on ~1,384 acres.',
    source_url: 'https://www.army.mil/article/291360/army_reaches_conditional_agreement_with_private_industry_for_hyperscaled_data_centers',
  },
];
