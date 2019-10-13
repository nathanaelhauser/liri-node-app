require("dotenv").config()
const Spotify = require('node-spotify-api')
const keys = require("./keys.js")
const axios = require('axios')
const fs = require('fs')
const moment = require('moment')

let spotify = new Spotify(keys.spotify)

const print = str => {
  console.log(str)
  fs.appendFile('log.txt', str, e => console.log(e ? e : 'success'))
}

const concertThis = band => {
  // Grab information from bandsintown api
  axios.get(`https://rest.bandsintown.com/artists/${band ? band : 'Marshmellow'}/events?app_id=codingbootcamp`)
    .then(r => {
      // Loop through venues
      r.data.forEach(x => {
        print(`Venue Name: ${x.venue.name}`)
        print(`Venue Location: ${x.venue.city}, ${x.venue.region ? (x.venue.region + ', ') : ''}${x.venue.country}`)
        print(`Event Date: ${moment(x.datetime, 'YYYY-MM-DDTHH:mm:ss').format('MM/DD/YYYY')}`)
      })
    })
    .catch(e => console.error(e))
    .finally(_ => { })
}

const spotifyThisSong = song => {
  // Default to The Sign by Ace of Base if no song provided
  spotify.search({ type: 'track', query: song ? song : 'The Sign Ace of Base', limit: 1 })
    .then(r => {
      // Grab the first song spotify returned
      const song = r.tracks.items[0]
      // Combine all artist names
      let artists = ''
      song.artists.forEach(artist => {
        artists += artist.name + ', '
      })
      artists = artists.slice(0, artists.length - 2)
      print(`Artist(s): ${artists}`)
      print(`Name: ${song.name}`)
      print(`Preview: ${song.preview_url}`)
      print(`Album: ${song.album.name}`)
    })
    .catch(e => console.error(e))
}

const movieThis = movie => {
  // Search omdb using given text
  axios(`http://www.omdbapi.com/?apikey=e12f6339&s=${process.argv[3] ? process.argv[3] : 'Mr. Nobody'}`)
    .then(r => {
      // Obtain specific information using imdbID
      axios(`http://www.omdbapi.com/?apikey=e12f6339&i=${r.data.Search[0].imdbID}`)
        .then(r => {
          const movie = r.data
          print(`Title: ${movie.Title}`)
          print(`Year: ${movie.Year}`)
          print(`IMDB Rating: ${movie.Ratings[0].Source === 'Internet Movie Database' ? movie.Ratings[0].Value : 'N/A'}`)
          print(`Rotten Tomatoes Rating: ${movie.Ratings[1].Source === 'Rotten Tomatoes' ? movie.Ratings[1].Value : 'N/A'}`)
          print(`Country: ${movie.Country}`)
          print(`Language: ${movie.Language}`)
          print(`Plot: ${movie.Plot}`)
          print(`Actors: ${movie.Actors}`)
        })
        .catch(e => console.error(e))
    })
    .catch(e => console.error(e))
    .finally(_ => { })
}

const liriDoSomethingUseful = (action, data) => {
  switch (action) {
    case 'concert-this':
      concertThis(data)
      break
    case 'spotify-this-song':
      spotifyThisSong(data)
      break
    case 'movie-this':
      movieThis(data)
      break
    case 'do-what-it-says':
        fs.readFile('random.txt', 'utf8', (e, data) => {
          if (e) {
            console.log(e)
          }
          // Rearrange file input to usable data
          let args = data.split(',')
          args[1] = args[1].replace(/['"]/g, '')
          // Preform function based on first argument
          liriDoSomethingUseful( args[0], args[1])
        })
      break
    default:
      break
  }
}

fs.appendFile('log.txt', process.argv.join(' '), e => console.log(e ? e : 'success'))

if (process.argv[2]) {
  liriDoSomethingUseful( process.argv[2], process.argv[3])
} else {
  print('LIRI does not understand command.')
}