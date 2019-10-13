require("dotenv").config()
const Spotify = require('node-spotify-api')
const keys = require("./keys.js")
const axios = require('axios')
const fs = require('fs')
const moment = require('moment')

let spotify = new Spotify(keys.spotify)

if (process.argv[2]) {
  switch (process.argv[2]) {
    case 'concert-this':
      if (!process.argv[3]) {
        console.log('Need a band to search for!')
        break
      }
      axios.get(`https://rest.bandsintown.com/artists/${process.argv[3]}/events?app_id=codingbootcamp`)
        .then(r => {
          r.data.forEach(x => {
            console.log(`Venue Name: ${x.venue.name}`)
            console.log(`Venue Location: ${x.venue.city}, ${x.venue.region ? (x.venue.region+', ') : ''}${x.venue.country}`)
            console.log(`Event Date: ${moment(x.datetime, 'YYYY-MM-DDTHH:mm:ss').format('MM/DD/YYYY')}`)
          })
        })
        .catch(e => console.error(e))
        .finally(_ => {})
      break
    case 'spotify-this-song':
      spotify.search({ type: 'track', query: process.argv[3] ? process.argv[3] : 'The Sign Ace of Base', limit: 1 })
        .then(r => {
          const song = r.tracks.items[0]
          let artists = ''
          song.artists.forEach(artist => {
            artists += artist.name + ', '
          })
          artists = artists.slice(0, artists.length - 2)
          console.log(`Artist(s): ${artists}`)
          console.log(`Name: ${song.name}`)
          console.log(`Preview: ${song.preview_url}`)
          console.log(`Album: ${song.album.name}`)
        })
        .catch(e => console.error(e))
      break
    default:
      break
  }
} else {
  console.log('I need to know what to do.')
}