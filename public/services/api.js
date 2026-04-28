export async function getPokemonList(offset = 0) {
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`
  );

  const data = await res.json();
  return data.results;
}