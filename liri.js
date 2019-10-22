require("dotenv").config()
const Spotify = require('node-spotify-api')
const keys = require("./keys.js")
const axios = require('axios')
const fs = require('fs')
const moment = require('moment')
const inquirer = require('inquirer')

let spotify = new Spotify(keys.spotify)

const errorLog = e => e ? console.log(e) : ''

const print = str => {
  console.log(str)
  fs.appendFile('log.txt', str + '\n', errorLog)
}

const concertThis = band => {
  // Grab information from bandsintown api
  axios.get(`https://rest.bandsintown.com/artists/${band ? band : 'Marshmellow'}/events?app_id=codingbootcamp`)
    .then(r => {
      if (r.data.length < 1) {
        print('No scheduled events for artist.')
      } else {
        print('-------------------------------------')
        // Loop through venues and print them
        r.data.forEach(({ venue, datetime }) => {
          print(`Performing in ${venue.name} at ${venue.city}, ${venue.region ? (venue.region + ', ') : ''}${venue.country} on ${moment(datetime, 'YYYY-MM-DDTHH:mm:ss').format('MM/DD/YYYY')}`)
        })
        print('-------------------------------------')
      }

    })
    .catch(errorLog)
    .finally(_ => { })
}

const spotifyThisSong = song => {
  // Default to The Sign by Ace of Base if no song provided
  spotify.search({ type: 'track', query: song ? song : 'The Sign Ace of Base', limit: 1 })
    .then(({ tracks: { total, items: songs } }) => {
      if (total < 1) {
        print('That is not a song, try again!')
      } else {
        // Grab the first song spotify returned
        const song = songs[0]
        // Combine all artist names
        const artistNames = song.artists.reduce((result, artist) => result ? `${result}, ${artist.name}` : artist.name, '')
        print('-------------------------------------')
        print(`Artist(s): ${artistNames}`)
        print(`Name: ${song.name}`)
        print(`Preview: ${song.preview_url}`)
        print(`Album: ${song.album.name}`)
        print('-------------------------------------')
      }
    })
    .catch(errorLog)
}

const movieThis = movie => {
  // Search omdb using given text
  axios(`http://www.omdbapi.com/?apikey=e12f6339&s=${movie ? movie : 'Mr. Nobody'}`)
    .then(r => {
      if (!r.data.Search) {
        print('No such movie, try again!')
      } else {
        // Obtain specific information using imdbID
        axios(`http://www.omdbapi.com/?apikey=e12f6339&i=${r.data.Search[0].imdbID}`)
          .then(({ data: movie }) => {
            print('-------------------------------------')
            print(`Title: ${movie.Title}`)
            print(`Year: ${movie.Year}`)
            print(`IMDB Rating: ${movie.Ratings[0].Source === 'Internet Movie Database' ? movie.Ratings[0].Value : 'N/A'}`)
            print(`Rotten Tomatoes Rating: ${movie.Ratings[1].Source === 'Rotten Tomatoes' ? movie.Ratings[1].Value : 'N/A'}`)
            print(`Country: ${movie.Country}`)
            print(`Language: ${movie.Language}`)
            print(`Plot: ${movie.Plot}`)
            print(`Actors: ${movie.Actors}`)
            print('-------------------------------------')
          })
          .catch(errorLog)
      }
    })
    .catch(errorLog)
    .finally(_ => { })
}

const liriDoSomethingUseful = (command, option) => {
  switch (command) {
    case 'concert-this':
    case 'Concert This':
      concertThis(option)
      break
    case 'spotify-this-song':
    case 'Spotify This Song':
      spotifyThisSong(option)
      break
    case 'movie-this':
    case 'Movie This':
      movieThis(option)
      break
    case 'Do What It Says':
      fs.readFile('random.txt', 'utf8', (e, data) => {
        errorLog(e)
        // Make file input usable data
        let args = data.split(',')
        args[1] = args[1].replace(/['"]/g, '')
        print(`
            /////////////////////////////////////
            // Do What It Says
            // ${args[0]} -- ${args[1]}
            /////////////////////////////////////
          `)

        // Preform function based on first argument
        liriDoSomethingUseful(args[0], args[1])
      })
      break
    default:
      break
  }
}

fs.appendFile('log.txt', process.argv.join(' ') + '\n',errorLog)

inquirer
  .prompt({
    type: 'list',
    name: 'command',
    message: 'What would you like to do?',
    choices: ['Concert This', 'Spotify This Song', 'Movie This', 'Do What It Says']
  })
  .then(({ command }) => {
    if (command !== 'Do What It Says') {
      const search = command[0] === 'C' ? 'band' : (command[0] === 'S' ? 'song' : 'movie')
      optionSearch = `What ${search} should I search for?`
      inquirer.prompt({
        type: 'input',
        name: 'option',
        message: optionSearch
      })
        .then( ({ option }) => { 
          print(`
            /////////////////////////////////////
            // ${command} -- ${option}
            /////////////////////////////////////
          `)
          liriDoSomethingUseful(command, option)
        })
        .catch(errorLog)
    } else {
      liriDoSomethingUseful(command)
    }
  })
  .catch(errorLog)