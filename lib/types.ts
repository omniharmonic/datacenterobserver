export type DataCenterStatus =
  | 'proposed'
  | 'announced'
  | 'permitting'
  | 'approved'
  | 'under_construction'
  | 'operational'
  | 'paused'
  | 'cancelled';

export type OrganizationType =
  | 'tech_company'
  | 'cloud_provider'
  | 'developer'
  | 'investor'
  | 'pe_firm'
  | 'sovereign_wealth'
  | 'construction'
  | 'engineering'
  | 'energy_utility'
  | 'lobbying_firm'
  | 'consortium'
  | 'government_body'
  | 'other';

export type OfficialLevel = 'federal' | 'state' | 'local';

export type EventType =
  | 'public_comment'
  | 'hearing'
  | 'protest'
  | 'town_hall'
  | 'press_conference'
  | 'community_meeting'
  | 'moratorium'
  | 'zoning_vote'
  | 'legislation'
  | 'lawsuit'
  | 'project_withdrawal'
  | 'other';

export type EventStatus =
  | 'upcoming'
  | 'completed'
  | 'resolved_favorable'
  | 'resolved_unfavorable'
  | 'resolved_mixed'
  | 'pending';

export type DCOrgRelationship =
  | 'operates'
  | 'develops'
  | 'funds'
  | 'constructs'
  | 'supplies_energy'
  | 'owns'
  | 'joint_venture'
  | 'permits'
  | 'lobbies_for'
  | 'partners_with';

export type OrgRelationship =
  | 'owns'
  | 'subsidiary_of'
  | 'invests_in'
  | 'joint_venture'
  | 'lobbies_for'
  | 'contracted_by'
  | 'partners_with'
  | 'supplies'
  | 'acquired';

export interface DataCenter {
  id: string;
  slug: string;
  name: string;
  status: DataCenterStatus;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  county?: string;
  state: string;
  zip?: string;
  operator?: string;
  developer?: string;
  capacity_mw?: number;
  footprint_acres?: number;
  water_usage_gpd?: number;
  energy_source?: string;
  estimated_cost_usd?: number;
  announced_date?: string;
  expected_completion?: string;
  description?: string;
  source_urls?: string[];
  organization_slugs?: { slug: string; relationship: DCOrgRelationship }[];
  official_ids?: string[];
  event_slugs?: string[];
  last_verified_at?: string;
  // US House district covering this site, e.g. 'TX-19' or 'WY-AL'.
  // Used to narrow the detail-panel House representative to the actual
  // jurisdiction rather than every House member in the state.
  house_district?: string;
  // Where this record came from: 'editorial' (hand-curated), 'fractracker',
  // 'datacentertracker', etc. Surfaces in the detail panel.
  data_source?: string;
  // How well-pinned the lat/lng is. 'high' = known parcel; 'medium' =
  // approximate (within a few km); 'low' = city- or county-center guess.
  // Map filters Low by default.
  location_confidence?: 'low' | 'medium' | 'high' | null;
}

export interface Organization {
  slug: string;
  name: string;
  type: OrganizationType;
  description?: string;
  website?: string;
  headquarters?: string;
  ticker?: string;
  estimated_lobbying_usd?: number;
}

export interface Official {
  id: string;
  name: string;
  title: string;
  level: OfficialLevel;
  body?: string;
  district?: string;
  state?: string;
  party?: string;
  phone?: string;
  email?: string;
  office_address?: string;
  website?: string;
  photo_url?: string;
  source?: string;          // URL of the page where this entry was verified
  last_verified_at?: string; // ISO date; e.g. '2026-05-14'
}

export interface Event {
  slug: string;
  title: string;
  type: EventType;
  status: EventStatus;
  date: string;
  end_date?: string;
  location?: string;
  state?: string;
  jurisdiction?: string;
  description?: string;
  issue_category?: string;
  url?: string;
  source_url?: string;
  data_center_slug?: string;
}

export interface OrgRelationshipEdge {
  source: string;
  target: string;
  relationship: OrgRelationship;
  description?: string;
  value_usd?: number;
  source_url?: string;
}

export interface GraphNode {
  id: string;
  name: string;
  category: 'organization' | 'data_center' | 'official';
  node_type: string;
  metric?: number;
  state?: string;
  status?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
  value?: number;
}
