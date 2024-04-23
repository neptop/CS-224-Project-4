import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

interface Pokemon {
  name: string;
  url: string;
}

interface PokemonDetails {
  id: number;
  name: string;
  image: string;
  types: string[];
  description: string;
}

interface ApiPokemon {
  id: number;
  name: string;
  sprites: { front_default: string };
  types: Array<{ type: { name: string } }>;
}

interface FlavorTextEntry {
  flavor_text: string;
  language: { name: string };
}

interface ApiSpecies {
  flavor_text_entries: FlavorTextEntry[];
}

const App = () => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [searchField, setSearchField] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("https://pokeapi.co/api/v2/pokemon?limit=151")
      .then(response => {
        setPokemonList(response.data.results);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error occurred while fetching data: ", error);
        setLoading(false);
      });
  }, []);

  const fetchPokemonDetails = (pokemon: Pokemon) => {
    setLoading(true);
    axios.get<ApiPokemon>(pokemon.url)
      .then(response => {
        const { id, name, sprites, types } = response.data;
        fetchPokemonSpecies(
          id,
          name,
          sprites.front_default,
          types.map((item) => item.type.name) // 'item' is now correctly typed
        );
      })
      .catch(error => {
        console.error("Error occurred while fetching Pokemon details: ", error);
        setLoading(false);
      });
  };

  const fetchPokemonSpecies = (id: number, name: string, image: string, types: string[]) => {
    axios.get<ApiSpecies>(`https://pokeapi.co/api/v2/pokemon-species/${id}/`)
      .then(response => {
        const speciesData = response.data;
        const descriptionEntry = speciesData.flavor_text_entries.find(
          (entry: FlavorTextEntry) => entry.language.name === 'en'
        );
        const description = descriptionEntry ? descriptionEntry.flavor_text : '';
        setSelectedPokemon({ id, name, image, types, description });
        setLoading(false);
      })
      .catch(error => {
        console.error("Error occurred while fetching Pokemon species: ", error);
        setLoading(false);
      });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchField(event.target.value);
  };

  const handlePokemonSelect = (pokemon: Pokemon) => {
    fetchPokemonDetails(pokemon);
  };

  const filteredPokemon = searchField.length === 0
    ? pokemonList
    : pokemonList.filter(pokemon => pokemon.name.toLowerCase().includes(searchField.toLowerCase()));

  return (
    <div className="App">
      <h1>Pokédex</h1>
      <input
        type="text"
        placeholder="Search Pokemon"
        onChange={handleSearchChange}
      />
      {loading ? <p>Loading Pokemon...</p> : (
        <ul>
          {filteredPokemon.map(pokemon => (
            <li key={pokemon.name} onClick={() => handlePokemonSelect(pokemon)}>
              {pokemon.name}
            </li>
          ))}
        </ul>
      )}
      {selectedPokemon && (
        <div>
          <h2>{selectedPokemon.name}</h2>
          <img src={selectedPokemon.image} alt={selectedPokemon.name} />
          <p><strong>Types:</strong> {selectedPokemon.types.join(', ')}</p>
          <p><strong>Description:</strong> {selectedPokemon.description}</p>
        </div>
      )}
    </div>
  );
};

export default App;