export const STATUS_COLORS: Record<string, string> = {
  proposed: '#8B5CF6',
  announced: '#F59E0B',
  permitting: '#3B82F6',
  approved: '#60A5FA',
  under_construction: '#EF4444',
  operational: '#10B981',
  paused: '#6B7280',
  cancelled: '#374151',
};

export const STATUS_LABELS: Record<string, string> = {
  proposed: 'Proposed',
  announced: 'Announced',
  permitting: 'In Permitting',
  approved: 'Approved',
  under_construction: 'Under Construction',
  operational: 'Operational',
  paused: 'Paused',
  cancelled: 'Cancelled',
};

export const STATUS_LIST: string[] = [
  'proposed',
  'announced',
  'permitting',
  'approved',
  'under_construction',
  'operational',
  'paused',
  'cancelled',
];

export const NODE_COLORS: Record<string, string> = {
  tech_company: '#3B82F6',
  cloud_provider: '#6366F1',
  developer: '#8B5CF6',
  investor: '#F59E0B',
  pe_firm: '#F97316',
  sovereign_wealth: '#FBBF24',
  construction: '#EF4444',
  engineering: '#FB923C',
  energy_utility: '#10B981',
  lobbying_firm: '#EC4899',
  consortium: '#A855F7',
  government_body: '#94A3B8',
  data_center: '#22D3EE',
  official: '#94A3B8',
  organization: '#3B82F6',
  federal: '#22D3EE',
  state: '#94A3B8',
  local: '#64748B',
  other: '#64748B',
};

export const EVENT_TYPE_LABELS: Record<string, string> = {
  public_comment: 'Public Comment',
  hearing: 'Hearing',
  protest: 'Protest',
  town_hall: 'Town Hall',
  press_conference: 'Press Conference',
  community_meeting: 'Community Meeting',
  moratorium: 'Moratorium',
  zoning_vote: 'Zoning Vote',
  legislation: 'Legislation',
  lawsuit: 'Lawsuit',
  project_withdrawal: 'Project Withdrawal',
  other: 'Other',
};

export const EVENT_STATUS_LABELS: Record<string, string> = {
  upcoming: 'Upcoming',
  completed: 'Completed',
  resolved_favorable: 'Resolved · Favorable',
  resolved_unfavorable: 'Resolved · Unfavorable',
  resolved_mixed: 'Resolved · Mixed',
  pending: 'Pending',
};

export const MAPLIBRE_DEMO_STYLE =
  'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
