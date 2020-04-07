// endpoint constants
const BASE_URL = "http://localhost:3000"
const TRAINERS_URL = `${BASE_URL}/trainers`
const POKEMONS_URL = `${BASE_URL}/pokemons/`

// I have also included a handy catch for our fetches
const catchError = err => console.warn('Something went wrong, is your server on?', err)

// get the main container since we'll want to use that
const main = document.querySelector('main')

// This fetch gets all the trainers and their pokemon
const getAllTrainers = () => fetch(TRAINERS_URL)
.catch(catchError)

// This fetch sends a delete request
const deletePokemon = id => fetch(POKEMONS_URL + id, {method: 'DELETE'})
.catch(catchError)

// This fetch adds a pokemon to the database
const createPokemon = trainerId => fetch(POKEMONS_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accepts': 'application/json'
  },
  body: JSON.stringify({"trainer_id": trainerId})
})
.catch(catchError)

// this will append a pokemon to a pokemonList (<ul>), I've created a helper function to seperate concerns and since this will be used more than once
const appendPokemon = (pokemon, pokemonList) => {
  const li = document.createElement('li')
  li.insertAdjacentHTML('afterbegin', `${pokemon.nickname} (${pokemon.species}) <button class='release' data-pokemon-id="${pokemon.id}">Release</button>`)
  // I've chosen to create the <li>'s using .insertAdjacentHTML, this is just one way of doing it
  pokemonList.append(li)
}

// this function will load up a trainer for us
const appendTrainer = trainer => {
  // create the card that will hold our trainer data
  const div = document.createElement('div')
  div.className = 'card'
  div.dataset.id = trainer.id

  // create the add-pokemon button
  const addPokemonButton = document.createElement('button')
  addPokemonButton.className = 'add-pokemon'
  addPokemonButton.dataset.id = trainer.id
  addPokemonButton.insertAdjacentText('beforeend', 'Add Pokemon')

  // give the trainer a name
  const nameTag = document.createElement('p')
  nameTag.insertAdjacentText('beforeend', trainer.name)

  // give the trainer a <ul> to hold all their pokemon in
  const pokemonList = document.createElement('ul')

  // and then iterate through the pokemon and add them
  trainer.pokemons.forEach(pokemon => appendPokemon(pokemon, pokemonList))

  // finally we put everything together
  div.append(nameTag)
  div.append(addPokemonButton)
  div.append(pokemonList)
  main.append(div)
}

// we'll create a function to get all trainers
const appendAllTrainers = () => {
  // first we get all the trainers, then append them
  getAllTrainers()
  .then(res => res.json())
  .then(trainers => trainers.forEach(appendTrainer))
}

// I've created helper functions for the handleButtonClick function just to seperate responsibilities a little more
const releasePokemon = event => {
  // pokemon get removed pessimistically (wait until the server responds and has deleted them)
  deletePokemon(event.target.dataset.pokemonId)
  .then(res => event.target.parentNode.remove())
}

const addPokemon = event => {
  createPokemon(event.target.dataset.id)
  .then(res => res.json())
  .then(pokemon => appendPokemon(pokemon, event.target.nextSibling))
  // appendPokemon takes in two arguments if you remember, in this case the parsed pokemon and then <ul> which just happens to be an adjacent sibling
}

const handleButtonClick = event => {
  // first we'll add the release button since it's easy
  if (event.target.className === 'release') {
    releasePokemon(event)
  }

  // and then the add-pokemon button
  // we specifically need to make sure a team only has 6 pokemon so we'll make sure there are less than 6 children in the <ul>
  else if (event.target.className === 'add-pokemon' && event.target.nextSibling.children.length < 6) {
    addPokemon(event)
  }
}

// we'll add our trainers
appendAllTrainers()

// and then our event listeners
document.addEventListener('click', handleButtonClick)
