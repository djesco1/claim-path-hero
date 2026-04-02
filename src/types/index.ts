export type Plan = 'free' | 'pro';

export type ClaimType =
  | 'landlord_deposit'
  | 'wrongful_termination'
  | 'insurance_denial'
  | 'public_entity'
  | 'service_refund'
  | 'other';

export type ClaimStatus = 'draft' | 'in_progress' | 'sent' | 'resolved' | 'closed';

export type CounterpartyType = 'person' | 'company' | 'government_entity';

export type RightStrength = 'strong' | 'moderate' | 'reference';

export type TimelineEventType =
  | 'created'
  | 'document_generated'
  | 'sent'
  | 'response_received'
  | 'escalated'
  | 'resolved';

export interface UserProfile {
  id: string;
  full_name: string;
  country: string;
  plan: Plan;
  claims_used: number;
  created_at: string;
}

export interface LegalRight {
  name: string;
  legal_basis: string;
  explanation: string;
  strength: RightStrength;
}

export interface Claim {
  id: string;
  user_id: string;
  title: string;
  claim_type: ClaimType;
  status: ClaimStatus;
  situation_description: string;
  counterparty_name: string;
  counterparty_type: CounterpartyType;
  amount_involved: number | null;
  incident_date: string;
  generated_document: string | null;
  instructions: string | null;
  legal_rights: LegalRight[] | null;
  deadline_date: string | null;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClaimTimeline {
  id: string;
  claim_id: string;
  event_type: TimelineEventType;
  note: string | null;
  created_at: string;
}

export interface ClaimDocument {
  id: string;
  claim_id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
}

export interface GenerateClaimResponse {
  document_text: string;
  title: string;
  legal_rights: LegalRight[];
  instructions: string;
  deadline_suggestion: string;
}

export interface NewClaimData {
  claim_type: ClaimType;
  situation_description: string;
  counterparty_name: string;
  counterparty_type: CounterpartyType;
  amount_involved: number | null;
  incident_date: string;
}
