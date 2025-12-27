export interface Coach {
  id: string;
  fullName: string;
  role: 'coach';
  primaryPosition: string[]; // Backend returns "position": ["HC", "OC"] or []
}

export interface Player {
  id: string;
  fullName: string;
  role: 'player';
  jerseyNumber: number | null;
  position: string[]; // Backend returns "position": ["TE"] or []
}

export interface RosterResponse {
  teamId: string;
  coaches: Coach[];
  players: Player[];
}
