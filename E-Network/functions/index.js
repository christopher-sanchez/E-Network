
const functions = require("firebase-functions");
const axios = require("axios");
const cors = require("cors")({origin: true});

exports.getUpcomingMatches = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    const options = {
      method: 'GET',
      url: 'https://api.pandascore.co/matches/upcoming',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${functions.config().pandascore.token}`
      }
    };

    axios
      .request(options)
      .then(function (res) {
        response.json(res.data);
      })
      .catch(function (error) {
        console.error(error);
        response.status(500).send('Error fetching matches');
      });
  });
});
