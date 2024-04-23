import React, { Component, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";

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

interface PokedexState {
    pokemonList: Pokemon[];
    searchField: string;
    selectedPokemon: PokemonDetails | null;
    loading: boolean;
}

interface ApiPokemon {
    id: number;
    name: string;
    sprites: { front_default: string };
    types: Array<{ type: { name: string } }>;
}

interface ApiPokemonType {
    type: {
        name: string;
    };
}

interface flavText {
    flavor_text: string;
    language: {
        name: string;
    };
}

interface ApiSpecies {
    flavor_text: flavText[];
}

class Pokedex extends Component<{}, PokedexState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            pokemonList: [],
            searchField: '',
            selectedPokemon: null,
            loading: true
        };
    }

    componentDidMount() {
        axios.get("https://pokeapi.co/api/v2/pokemon?limit=151")
            .then(response => {
                this.setState({ pokemonList: response.data.results, loading: false });
            })
            .catch(error => {
                console.error("Error occurred while fetching data: ", error);
                this.setState({ loading: false });
            });
    }

    fetchPokemonDetails = (pokemon: Pokemon) => {
        this.setState({ loading: true });
        axios.get(pokemon.url)
            .then(response => {
                const { id, name, sprites, types } = response.data as ApiPokemon;
                this.fetchPokemonSpecies(
                    id, 
                    name, 
                    sprites.front_default, 
                    types.map((type: ApiPokemonType) => type.type.name) // Explicit type for type
                );
            })
            .catch(error => {
                console.error("Error occurred while fetching Pokemon details: ", error);
                this.setState({ loading: false });
            });
    };
    
    fetchPokemonSpecies = (id: number, name: string, image: string, types: string[]) => {
        axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}/`)
            .then(response => {
                const speciesData = response.data as ApiSpecies;
                const description = speciesData.flavor_text.find(
                    (entry: flavText) => entry.language.name === 'en'
                )!.flavor_text; // Explicit type for entry and use of non-null assertion operator (!)
                this.setState({
                    selectedPokemon: { id, name, image, types, description },
                    loading: false
                });
            })
            .catch(error => {
                console.error("Error occurred while fetching Pokemon species: ", error);
                this.setState({ loading: false });
            });
    };

    
    handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ searchField: event.target.value });
    };

    handleSelectedPokemon = (pokemon: Pokemon) => {
        this.fetchPokemonDetails(pokemon);
    };

    render(): ReactNode {
        const { pokemonList, searchField, selectedPokemon, loading } = this.state;
        const filteredPokemon = pokemonList.filter(pokemon => pokemon.name.toLowerCase().includes(searchField.toLowerCase()));

        return (
            <div>
                <h1>Pokédex</h1>
                <input
                    type="text"
                    placeholder="Search Pokemon"
                    onChange={this.handleSearch}
                />
                {loading ? <p>Loading Pokemon...</p> : (
                    <ul>
                        {filteredPokemon.map(pokemon => (
                            <li key={pokemon.name} onClick={() => this.handleSelectedPokemon(pokemon)}>
                                {pokemon.name}
                            </li>
                        ))}
                    </ul>
                )}
                {selectedPokemon && <div>
                    <h2>{selectedPokemon.name}</h2>
                    <img src={selectedPokemon.image} alt={selectedPokemon.name} />
                    <p><strong>Types:</strong> {selectedPokemon.types.join(', ')}</p>
                    <p><strong>Description:</strong> {selectedPokemon.description}</p>
                </div>}
            </div>
        );
    }
}

const rootElem = document.getElementById('root');

if (!rootElem) {
    alert('You forgot to put a root element in your HTML file.');
} else {
    const root = createRoot(rootElem);
    root.render(
        <React.StrictMode>
            <Pokedex />
        </React.StrictMode>
    );
}