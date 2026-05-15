import type { Event } from '@/lib/types';

// Every event below carries a `source_url` to a primary or reputable
// secondary source. Last full verification pass: 2026-05-14.
// Where future-dated hearings are listed, they were verified as scheduled
// at the time of writing — local agencies move calendars, so re-check the
// source URL before publishing or acting on a date.

export const EVENTS: Event[] = [
  // ── Resolved / historical (verified) ──────────────────────────────

  {
    slug: 'pwc-digital-gateway-voided-2025-08',
    title: 'PW Circuit Court Voids Digital Gateway Rezoning',
    type: 'lawsuit',
    status: 'resolved_favorable',
    date: '2025-08-07',
    state: 'VA',
    location: 'Manassas, VA',
    jurisdiction: 'Prince William Circuit Court (Judge Irving)',
    description:
      'Circuit Court invalidated the 2023 PW Digital Gateway rezoning ordinances. Affirmed unanimously by VA Court of Appeals (Judge Raphael) March 31, 2026; Compass Datacenters dropped further appeal in April 2026.',
    issue_category: 'zoning',
    source_url:
      'https://valawyersweekly.com/2026/04/01/virginia-court-upholds-block-prince-william-digital-gateway/',
    data_center_slug: 'microsoft-prince-william-va',
  },

  {
    slug: 'tucson-council-rejects-project-blue-2025-08',
    title: 'Tucson City Council Rejects Project Blue 7-0',
    type: 'zoning_vote',
    status: 'resolved_favorable',
    date: '2025-08-06',
    state: 'AZ',
    location: 'Tucson, AZ',
    jurisdiction: 'Tucson City Council',
    description:
      'Council unanimously rejected the Amazon-linked Project Blue data-center proposal after intense community opposition. Amazon withdrew December 2025.',
    issue_category: 'zoning + water',
    source_url:
      'https://azluminaria.org/2025/08/06/tucson-city-council-rejects-project-blue-amid-intense-community-pressure/',
  },

  {
    slug: 'marana-project-blue-referendum-dead-2026-05',
    title: 'Marana AZ: Project Blue Referendum Petitions Rejected',
    type: 'project_withdrawal',
    status: 'resolved_unfavorable',
    date: '2026-05-04',
    state: 'AZ',
    location: 'Marana, AZ',
    jurisdiction: 'Town of Marana / Pima County Superior Court',
    description:
      'Town clerk rejected the 2,800 signatures filed Feb 2026; a Pima County judge upheld the rejection on April 13 and again May 4, 2026. Referendum will not appear on the ballot.',
    issue_category: 'zoning + water',
    source_url:
      'https://www.tucsonsentinel.com/local/report/020626_data_center_referendum/data-center-opponents-submit-signatures-voter-referendum-marana/',
  },

  {
    slug: 'ferc-rejects-talen-aws-isa-2024-11',
    title: 'FERC Rejects Talen-AWS Amended Interconnection Service Agreement',
    type: 'lawsuit',
    status: 'resolved_unfavorable',
    date: '2024-11-01',
    state: 'PA',
    location: 'Washington, DC',
    jurisdiction: 'Federal Energy Regulatory Commission',
    description:
      'FERC rejected (2-1) the amended ISA that would have let AWS draw up to 480 MW behind-the-meter from Talen\'s Susquehanna nuclear plant. FERC denied rehearing March 2026; Talen pursuing Fifth Circuit appeal.',
    issue_category: 'energy',
    source_url:
      'https://www.utilitydive.com/news/ferc-interconnection-isa-talen-amazon-data-center-susquehanna-exelon/731841/',
    data_center_slug: 'aws-cumulus-susquehanna-pa',
  },

  {
    slug: 'lpsc-meta-hyperion-3-plants-approved',
    title: 'LPSC Approves 3 Entergy Gas Plants for Meta Hyperion (Docket U-37425)',
    type: 'hearing',
    status: 'resolved_unfavorable',
    date: '2025-08-15',
    state: 'LA',
    location: 'Baton Rouge, LA',
    jurisdiction: 'Louisiana Public Service Commission',
    description:
      'LPSC approved Entergy\'s settlement in Docket U-37425 covering three combined-cycle units (~2.26 GW) to serve Meta\'s Hyperion campus.',
    issue_category: 'energy',
    source_url:
      'https://www.datacenterdynamics.com/en/news/entergy-obtains-approval-to-construct-three-gas-facilities-to-serve-metas-2gw-data-center-in-louisiana/',
    data_center_slug: 'meta-richland-parish-la',
  },

  {
    slug: 'lpsc-meta2-7-plants-fast-track-2026-04',
    title: 'LPSC Fast-Tracks 7 Additional Gas Plants for Second Meta Site',
    type: 'hearing',
    status: 'pending',
    date: '2026-04-15',
    state: 'LA',
    location: 'Baton Rouge, LA',
    jurisdiction: 'Louisiana Public Service Commission',
    description:
      'Separate proceeding from U-37425. Commission voted 4-1 on April 15, 2026 to fast-track Entergy\'s ~$21.37B proposal for 7 more gas plants tied to a second Meta data center in Richland Parish, under the PSC "Lightning Initiative." Final resource-plan vote expected December 2026.',
    issue_category: 'energy',
    source_url:
      'https://www.krvs.org/louisiana-news/2026-04-21/advocates-cite-lack-of-transparency-rising-costs-as-regulators-fast-track-second-meta-data-center',
    data_center_slug: 'meta-richland-parish-la',
  },

  {
    slug: 'shelby-county-xai-permit-naacp-appeal',
    title: 'NAACP Appeals Shelby County xAI Air Permit (15-turbine)',
    type: 'lawsuit',
    status: 'pending',
    date: '2025-07-22',
    state: 'TN',
    location: 'Memphis, TN',
    jurisdiction: 'Shelby County Health Department / appeal',
    description:
      'After 2,000+ public comments, SCHD issued an air permit for 15 xAI turbines. NAACP, SELC, and others appealed administratively.',
    issue_category: 'air quality',
    source_url:
      'https://tennesseelookout.com/briefs/naacp-others-appeal-xai-turbine-permits-for-memphis-data-center/',
    data_center_slug: 'xai-colossus-memphis-tn',
  },

  {
    slug: 'xai-southaven-ms-clean-air-act-suit',
    title: 'NAACP v. xAI Federal Clean Air Act Lawsuit (Southaven, MS)',
    type: 'lawsuit',
    status: 'pending',
    date: '2025-08-06',
    state: 'MS',
    location: 'Southaven, MS',
    jurisdiction: 'US District Court, N.D. Miss.',
    description:
      'NAACP, with SELC and Earthjustice as counsel, sued xAI over unpermitted gas turbines powering the Colossus 2 expansion in Southaven, MS — separate from the Tennessee permit appeal. May 6, 2026 motion for preliminary injunction pending.',
    issue_category: 'air quality',
    source_url:
      'https://www.selc.org/press-release/civil-rights-group-sues-xai-for-illegal-pollution-from-data-center-power-plant/',
    data_center_slug: 'xai-colossus-memphis-tn',
  },

  {
    slug: 'newton-county-ga-30-day-moratorium-2026-02',
    title: 'Newton County GA Enacted 30-Day Data-Center Moratorium',
    type: 'moratorium',
    status: 'resolved_mixed',
    date: '2026-02-04',
    state: 'GA',
    location: 'Covington, GA',
    jurisdiction: 'Newton County BoC',
    description:
      '30-day emergency moratorium; expired Spring 2026. Statewide GA HB 1012 (with a July 1, 2026 cutoff) was introduced but did not pass the 2026 session.',
    issue_category: 'zoning',
    source_url:
      'https://www.covnews.com/news/county/newton-county-enacts-moratoriums-data-centers-convenience-stores/',
    data_center_slug: 'meta-stanton-springs-ga',
  },

  {
    slug: 'reno-nv-pending-moratorium-2026-05',
    title: 'City of Reno Passes Pending Data-Center Moratorium (6-1)',
    type: 'moratorium',
    status: 'pending',
    date: '2026-05-14',
    state: 'NV',
    location: 'Reno, NV',
    jurisdiction: 'Reno City Council',
    description:
      'Reno council passed a pending moratorium 6-1 on conditional-use applications for new data centers; final vote scheduled June 1, 2026. Tahoe-Reno Industrial Center (Storey County) remains open.',
    issue_category: 'zoning + water',
    source_url:
      'https://www.kolotv.com/2026/05/15/reno-city-council-approves-pending-moratorium-data-centers/',
  },

  {
    slug: 'lordstown-moratorium-vote-2025',
    title: 'Lordstown OH 180-Day Data-Center Moratorium',
    type: 'moratorium',
    status: 'pending',
    date: '2025-04-15',
    state: 'OH',
    location: 'Lordstown, OH',
    jurisdiction: 'Village of Lordstown Council',
    description:
      'Council unanimously enacted a 180-day moratorium after an outright ban was challenged; developer Bristolville 25 LLC petitioned the Ohio Supreme Court Nov 2025 seeking to compel processing of its 1.65M-sq-ft / $3.6B application. Decision pending.',
    issue_category: 'zoning',
    source_url:
      'https://www.wfmj.com/news/local-news/lordstown/lordstown-village-council-plans-to-extend-data-center-ban-another-180-days/article_ac285afd-175d-469e-a1c9-a37f13c4dc39.html',
    data_center_slug: 'stargate-lordstown-oh',
  },

  {
    slug: 'fayetteville-ga-data-center-ban-2026',
    title: 'City of Fayetteville GA Bans New Data Centers (Ord. 26-O-12)',
    type: 'zoning_vote',
    status: 'resolved_favorable',
    date: '2026-03-19',
    state: 'GA',
    location: 'Fayetteville, GA',
    jurisdiction: 'City of Fayetteville',
    description:
      'Council adopted Ordinance 26-O-12 banning new data centers citywide; existing QTS Fayetteville (Microsoft Fairwater Atlanta) site grandfathered.',
    issue_category: 'zoning',
    source_url: 'https://www.fayetteville-ga.gov/746/Data-Center-Discussion',
    data_center_slug: 'microsoft-fairwater-atlanta-ga',
  },

  {
    slug: 'mt-pleasant-microsoft-tax-deal-2023',
    title: 'Mt Pleasant Village Board Approves Microsoft Tax Agreement',
    type: 'zoning_vote',
    status: 'resolved_unfavorable',
    date: '2023-04-04',
    state: 'WI',
    location: 'Mount Pleasant, WI',
    jurisdiction: 'Village of Mount Pleasant',
    description:
      'Village Board approved a developer\'s agreement and TID 5 expansion allowing Microsoft to recoup up to 42% of property taxes (cap $5M/yr) on the former Foxconn land.',
    issue_category: 'subsidies',
    source_url:
      'https://www.datacenterdynamics.com/en/news/mount-pleasant-village-board-votes-in-favor-of-microsofts-1bn-wisconsin-data-center/',
    data_center_slug: 'microsoft-fairwater-mt-pleasant-wi',
  },

  // ── Legislation (verified) ────────────────────────────────────────

  {
    slug: 'ohio-hb15-enacted-2025',
    title: 'Ohio HB 15 Enacted: Repeals HB 6 Subsidies, Adds OPSB Gas Review',
    type: 'legislation',
    status: 'resolved_favorable',
    date: '2025-05-15',
    state: 'OH',
    location: 'Columbus, OH',
    jurisdiction: 'Ohio General Assembly',
    description:
      'HB 15 ends HB 6 utility subsidies, bars regulated utilities from owning generation, creates a 45-day OPSB review for behind-the-meter gas projects, and slashes the generation-equipment assessment rate to 7%.',
    issue_category: 'energy + legislation',
    source_url:
      'https://www.vorys.com/publication-ohio-passes-bill-to-encourage-energy-infrastructure-development',
  },

  {
    slug: 'va-hb1601-vetoed-2025',
    title: 'VA HB 1601 / SB 1449 Vetoed by Gov. Youngkin',
    type: 'legislation',
    status: 'resolved_unfavorable',
    date: '2025-05-02',
    state: 'VA',
    location: 'Richmond, VA',
    jurisdiction: 'Virginia General Assembly',
    description:
      'HB 1601 (site-impact assessments for high-energy-use facilities) passed both chambers but was vetoed; companion SB 1449 also vetoed. SB 960 (SCC cost-allocation directive) remains separate and live.',
    issue_category: 'legislation',
    source_url:
      'https://www.mcguirewoods.com/client-resources/alerts/2025/5/virginia-governor-vetoes-data-center-bill/',
  },

  // ── Upcoming (verified scheduled, May 2026 onwards) ───────────────

  {
    slug: 'cheyenne-public-services-committee-moratorium-2026-05-18',
    title: 'Cheyenne Public Services Committee Considers Data-Center Moratorium',
    type: 'hearing',
    status: 'upcoming',
    date: '2026-05-18',
    state: 'WY',
    location: 'Cheyenne, WY (Municipal Building)',
    jurisdiction: 'Cheyenne City Council, Public Services Committee',
    description:
      'Councilman Mark Moody\'s proposed 12-month moratorium ordinance on new data-center construction goes to committee at noon, prior to full council readings. Cheyenne has 70+ projects in the pipeline.',
    issue_category: 'moratorium / land use',
    source_url:
      'https://www.wyomingpublicmedia.org/wyoming-economy/2026-05-14/cheyenne-city-council-to-consider-a-pause-on-new-data-centers',
  },

  {
    slug: 'boone-county-in-moratorium-vote-2026-05-18',
    title: 'Boone County IN: Commissioners Vote on 1-Year Data-Center Moratorium',
    type: 'moratorium',
    status: 'upcoming',
    date: '2026-05-18',
    state: 'IN',
    location: 'Boone County (unincorporated)',
    jurisdiction: 'Boone County Board of Commissioners',
    description:
      'Following the Area Plan Commission\'s 5/6 favorable recommendation, Commissioners take up a one-year moratorium on data centers in unincorporated Boone County while comprehensive-plan work continues. Meta\'s LEAP-District site in Lebanon city is unaffected.',
    issue_category: 'moratorium / land use',
    source_url:
      'https://www.youarecurrent.com/2026/05/13/boone-county-considering-data-center-moratorium/',
    data_center_slug: 'meta-lebanon-in',
  },

  {
    slug: 'stlouis-data-center-zoning-public-hearing-2026-05-18',
    title: 'St. Louis: Second Public Hearing on Data-Center Zoning Framework',
    type: 'public_comment',
    status: 'upcoming',
    date: '2026-05-18',
    state: 'MO',
    location: 'St. Louis (City Hall, Kennedy Room)',
    jurisdiction: 'City of St. Louis Planning and Urban Design Agency',
    description:
      '5:30pm; second of two hearings on the updated data-center regulation framework. Updated framework requires community-benefits agreements for large projects.',
    issue_category: 'zoning + community benefits',
    source_url:
      'https://www.stlouis-mo.gov/government/departments/mayor/news/updated-data-center-regulations.cfm',
  },

  {
    slug: 'cheyenne-city-council-moratorium-2nd-reading-2026-05-26',
    title: 'Cheyenne City Council 2nd Reading: Data-Center Moratorium',
    type: 'moratorium',
    status: 'upcoming',
    date: '2026-05-26',
    state: 'WY',
    location: 'Cheyenne, WY (Council Chamber)',
    jurisdiction: 'Cheyenne City Council',
    description:
      'Second hearing on the moratorium ordinance at 6pm, following the May 18 Public Services Committee review.',
    issue_category: 'moratorium / land use',
    source_url:
      'https://www.wyomingpublicmedia.org/wyoming-economy/2026-05-14/cheyenne-city-council-to-consider-a-pause-on-new-data-centers',
  },

  {
    slug: 'ga-psc-storm-cost-recovery-vote-2026-05-28',
    title: 'GA PSC: Vote on Georgia Power Storm Cost Recovery (DC cost-allocation context)',
    type: 'hearing',
    status: 'upcoming',
    date: '2026-05-28',
    state: 'GA',
    location: 'Atlanta, GA',
    jurisdiction: 'Georgia Public Service Commission',
    description:
      'PSC vote following May 13-14 hearings that surfaced findings on whether data centers are paying their fair share for fuel and grid costs.',
    issue_category: 'energy / cost allocation',
    source_url: 'https://www.aol.com/news/georgia-power-hearings-psc-reveal-205346602.html',
  },

  {
    slug: 'charles-county-md-data-center-zta-2026-06-01',
    title: 'Charles County MD: Planning Commission Hearing on Data-Center ZTA #25-187',
    type: 'zoning_vote',
    status: 'upcoming',
    date: '2026-06-01',
    state: 'MD',
    location: 'La Plata, MD',
    jurisdiction: 'Charles County Planning Commission',
    description:
      'Revised zoning text amendment limiting data centers to Heavy Industrial zoning, banning potable-water cooling, and requiring self-generated power. Earlier draft was recommended for denial 3/2.',
    issue_category: 'zoning + water',
    source_url:
      'https://thebaynet.com/charles-county-data-center-zoning-amendment-revised-heads-back-to-public-hearing-june-1/',
  },

  {
    slug: 'reno-final-moratorium-vote-2026-06-01',
    title: 'Reno NV: Council Final Vote on Data-Center Moratorium',
    type: 'moratorium',
    status: 'upcoming',
    date: '2026-06-01',
    state: 'NV',
    location: 'Reno, NV',
    jurisdiction: 'Reno City Council',
    description: 'Final vote on duration and scope of moratorium on conditional-use applications.',
    issue_category: 'moratorium / land use',
    source_url:
      'https://www.kolotv.com/2026/05/15/reno-city-council-approves-pending-moratorium-data-centers/',
  },

  {
    slug: 'shawnee-county-ks-data-center-zoning-2026-06-11',
    title: 'Shawnee County KS: Commission Vote on Data-Center CUP Zoning',
    type: 'zoning_vote',
    status: 'upcoming',
    date: '2026-06-11',
    state: 'KS',
    location: 'Topeka / Shawnee County, KS',
    jurisdiction: 'Shawnee County Board of Commissioners',
    description:
      'Vote on Planning Commission\'s 6-1 recommendation requiring CUPs for data centers and energy storage in RA-1, RR-1, I-1, I-2 zones; no applications accepted before Jan 1, 2027.',
    issue_category: 'zoning',
    source_url:
      'https://www.wibw.com/2026/05/12/shawnee-county-planning-commission-recommends-zoning-changes-data-centers/',
  },

  {
    slug: 'montgomery-county-md-data-center-moratorium-2026-06-16',
    title: 'Montgomery County MD: Council Hearing on Data-Center Moratorium Bills',
    type: 'hearing',
    status: 'upcoming',
    date: '2026-06-16',
    state: 'MD',
    location: 'Rockville, MD (Council Office Building)',
    jurisdiction: 'Montgomery County Council',
    description:
      '1:30pm public hearing on Expedited Bill 19-26 (2-year moratorium, Jawando) and a companion 6-month moratorium bill (Glass). Includes the 360 MW former-coal-plant site in Dickerson. Sign-up to testify deadline: June 15, 2pm.',
    issue_category: 'moratorium / land use',
    source_url:
      'https://www.montgomerycountymd.gov/news/montgomery-county-council-hold-public-hearings-june-9-16-2026',
  },

  {
    slug: 'front-royal-data-center-zoning-2026-06-22',
    title: 'Front Royal VA: Public Hearing on Data-Center Zoning Text Amendment',
    type: 'zoning_vote',
    status: 'upcoming',
    date: '2026-06-22',
    state: 'VA',
    location: 'Front Royal, VA (Warren County)',
    jurisdiction: 'Front Royal Town Council',
    description:
      'Hearing on a zoning text amendment defining data centers and adding performance standards (lot size, height, vibration, heat, waste, noise) for the I-2 district, ahead of July 1 enactment of VA HB 153.',
    issue_category: 'zoning + noise',
    source_url:
      'https://www.nvdaily.com/nvdaily/public-hearing-on-data-centers-set-for-june-22/article_878664ae-03a5-5fb2-bde0-164af4250307.html',
  },

  {
    slug: 'ferc-crane-restart-decision-2026',
    title: 'FERC Decision on Constellation Crane (TMI-1) Restart Interconnection',
    type: 'other',
    status: 'pending',
    date: '2026-06-15',
    state: 'PA',
    location: 'Washington, DC',
    jurisdiction: 'Federal Energy Regulatory Commission',
    description:
      'Constellation executives expect FERC decision on Crane Clean Energy Center restart in June or July 2026. Constellation sought FERC help April 2026.',
    issue_category: 'energy / nuclear',
    source_url:
      'https://www.ans.org/news/2026-05-13/article-8026/ferc-decision-on-crane-restart-coming-in-june-or-july-constellation-execs-say/',
    data_center_slug: 'microsoft-crane-tmi-pa',
  },

  {
    slug: 'va-sct-digital-gateway-writ-panel-2026-06',
    title: 'VA Supreme Court Writ Panel: Digital Gateway Appeal',
    type: 'lawsuit',
    status: 'upcoming',
    date: '2026-06-15',
    state: 'VA',
    location: 'Richmond, VA',
    jurisdiction: 'Supreme Court of Virginia (3-justice writ panel)',
    description:
      'Three-justice writ panel will hear 20-minute arguments from QTS in late May / early June on whether to grant cert review of the VA Court of Appeals\' 3/31/2026 ruling cancelling the Digital Gateway rezoning. Plaintiffs\' opposition due May 21.',
    issue_category: 'zoning / litigation',
    source_url:
      'https://wtop.com/prince-william-county/2026/05/whats-next-for-the-digital-gateway-data-center-appeal-to-the-virginia-supreme-court/',
    data_center_slug: 'microsoft-prince-william-va',
  },

  {
    slug: 'pa-puc-ppl-sugarloaf-transmission-2026-07-10',
    title: 'PA PUC: PPL Sugarloaf 500/230kV Transmission Hearing',
    type: 'hearing',
    status: 'upcoming',
    date: '2026-07-10',
    state: 'PA',
    location: 'Telephonic (PA PUC)',
    jurisdiction: 'Pennsylvania Public Utility Commission',
    description:
      'PUC-scheduled hearing on PPL\'s condemnation of 30 properties for the Sugarloaf transmission line to serve data centers in Luzerne County.',
    issue_category: 'energy / transmission / eminent domain',
    source_url:
      'http://paenvironmentdaily.blogspot.com/2026/05/public-utility-commission-sets-july-10.html',
    data_center_slug: 'aws-cumulus-susquehanna-pa',
  },

  {
    slug: 'nmed-project-jupiter-air-permit-2026-07-21',
    title: 'NMED Final-Decision Deadline: Project Jupiter Air Permits',
    type: 'public_comment',
    status: 'pending',
    date: '2026-07-21',
    state: 'NM',
    location: 'Doña Ana County, NM',
    jurisdiction: 'New Mexico Environment Department',
    description:
      'After 7,000+ comments forced a formal hearing, NMED delayed its air-permit decision deadline from April 22 to July 21, 2026. Hearing officer to set exact hearing date in Doña Ana County for twin gas-fired plants.',
    issue_category: 'air quality / energy',
    source_url:
      'https://sourcenm.com/briefs/nm-environment-officials-will-hold-public-hearing-on-project-jupiter-air-permits-push-back-decision/',
    data_center_slug: 'stargate-dona-ana-nm',
  },

  {
    slug: 'loudoun-phase-2-planning-commission-2026-07',
    title: 'Loudoun County: Phase 2 Data Center Standards — Planning Commission Hearing',
    type: 'public_comment',
    status: 'upcoming',
    date: '2026-07-15',
    state: 'VA',
    location: 'Leesburg, VA',
    jurisdiction: 'Loudoun County Planning Commission',
    description:
      'Draft Phase 2 standards (microgrids, backup generation, substation policy, noise, height) presented to BoS in May 2026 head to Planning Commission in July. Final BoS action targeted December 2026.',
    issue_category: 'zoning + energy + noise',
    source_url: 'https://www.loudoun.gov/6222/Phase-2-Data-Center-Standards-Locations',
    data_center_slug: 'aws-loudoun-va',
  },

  {
    slug: 'iurc-data-center-working-group-report-2026-10',
    title: 'IURC: Data-Center Demand Working-Group Report Due',
    type: 'legislation',
    status: 'upcoming',
    date: '2026-10-31',
    state: 'IN',
    location: 'Indianapolis, IN',
    jurisdiction: 'Indiana Utility Regulatory Commission',
    description:
      'Statutorily required IURC working group must report future electricity-demand estimates from data centers and policy recommendations to the General Assembly by Oct 31, 2026.',
    issue_category: 'energy / planning',
    source_url: 'https://www.in.gov/iurc/',
  },

  {
    slug: 'aes-indiana-iurc-google-monrovia-2026-09',
    title: 'IURC: AES Indiana / Google Monrovia HEA 1007 Order',
    type: 'hearing',
    status: 'pending',
    date: '2026-09-15',
    state: 'IN',
    location: 'Indianapolis, IN',
    jurisdiction: 'Indiana Utility Regulatory Commission',
    description:
      'AES Indiana filed 4/22/2026 under HEA 1007 for service to Google\'s Monrovia data center; IURC order expected September 2026.',
    issue_category: 'energy / cost allocation',
    source_url: 'https://www.aesindiana.com/data-centers',
  },

  {
    slug: 'lpsc-meta-2-final-vote-2026-12',
    title: 'LA PSC: Final Vote on Meta-2 / 7-Plant Resource Plan',
    type: 'hearing',
    status: 'upcoming',
    date: '2026-12-15',
    state: 'LA',
    location: 'Baton Rouge, LA',
    jurisdiction: 'Louisiana Public Service Commission',
    description:
      'Final PSC vote on Entergy\'s $21.37B / 7-gas-plant resource plan for the second Meta Richland Parish data center. Fast-tracked April 2026 under "Lightning Initiative."',
    issue_category: 'energy / cost allocation',
    source_url:
      'https://www.krvs.org/louisiana-news/2026-04-21/advocates-cite-lack-of-transparency-rising-costs-as-regulators-fast-track-second-meta-data-center',
    data_center_slug: 'meta-richland-parish-la',
  },

  {
    slug: 'loudoun-phase-2-bos-final-2026-12',
    title: 'Loudoun BoS: Final Action on Phase 2 Data-Center Standards',
    type: 'zoning_vote',
    status: 'upcoming',
    date: '2026-12-15',
    state: 'VA',
    location: 'Leesburg, VA',
    jurisdiction: 'Loudoun County Board of Supervisors',
    description:
      'Phase 2 zoning/CPAM package (microgrids, backup generation, height, noise, substation policy, conditional-use evaluation) targeted for final BoS adoption in Q4 2026.',
    issue_category: 'zoning',
    source_url: 'https://www.loudoun.gov/6222/Phase-2-Data-Center-Standards-Locations',
    data_center_slug: 'aws-loudoun-va',
  },

  // ── Pending lawsuits / regulatory proceedings (TBD dates) ─────────

  {
    slug: 'naacp-v-xai-preliminary-injunction',
    title: 'NAACP v. xAI Preliminary-Injunction Ruling (Southaven turbines)',
    type: 'lawsuit',
    status: 'pending',
    date: '2026-06-15',
    state: 'MS',
    location: 'Oxford, MS (US District Court)',
    jurisdiction: 'U.S. District Court, N.D. Miss.',
    description:
      'NAACP filed for preliminary injunction May 6, 2026 to halt unpermitted xAI gas turbines. SELC expects ruling within ~6 weeks (mid-June 2026); court may hold a hearing before ruling.',
    issue_category: 'air quality / Clean Air Act',
    source_url:
      'https://earthjustice.org/press/2026/naacp-asks-court-for-emergency-action-to-stop-illegal-air-pollution-from-xais-data-center-power-plant',
    data_center_slug: 'xai-colossus-memphis-tn',
  },

  {
    slug: 'talen-amazon-susquehanna-fifth-circuit-appeal',
    title: 'Talen Energy Fifth Circuit Appeal of FERC Rejection',
    type: 'lawsuit',
    status: 'pending',
    date: '2026-09-01',
    state: 'PA',
    location: 'U.S. Court of Appeals, 5th Circuit',
    jurisdiction: 'U.S. Court of Appeals, 5th Circuit',
    description:
      'After FERC\'s March 2026 denial of rehearing, Talen pursues merits appeal on FERC\'s rejection of the amended Susquehanna ISA (300 MW → 480 MW AWS data-center load). Oral argument date not yet posted.',
    issue_category: 'energy / co-location',
    source_url:
      'https://www.datacenterdynamics.com/en/news/ferc-upholds-rejection-of-proposed-interconnection-agreement-between-aws-data-center-and-pennsylvania-nuclear-plant/',
    data_center_slug: 'aws-cumulus-susquehanna-pa',
  },

  {
    slug: 'lordstown-ohio-supreme-court-decision',
    title: 'Ohio Supreme Court Ruling: Bristolville 25 v. Village of Lordstown',
    type: 'lawsuit',
    status: 'pending',
    date: '2026-07-01',
    state: 'OH',
    location: 'Columbus, OH',
    jurisdiction: 'Supreme Court of Ohio',
    description:
      'Developer\'s writ filed November 2025 seeking to compel Lordstown to process its 1.65M-sq-ft / $3.6B data-center application. Village\'s 180-day moratorium and rescinded ban at issue.',
    issue_category: 'zoning / moratorium',
    source_url:
      'https://www.tribtoday.com/news/local-news/2026/02/lordstown-officials-wait-for-data-center-decision/',
    data_center_slug: 'stargate-lordstown-oh',
  },

  {
    slug: 'switch-v-tract-storey-county-trial',
    title: 'Switch v. Tract Trial (Tahoe-Reno Industrial Center)',
    type: 'lawsuit',
    status: 'pending',
    date: '2026-06-30',
    state: 'NV',
    location: 'Storey County, NV',
    jurisdiction: 'Nevada state court',
    description:
      'Switch obtained a preliminary injunction; full trial originally scheduled March 2026 over Tract\'s data-center development at and adjacent to TRIC. Confirm current docket status.',
    issue_category: 'land use / litigation',
    source_url:
      'https://www.datacenterdynamics.com/en/news/switch-secures-preliminary-injunction-against-tract-in-nevada-data-center-site-dispute/',
    data_center_slug: 'tract-storey-county-nv',
  },

  {
    slug: 'michigan-ag-saline-stargate-appeal',
    title: 'Michigan AG\'s Appeal of MPSC Approval (Stargate Saline)',
    type: 'lawsuit',
    status: 'pending',
    date: '2026-08-01',
    state: 'MI',
    location: 'Michigan Court of Appeals',
    jurisdiction: 'Michigan Court of Appeals / MPSC',
    description:
      'MPSC approved DTE supply contracts for the 1.4 GW Saline Township Stargate data center with conditions; AG Nessel is appealing. Construction proceeding despite the litigation.',
    issue_category: 'energy / cost allocation',
    source_url:
      'https://bridgemi.com/michigan-environment-watch/michigan-regulators-approve-contract-for-michigans-first-hyperscale-data-center/',
    data_center_slug: 'stargate-saline-mi',
  },

  {
    slug: 'mps-prado-ai-jurisdiction',
    title: 'MS PSC: Prado AI Public-Utility-Status Petition (Docket 2026-AD-10)',
    type: 'hearing',
    status: 'pending',
    date: '2026-08-15',
    state: 'MS',
    location: 'Jackson, MS',
    jurisdiction: 'Mississippi Public Service Commission',
    description:
      'Filed 4/14/2026 — Prado AI seeks declaration that it is not a public utility for its Ridgeland AI campus; Entergy and Mississippi Power oppose. Hearing dates TBD.',
    issue_category: 'energy / regulatory jurisdiction',
    source_url:
      'https://mississippitoday.org/2026/04/22/ridgeland-data-center-entergy-mississippi-power/',
  },

  {
    slug: 'nrc-crane-license-amendment-hearing',
    title: 'NRC Adjudicatory Hearing: Crane Clean Energy Center License Amendments',
    type: 'hearing',
    status: 'pending',
    date: '2026-09-01',
    state: 'PA',
    location: 'Pennsylvania',
    jurisdiction: 'U.S. Nuclear Regulatory Commission',
    description:
      'NRC posted hearing notice (Feb 2026) on three license-amendment applications (renewed facility license, emergency preparedness, security plan) for the TMI-1 restart.',
    issue_category: 'nuclear / licensing',
    source_url:
      'https://www.ans.org/news/2026-02-27/article-7805/nrc-posts-hearing-notice-for-crane-license-amendments/',
    data_center_slug: 'microsoft-crane-tmi-pa',
  },

  {
    slug: 'epa-nsr-data-center-construction-rule',
    title: 'EPA "Begin Actual Construction" NSR Rule — Public Comment Period',
    type: 'public_comment',
    status: 'upcoming',
    date: '2026-06-30',
    state: 'VA',
    location: 'Federal Register',
    jurisdiction: 'U.S. Environmental Protection Agency',
    description:
      'EPA proposed loosened NSR construction-permitting rules with relevance to gas plants and data centers; 45-day comment period announced May 2026.',
    issue_category: 'air quality / NSR permitting',
    source_url:
      'https://insideclimatenews.org/news/11052026/epa-proposes-looser-construction-rules-for-gas-plants-data-centers/',
  },

  {
    slug: 'la-psc-aae-ucs-meta-investigation-motion',
    title: 'LA PSC: AAE/UCS Motion to Investigate Meta-Hyperion Financing',
    type: 'hearing',
    status: 'pending',
    date: '2026-07-01',
    state: 'LA',
    location: 'Baton Rouge, LA',
    jurisdiction: 'Louisiana Public Service Commission (Docket U-37425)',
    description:
      'Alliance for Affordable Energy and Union of Concerned Scientists filed a January 14, 2026 motion seeking investigation of Meta-Entergy financing arrangements that could shift cost to ratepayers.',
    issue_category: 'energy / financing / cost allocation',
    source_url:
      'https://www.all4energy.org/wp-content/uploads/2026/01/2026-01-14-U-37425-AAE-UCS-Mtn-for-Investigation.pdf',
    url: 'http://lpscstar.louisiana.gov/star/portalsearch.aspx',
    data_center_slug: 'meta-richland-parish-la',
  },

  // ── Pass-4 additions (verified upcoming events, 2026-05-15) ────────

  {
    slug: 'epa-nsr-virtual-public-hearing-2026-05-28',
    title: 'EPA Virtual Public Hearing: "Begin Actual Construction" NSR Rule',
    type: 'public_comment',
    status: 'upcoming',
    date: '2026-05-28',
    state: 'VA',
    location: 'Virtual (EPA)',
    jurisdiction: 'U.S. Environmental Protection Agency',
    description:
      'EPA virtual public hearing on the proposed redefinition of "begin actual construction" in the NSR preconstruction permitting program. Federal Register notice published May 13, 2026 (Docket EPA-HQ-OAR-2025-0618).',
    issue_category: 'air quality / NSR permitting',
    source_url:
      'https://www.federalregister.gov/documents/2026/05/13/2026-09524/begin-actual-construction-in-the-new-source-review-nsr-preconstruction-permitting-program',
    url: 'https://www.regulations.gov/docket/EPA-HQ-OAR-2025-0618',
  },
  {
    slug: 'epa-nsr-comment-deadline-2026-06-29',
    title: 'EPA Comment Deadline: "Begin Actual Construction" NSR Rule',
    type: 'public_comment',
    status: 'upcoming',
    date: '2026-06-29',
    state: 'VA',
    location: 'Federal Register / regulations.gov',
    jurisdiction: 'U.S. Environmental Protection Agency',
    description:
      'Final deadline for written comments on EPA\'s rule that would let data centers and gas plants begin non-emitting site work before NSR air permits issue.',
    issue_category: 'air quality / NSR permitting',
    source_url:
      'https://www.federalregister.gov/documents/2026/05/13/2026-09524/begin-actual-construction-in-the-new-source-review-nsr-preconstruction-permitting-program',
    url: 'https://www.regulations.gov/docket/EPA-HQ-OAR-2025-0618',
  },
  {
    slug: 'storey-county-bocc-meeting-2026-06-16',
    title: 'Storey County NV BoCC: Next Regular Meeting (TRIC Data-Center Items)',
    type: 'hearing',
    status: 'upcoming',
    date: '2026-06-16',
    state: 'NV',
    location: 'Storey County Courthouse, Virginia City, NV',
    jurisdiction: 'Storey County Board of County Commissioners',
    description:
      'June 2 meeting was cancelled; next BoCC meeting June 16 at 10am. Recurring agenda includes sales-tax-abatement positions on Tahoe-Reno Industrial Center DC projects (Switch, Tract, Vantage, Google, Apple, Microsoft).',
    issue_category: 'zoning / land use / sales-tax abatement',
    source_url:
      'https://www.thecomstockchronicle.com/storey-county-announces-board-of-county-commission-meeting-updates/',
    url: 'https://storeycounty.org/AgendaCenter',
    data_center_slug: 'tract-storey-county-nv',
  },
  {
    slug: 'ohio-data-center-ban-signature-deadline-2026-07-01',
    title: 'Ohio Data-Center Ban Ballot Initiative: Signature Deadline',
    type: 'legislation',
    status: 'upcoming',
    date: '2026-07-01',
    state: 'OH',
    location: 'Columbus, OH (Secretary of State)',
    jurisdiction: 'Ohio Secretary of State / Ohio Residents for Responsible Development',
    description:
      'Citizen-initiated constitutional amendment to prohibit data centers >25 MW. Petitioners must submit 413,488 valid signatures (from at least half of 88 counties) by July 1, 2026 to qualify for the November 2026 ballot.',
    issue_category: 'legislation / ballot initiative',
    source_url: 'https://ballotpedia.org/Ohio_Prohibition_of_Data_Center_Construction_Amendment_(2026)',
    url: 'https://ohiocapitaljournal.com/2026/04/30/ohio-data-center-ban-proposal-advocates-are-trying-to-get-413000-signatures-by-july-1/',
  },
  {
    slug: 'tx-puc-58481-final-rule-target-2026-07',
    title: 'TX PUC: Project 58481 Final Rule on Large-Load Interconnection (SB 6)',
    type: 'legislation',
    status: 'upcoming',
    date: '2026-07-15',
    state: 'TX',
    location: 'Austin, TX',
    jurisdiction: 'Public Utility Commission of Texas',
    description:
      'PUCT proposed 16 TAC §25.194 implementing SB 6 large-load (>75 MW) interconnection standards on March 12, 2026; initial comments closed April 17. Final rule targeted mid-2026.',
    issue_category: 'energy / interconnection / SB 6 implementation',
    source_url:
      'https://www.dlapiper.com/en-us/insights/publications/2026/03/texas-proposes-new-interconnection-standards-for-large-electric-loads',
    url: 'https://interchange.puc.texas.gov/Search/Filings?ControlNumber=58481',
  },
  {
    slug: 'lordstown-moratorium-extension-public-hearing-2026-06',
    title: 'Lordstown OH: Public Hearing on 180-Day Moratorium Extension',
    type: 'moratorium',
    status: 'upcoming',
    date: '2026-06-08',
    state: 'OH',
    location: 'Lordstown, OH (Village Hall)',
    jurisdiction: 'Village of Lordstown Council',
    description:
      'Council voted May 4 to advertise a public hearing within 30 days on extending the January 2026 moratorium another 180 days. Hearing is statutorily required before extension.',
    issue_category: 'moratorium / land use',
    source_url:
      'https://www.wfmj.com/news/local-news/lordstown/lordstown-village-council-plans-to-extend-data-center-ban-another-180-days/article_ac285afd-175d-469e-a1c9-a37f13c4dc39.html',
    url: 'https://www.lordstownvillage.org/',
    data_center_slug: 'stargate-lordstown-oh',
  },
  {
    slug: 'wi-psc-we-energies-vlc-final-order-2026',
    title: 'WI PSC: Final Order on We Energies Very Large Customer Tariff (Docket 6630-TE-113)',
    type: 'hearing',
    status: 'pending',
    date: '2026-07-15',
    state: 'WI',
    location: 'Madison, WI',
    jurisdiction: 'Wisconsin Public Service Commission',
    description:
      'PSC approved (with major modifications) the VLC/Bespoke Resources Tariff April 24, 2026; final written order due summer 2026. Lowers tariff threshold to 100 MW, extends minimum term to 15 yrs, requires DC customers cover bespoke generation costs.',
    issue_category: 'energy / cost allocation / DC tariff',
    source_url: 'https://psc.wi.gov/Documents/PressReleases/04.24.2026PressRelease.PDF',
    url: 'https://apps.psc.wi.gov/ERF/ERFhome.aspx',
    data_center_slug: 'stargate-port-washington-wi',
  },
  {
    slug: 'frederick-county-md-ballot-question-2026-11',
    title: 'Frederick County MD: Data-Center Overlay Zone Referendum',
    type: 'legislation',
    status: 'upcoming',
    date: '2026-11-03',
    state: 'MD',
    location: 'Frederick County, MD',
    jurisdiction: 'Frederick County Board of Elections',
    description:
      'Board of Elections certified 21,029 valid signatures (vs 15,611 required) April 3, 2026 — Critical Digital Infrastructure Overlay Zone ordinance goes to the November 3 general election. Consolidated lawsuit (Quantum Maryland LLC) pending.',
    issue_category: 'zoning / ballot referendum',
    source_url:
      'https://ccanactionfund.org/frederick-county-residents-gather-an-impressive-21029-valid-signatures-to-put-controversial-data-center-expansion-project-on-the-ballot/',
    url: 'https://elections.maryland.gov/elections/2026/index.html',
  },
  {
    slug: 'cheyenne-moratorium-3rd-reading-vote-2026-06',
    title: 'Cheyenne City Council: 3rd Reading + Final Vote on Data-Center Moratorium',
    type: 'moratorium',
    status: 'upcoming',
    date: '2026-06-09',
    state: 'WY',
    location: 'Cheyenne, WY (Council Chamber)',
    jurisdiction: 'Cheyenne City Council',
    description:
      'Ordinance for 12-month moratorium on new DC construction (Councilman Moody) requires three readings; final vote expected at the June 9, 2026 regular meeting. Up to 70 DC projects in Cheyenne pipeline.',
    issue_category: 'moratorium / land use',
    source_url:
      'https://capcity.news/community/city/2026/05/11/cheyenne-city-council-to-introduce-data-center-moratorium-bill-buy-thomes-avenue-senior-center/',
    url: 'https://www.cheyennecity.org/Your-Government/Departments/City-Council/Agendas-Minutes',
  },
  {
    slug: 'az-cc-data-center-docket-next-workshop-2026',
    title: 'AZ Corporation Commission: Next Workshop on Large-Load / Data-Center Development',
    type: 'hearing',
    status: 'pending',
    date: '2026-08-15',
    state: 'AZ',
    location: 'Phoenix, AZ (ACC Hearing Room 1)',
    jurisdiction: 'Arizona Corporation Commission',
    description:
      'After April 16, 2026 workshop, Commissioner Thompson stated his desire to host another workshop "in the near future" to explore hook-up fees, IRP reforms, RFP-process changes, water considerations, and tariff standardization.',
    issue_category: 'energy / cost allocation',
    source_url: 'https://azcc.gov/news/home/2026/04/20/acc-large-load-data-center-workshop-highlights',
    url: 'https://edocket.azcc.gov/search/docket-search/item-detail/26370',
  },
  {
    slug: 'ms-psc-prado-ai-intervention-decision-2026-06',
    title: 'MS PSC: Decision on Entergy/Mississippi Power Intervention (Docket 2026-AD-10)',
    type: 'hearing',
    status: 'pending',
    date: '2026-06-15',
    state: 'MS',
    location: 'Jackson, MS',
    jurisdiction: 'Mississippi Public Service Commission',
    description:
      'Prado AI filed Rule 24 petition seeking declaration it is not a public utility for the 350 MW gas plant + AI campus + semi fab. Entergy and Mississippi Power intervened. Commission ruling on intervention threshold pending in June.',
    issue_category: 'energy / regulatory jurisdiction',
    source_url: 'https://biggerpieforum.org/economic-growth/off-the-grid-puts-someone-on-the-hook/',
    url: 'https://www.psc.ms.gov/exec-sec/dockets',
    data_center_slug: 'prado-ai-ridgeland-ms',
  },
  {
    slug: 'cheyenne-microsoft-annexation-rezone-2026',
    title: 'Cheyenne WY: Microsoft 3,200-Acre Annexation / Rezoning Public Hearing',
    type: 'zoning_vote',
    status: 'upcoming',
    date: '2026-10-15',
    state: 'WY',
    location: 'Cheyenne, WY',
    jurisdiction: 'City of Cheyenne / Laramie County',
    description:
      'Microsoft announced April 14, 2026 intent to purchase ~3,200 acres south of Cheyenne to roughly triple its DC footprint. Annexation/rezoning applications expected before council in late 2026.',
    issue_category: 'zoning / annexation',
    source_url:
      'https://news.microsoft.com/source/2026/04/14/microsoft-announces-intent-to-expand-datacenter-operations-in-cheyenne-accelerating-innovation-and-economic-growth/',
    url: 'https://www.cheyennecity.org/Your-Government/Departments/Planning-Development',
    data_center_slug: 'microsoft-cheyenne-wy',
  },
  {
    slug: 'ohio-supreme-court-ballot-ban-ruling-2026',
    title: 'Ohio Ballot Board: Certification Decisions on Data-Center Ban Amendment',
    type: 'legislation',
    status: 'upcoming',
    date: '2026-07-31',
    state: 'OH',
    location: 'Columbus, OH',
    jurisdiction: 'Ohio Secretary of State / Ballot Board',
    description:
      'If signatures submitted by July 1, the SoS has statutory window to determine sufficiency and validity. Likely Ballot Board certification (or rejection) action in July–August 2026.',
    issue_category: 'legislation / ballot initiative',
    source_url:
      'https://ohiocapitaljournal.com/2026/04/30/ohio-data-center-ban-proposal-advocates-are-trying-to-get-413000-signatures-by-july-1/',
    url: 'https://www.ohiosos.gov/elections/petition-information/initiative-petition-process/',
  },
  {
    slug: 'dane-county-advisory-committee-meetings-2026',
    title: 'Dane County WI: Data-Center Advisory Committee Meetings (Ongoing)',
    type: 'community_meeting',
    status: 'upcoming',
    date: '2026-06-10',
    state: 'WI',
    location: 'Madison, WI (City-County Building)',
    jurisdiction: 'Dane County Board of Supervisors',
    description:
      'Dane County Advisory Committee on Data Centers first convened Feb 10, 2026 after QTS withdrew its DeForest proposal. Committee meets through 2026 to draft county recommendations.',
    issue_category: 'zoning / community process',
    source_url:
      'https://www.hngnews.com/the_star/regional_news/dane-county-launches-data-centers-advisory-committee/article_f0ba5afc-a167-431a-84b0-d5d5a949044f.html',
    url: 'https://board.danecounty.gov/',
    data_center_slug: 'qts-dane-county-wi',
  },
  {
    slug: 'linn-county-ia-palo-annexation-2026',
    title: 'Linn County IA / City of Palo: Annexation Decision on Google Site',
    type: 'zoning_vote',
    status: 'upcoming',
    date: '2026-09-01',
    state: 'IA',
    location: 'Palo, IA / Linn County',
    jurisdiction: 'City of Palo + Linn County Board of Supervisors',
    description:
      'Google notified Linn County Feb 26, 2026 it would pursue annexation into the City of Palo to bypass Linn County\'s Feb 18, 2026 data-center ordinance. Annexation petition + Palo public hearings expected through 2026.',
    issue_category: 'zoning / annexation',
    source_url: 'https://www.iowapublicradio.org/ipr-news/2026-04-23/google-data-center-linn-county-palo',
    url: 'https://www.linncountyiowa.gov/1862/Data-Centers-in-Unincorporated-Linn-Coun',
    data_center_slug: 'google-cedar-rapids-ia',
  },
  {
    slug: 'liberty-utilities-rfp-tahoe-power-2026',
    title: 'Liberty Utilities CA: RFP for Lake Tahoe Replacement Power',
    type: 'other',
    status: 'upcoming',
    date: '2026-08-15',
    state: 'CA',
    location: 'South Lake Tahoe, CA',
    jurisdiction: 'Liberty Utilities / CPUC',
    description:
      'NV Energy notified Liberty Utilities it will stop supplying ~75% of power to 49,000 California-side Lake Tahoe customers by May 2027, citing TRIC data-center demand. Liberty plans formal RFP summer 2026.',
    issue_category: 'energy / transmission',
    source_url: 'https://fortune.com/2026/05/12/lake-tahoe-data-center-49000-residents-power-source/',
    url: 'https://www.cpuc.ca.gov/',
  },
  {
    slug: 'ga-power-irp-filing-2026',
    title: 'GA PSC: Georgia Power 2026 Integrated Resource Plan Filing',
    type: 'hearing',
    status: 'upcoming',
    date: '2026-09-30',
    state: 'GA',
    location: 'Atlanta, GA',
    jurisdiction: 'Georgia Public Service Commission',
    description:
      'Georgia Power confirmed March 5, 2026 that data-center power usage will be central to its 2026 IRP filing. Follows July 2025 IRP approval (Docket 55378) and rate-freeze-through-2028.',
    issue_category: 'energy / cost allocation',
    source_url: 'https://www.georgiapower.com/about/company/filings/irp.html',
    url: 'https://psc.ga.gov/search/facts-docket/',
  },
  {
    slug: 'charles-county-md-bocc-final-zta-vote-2026',
    title: 'Charles County MD BoCC: Final Vote on ZTA #25-187',
    type: 'zoning_vote',
    status: 'upcoming',
    date: '2026-07-15',
    state: 'MD',
    location: 'La Plata, MD',
    jurisdiction: 'Charles County Board of County Commissioners',
    description:
      'Planning Commission June 1, 2026 hearing on revised ZTA #25-187 (heavy industrial only, no potable cooling, self-gen power) sends recommendation back to BoCC for final vote.',
    issue_category: 'zoning + water',
    source_url: 'https://www.charlescountymd.gov/Home/Components/News/News/6475/407',
    url: 'https://www.charlescountymd.gov/government/county-commissioners',
  },
  {
    slug: 'pwc-quantico-ridge-rezone-spex-hearings-2026',
    title: 'PWC VA: Quantico Ridge Rezoning + SPEX Hearings',
    type: 'zoning_vote',
    status: 'pending',
    date: '2026-09-15',
    state: 'VA',
    location: 'Manassas, VA',
    jurisdiction: 'Prince William County Planning Commission / BoCS',
    description:
      'Highland Properties Manassas LLC withdrew CPA initiation May 8, 2026, but rezoning and SPEX requests for 4 buildings (each 437,000 sq ft, 100 ft tall, adjacent to Prince William Forest Park) remain under review.',
    issue_category: 'zoning / national-park-adjacent',
    source_url:
      'https://wtop.com/virginia/2026/05/quantico-ridge-data-center-campus-near-prince-william-forest-park-shelved-for-now/',
    url: 'https://www.pwcva.gov/department/planning-office/planning-commission',
  },
  {
    slug: 'lpsc-aae-ucs-investigation-motion-ruling-2026',
    title: 'LA PSC: Ruling on AAE/UCS Meta-Entergy Financing Motion (Docket U-37425)',
    type: 'hearing',
    status: 'pending',
    date: '2026-08-15',
    state: 'LA',
    location: 'Baton Rouge, LA',
    jurisdiction: 'Louisiana Public Service Commission',
    description:
      'Ruling expected on AAE/UCS January 14, 2026 motion seeking PSC investigation of Meta-Entergy financing arrangements (offset payments, special-purpose entity structures) potentially shifting cost to ratepayers.',
    issue_category: 'energy / financing / cost allocation',
    source_url:
      'https://www.all4energy.org/wp-content/uploads/2026/01/2026-01-14-U-37425-AAE-UCS-Mtn-for-Investigation.pdf',
    url: 'http://lpscstar.louisiana.gov/star/portalsearch.aspx',
    data_center_slug: 'meta-richland-parish-la',
  },
  {
    slug: 'aws-cumulus-phase-2-activation-2026-11',
    title: 'AWS Cumulus Salem Township PA: Phase 2 Activation Milestone',
    type: 'other',
    status: 'upcoming',
    date: '2026-11-30',
    state: 'PA',
    location: 'Salem Township, PA (Luzerne County)',
    jurisdiction: 'Salem Township / Luzerne County / PA DEP',
    description:
      'AWS 15-building Cumulus campus second-phase activation scheduled November 30, 2026 per developer filings. Site co-located with Susquehanna nuclear (subject of FERC ER25 / Talen 5th Circuit appeal).',
    issue_category: 'zoning / energy / siting',
    source_url:
      'https://www.datacenterfrontier.com/hyperscale/article/33038288/aws-eyes-960-mw-for-newly-acquired-nuclear-power-data-center-in-pennsylvania',
    url: 'https://www.pa.gov/agencies/oto/fasttrack/salemtownshipdatacenterdevelopment',
    data_center_slug: 'aws-cumulus-susquehanna-pa',
  },
];
