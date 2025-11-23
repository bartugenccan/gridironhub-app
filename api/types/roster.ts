export interface Coach {
  id: string;
  fullName: string;
  role: 'coach';
  primaryPosition: string | null;
}

export interface Player {
  id: string;
  fullName: string;
  role: 'player';
  jerseyNumber: number | null;
  position: string | null;
}

export interface RosterResponse {
  teamId: string;
  coaches: Coach[];
  players: Player[];
}
