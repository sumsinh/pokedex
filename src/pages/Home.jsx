import { useEffect, useState } from "react";
import { getPokemonList } from "../../public/services/api";

function Home() {
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [type, setType] = useState("");

  // load favorites
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(saved);
  }, []);

  useEffect(() => {
    if (!type) {
      fetchData();
    }
  }, [page, type]);

  async function fetchData() {
    try {
      setLoading(true);
      const data = await getPokemonList(page * 20);
      setPokemon(data);
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function fetchByType(selectedType) {
    try {
      setLoading(true);

      const res = await fetch(
        `https://pokeapi.co/api/v2/type/${selectedType}`
      );
      const data = await res.json();

      const list = data.pokemon.map((p) => ({
        name: p.pokemon.name,
      }));

      setPokemon(list);
      setPage(0);
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function toggleFavorite(name) {
    let updated;

    if (favorites.includes(name)) {
      updated = favorites.filter((f) => f !== name);
    } else {
      updated = [...favorites, name];
    }

    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  }

  async function getPokemonDetails(name) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const data = await res.json();
    setSelectedPokemon(data);
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Pokedex</h1>

      <input
        type="text"
        placeholder="Search pokemon..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: "8px", marginBottom: "20px", width: "200px" }}
      />

      {/* Type Filter */}
      <select
        value={type}
        onChange={(e) => {
          const value = e.target.value;
          setType(value);

          if (value) {
            fetchByType(value);
          } else {
            fetchData();
          }
        }}
        style={{ padding: "8px", marginLeft: "10px" }}
      >
        <option value="">All</option>
        <option value="fire">Fire</option>
        <option value="water">Water</option>
        <option value="grass">Grass</option>
        <option value="electric">Electric</option>
        <option value="bug">Bug</option>
      </select>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: "10px",
        }}
      >
        {pokemon
          .filter((p) =>
            p.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((p, index) => {
            const id = page * 20 + index + 1;
            const image = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

            return (
              <div
                key={index}
                onClick={() => getPokemonDetails(p.name)}
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  textAlign: "center",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                <img src={image} alt={p.name} />
                <p>{p.name}</p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(p.name);
                  }}
                >
                  {favorites.includes(p.name) ? "★" : "☆"}
                </button>
              </div>
            );
          })}
      </div>

      {/* Pagination (only when no type filter) */}
      {!type && (
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            style={{ marginRight: "10px" }}
          >
            Previous
          </button>

          <button onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}

      {/* Modal */}
      {selectedPokemon && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              width: "300px",
              textAlign: "center",
            }}
          >
            <h2>{selectedPokemon.name}</h2>

            <img
              src={selectedPokemon.sprites.front_default}
              alt={selectedPokemon.name}
            />

            <p>HP: {selectedPokemon.stats[0].base_stat}</p>
            <p>Attack: {selectedPokemon.stats[1].base_stat}</p>

            <p>
              Abilities:{" "}
              {selectedPokemon.abilities
                .map((a) => a.ability.name)
                .join(", ")}
            </p>

            <button onClick={() => setSelectedPokemon(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;