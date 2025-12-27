export interface CoachProfile {
  id: string;
  fullName: string;
  bio: string | null;
  certifications: string[];
  preferredPositions: string[];
  yearsOfExperience: number | null;
  currentTeam: string | null;
  teams: {
    id: string;
    name: string;
    role: string;
  }[];
}

export interface UpdateCoachProfileRequest {
  fullName?: string;
  certifications?: string[];
  preferredPositions?: string[];
  yearsOfExperience?: number;
  position?: string;
  bio?: string;
  teamId?: string;
}
