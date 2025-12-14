export interface PersonalRecordValue {
  value: number;
  recordedAt: string;
}

export interface PersonalRecords {
  benchPress: PersonalRecordValue | null;
  squat: PersonalRecordValue | null;
  deadlift: PersonalRecordValue | null;
  overheadPress: PersonalRecordValue | null;
  clean: PersonalRecordValue | null;
  fortyYardDash: PersonalRecordValue | null;
}

export interface PlayerProfile {
  id: string;
  fullName: string;
  jerseyNumber: number | null;
  position: string[] | null;
  dominantHand: 'left' | 'right' | 'ambidextrous' | null;
  heightCm: number | null;
  weightKg: number | null;
  bio: string | null;
  prs: PersonalRecords;
}

export interface UpdatePlayerProfileRequest {
  fullName?: string;
  jerseyNumber?: number;
  position?: string[];
  dominantHand?: 'left' | 'right' | 'ambidextrous';
  heightCm?: number;
  weightKg?: number;
  bio?: string;
  teamId?: string;
}
