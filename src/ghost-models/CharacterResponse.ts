/**
 * Ghost model definition for CharacterResponse.
 * IMPORTANT: This must be kept in sync with the Zod schema in zod-schemas.ts.
 * Both must parse the exact same fields for a fair benchmark.
 */

export interface GhostCharacterOrigin {
  name: string;
  url: string;
}

export interface GhostCharacter {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: GhostCharacterOrigin;
  location: GhostCharacterOrigin;
  image: string;
  episode: string[];
  url: string;
  created: string;
}

export interface CharacterResponseInfo {
  count: number;
  pages: number;
  next: string | null;
  prev: string | null;
}

export interface CharacterResponse {
  info: CharacterResponseInfo;
  results: GhostCharacter[];
}
