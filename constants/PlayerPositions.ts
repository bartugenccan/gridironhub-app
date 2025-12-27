export const playerPositions = [
  'QB', // Quarterback
  'RB', // Running Back
  'FB', // Fullback
  'WR', // Wide Receiver
  'TE', // Tight End
  'OL', // Offensive Lineman
  'C', // Center
  'G', // Guard
  'T', // Tackle
  'DL', // Defensive Lineman
  'DE', // Defensive End
  'DT', // Defensive Tackle
  'LB', // Linebacker
  'ILB', // Inside Linebacker
  'OLB', // Outside Linebacker
  'DB', // Defensive Back
  'CB', // Cornerback
  'S', // Safety
  'FS', // Free Safety
  'SS', // Strong Safety
  'K', // Kicker
  'P', // Punter
  'LS', // Long Snapper
] as const;

export type PlayerPosition = (typeof playerPositions)[number];
