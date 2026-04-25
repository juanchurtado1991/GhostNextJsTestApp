import {GhostCharacter} from "@/models/types";

export async function fetchCharactersFromApi(pageCount: number): Promise<GhostCharacter[]> {
    const allCharacters: GhostCharacter[] = [];

    for (let i = 1; i <= pageCount; i++) {
        try {
            const response = await fetch(`https://rickandmortyapi.com/api/character?page=${i}`);
            const data = await response.json();

            if (data.results) {
                allCharacters.push(...data.results.map((
                    char: { id: number; name: string; status: string; species: string; image: string }
                ) => ({
                    id: char.id,
                    name: char.name,
                    status: char.status,
                    species: char.species,
                    image: char.image,
                })));
            }
        } catch (error) {
            console.error(`Error fetching page ${i}:`, error);
        }
    }

    return allCharacters;
}
