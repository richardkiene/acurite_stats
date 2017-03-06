var mod_bunyan = require('bunyan');
var mod_dashdash = require('dashdash');
var mod_promClient = require('prom-client');
var mod_restify = require('restify');
var mod_sliceFile = require('slice-file');

var lib_updater = require('./lib/updater');

var log = mod_bunyan.createLogger({
    name: 'acurite_stats',
    serializers: mod_restify.bunyan.serializers
});

var options = [
    {
        name: 'version',
        type: 'bool',
        help: 'Print tool version and exit.'
    },
    {
        names: ['help', 'h'],
        type: 'bool',
        help: 'Print this help and exit.'
    },
    {
        names: ['file', 'f'],
        type: 'string',
        help: 'File to process',
        helpArg: 'FILE'
    },
    {
        names: ['port', 'p'],
        type: 'integer',
        help: 'port to listen on',
        helpArg: 'INT'
    }
];

var gauges = {
    outdoorTemp: new mod_promClient.Gauge(
            'acurite_outdoor_temperature_fahrenheit',
            'Outdoor sensor temperature in degrees fahrenheit'),
    outdoorHumidity: new mod_promClient.Gauge(
            'acurite_outdoor_humidity_percent',
            'Outdoor sensor humidity expressed as a percentage'),
    dewPoint: new mod_promClient.Gauge(
            'acurite_dew_point_fahrenheit',
            'Dew point temperature in degrees fahrenheit'),
    heatIndex: new mod_promClient.Gauge(
            'acurite_heat_index_fahrenheit',
            'Outdoor heat index temperature in degrees fahrenheit'),
    windChill: new mod_promClient.Gauge(
            'acurite_wind_chill_fahrenheit',
            'Wind chill temperature in degrees fahrenheit'),
    barometricPressure: new mod_promClient.Gauge(
            'acurite_barometric_pressure_inhg',
            'Barometric pressure expressed as inHg'),
    rain: new mod_promClient.Gauge(
            'acurite_rain_inches_today',
            'Single day rain fall expressed in inches'),
    windSpeed: new mod_promClient.Gauge(
            'acurite_wind_speed_mph',
            'Wind speed in miles per hour'),
    windAverage: new mod_promClient.Gauge(
            'acurite_average_wind_speed_mph',
            'Average wind speed in miles per hour'),
    windPeak: new mod_promClient.Gauge(
            'acurite_peak_wind_speed_mph',
            'Peak wind speed in miles per hour'),
    windDirection: new mod_promClient.Gauge(
            'acurite_wind_direction_degrees',
            'Wind direction expressed as degrees 0 - 359'),
    indoorTemp: new mod_promClient.Gauge(
            'acurite_indoor_temperature_fahrenheit',
            'Indoor sensor temperature in degrees fahrenheit'),
    indoorHumidity: new mod_promClient.Gauge(
            'acurite_indoor_humidity_percent',
            'Indoor sensor humidity expressed as a percentage')
};

var parser = mod_dashdash.createParser({ options: options});

var server = mod_restify.createServer({ name: 'acurite_stats' });

function _showHelp () {
    var help = parser.help({ includeEnv: true }).trimRight();
    console.log('usage: node index.js [OPTIONS]\noptions:\n' + help);
    process.exit(0);
}

try {
    var opts = parser.parse(process.argv);
} catch (e) {
    console.error('error: %s', e.message);
    process.exit(1);
}

if (opts.help) {
    _showHelp();
} else if (opts.file && opts.port) {
    var tailFile = mod_sliceFile(opts.file);
    var updater = new lib_updater({
        gauges: gauges,
        server: opts.server,
        log: log
    });

    tailFile.follow(-1).pipe(updater);

    server.get('/metrics', function (req, res, next) {
        res.header('content-type', 'text/plain');
        res.send(mod_promClient.register.metrics());
        next();
    });

    server.listen(opts.port);
} else {
    _showHelp();
}
