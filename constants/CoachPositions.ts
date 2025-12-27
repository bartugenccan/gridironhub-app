export const coachPositions = [
  'Head Coach',
  'Offensive Coordinator',
  'Defensive Coordinator',
  'Special Teams Coach',
  'Quarterbacks Coach',
  'Running Backs Coach',
  'Wide Receivers Coach',
  'Tight Ends Coach',
  'Offensive Line Coach',
  'Defensive Line Coach',
  'Linebackers Coach',
  'Defensive Backs Coach',
  'Strength and Conditioning Coach',
  'Assistant Coach',
] as const;

export type CoachPosition = (typeof coachPositions)[number];
