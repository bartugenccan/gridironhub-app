export interface CoachProfile {
  id: string;
  fullName: string;
  bio: string | null;
  certifications: string[];
  preferredPositions: string[];
  yearsOfExperience: number | null;
  teams: {
    id: string;
    name: string;
    role: string;
  }[];
}
