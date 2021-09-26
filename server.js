const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const fs = require('fs');

// API key in private .env file to secure credentials
const api_key = process.env['API_KEY'];

// Visual Crossing weather API urls
const historyUrl = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/Boston/last90days?key=' + api_key;

const forecastUrl = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/Boston?unitGroup=us&key=' + api_key;

const currentUrl = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/weatherdata/forecast?aggregateHours=24&contentType=json&unitGroup=us&locationMode=single&key=' + api_key + '&locations=Boston';

const app = express();

// Load middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Domain whitelist for client apps
app.use((req, res, next) => {
    const whitelist = [
        'https://cdpn.io',
        'https://pmbaker712.github.io'
    ];
    if (whitelist.indexOf(req.headers.origin) !== -1) {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    }

    next();
});

// Listen on port 3000
app.listen(3000, () => {
    console.log('Listening!');
});

// Get and store data from Visual Crossing API on a 15-minute interval
function saveJson(url, file) {

    function getJson() {

        request(url, (error, res, body) => {
            if (error) {
                return console.log(error)
            };

            if (!error && res.statusCode == 200) {

                fs.writeFileSync(file + '.json', body);
                console.log(file + '.json saved');
            };
        });
    };

    // Get and save data immediately
    getJson();

    // Get and save data every 15 minutes
    setInterval(function() {
        getJson();
    }, 15 * 60000);

};

saveJson(historyUrl, 'history');
saveJson(forecastUrl, 'forecast');
saveJson(currentUrl, 'current');

// Serve data to client apps
function serveJson(file) {

    app.get('/' + file, (req, res) => {

        fs.readFile('./' + file + '.json', 'utf8', (err, data) => {

            res.json(JSON.parse(data));
            console.log(file + '.json sent')
        });
    });
};

serveJson('history');
serveJson('forecast');
serveJson('current');

// API root endpoint
app.get('/', (req, res) => {

    res.sendFile(__dirname + '/public/api.html');

});
