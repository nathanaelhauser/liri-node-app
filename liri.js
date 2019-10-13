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
      axios.get('https://rest.bandsintown.com/artists/maroon+5/events?app_id=codingbootcamp')
        .then(r => {
          r.data.forEach(x => {
            console.log(`Venue Name: ${x.venue.name}`)
            console.log(`Venue Location: ${x.venue.city}, ${x.venue.region}, ${x.venue.country}`)
            console.log(`Event Date: ${moment(x.datetime, 'YYYY-MM-DDTHH:mm:ss').format('MM/DD/YYYY')}`)
          })
        })
        .catch(e => console.error(e))
        .finally(_ => {
          console.log('finally')
        })
      break
    default:
      break
  }
} else {
  console.log('I need to know what to do.')
}