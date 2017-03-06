var mod_assert = require('assert-plus');
var mod_stream = require('stream');
var mod_util = require('util');

function Updater(opts) {
    mod_stream.Writable.call(this, { objectMode: false, highWaterMark: 16 });

    mod_assert.object(opts, 'opts');
    mod_assert.object(opts.log, 'opts.log');

    this.log = opts.log;
    this.gauges = opts.gauges;
}
mod_util.inherits(Updater, mod_stream.Writable);

Updater.prototype._write = function _write(buffer, encoding, cb) {
    var self = this;
    var gauges = self.gauges;
    var str = buffer.toString();
    var str = str.replace(/(^|[^\n])\n(?!\n)/g, '$1'); /* remove newline */
    var str = str.replace(/['"]+/g, ''); /* remove double quotes */
    var values = str.split(',');

    self.log.debug({ vals_array: values }, 'raw gauge data');

    /*
     * Each line represented by the buffer is actually a CSV text line.
     * The following key is used to define each position in the split array:
     *
     * Position 0: Timestamp (date)
     * Position 1: Outdoor Temp (number) *gauge*
     * Position 2: Outdoor Humidity (number) *gauge*
     * Position 3: Dew Point (number) *gauge*
     * Position 4: Heat Index (number) *gauge*
     * Position 5: Wind Chill (number) *gauge*
     * Position 6: Barometric Pressure (number) *gauge*
     * Position 7: Rain (number) *gauge*
     * Position 8: Wind Speed (number) *gauge*
     * Position 9: Wind Average (number) *gauge*
     * Position 10: Peak Wind (number) *gauge*
     * Position 11: Wind Direction (number) *gauge*
     * Position 12: Indoor Temp (number) *gauge*
     * Position 13: Indoor Humidity (number) *gauge*
     *
     */
    gauges.outdoorTemp.set(parseFloat(values[1]));
    gauges.outdoorHumidity.set(parseFloat(values[2]));
    gauges.dewPoint.set(parseFloat(values[3]));
    gauges.heatIndex.set(parseFloat(values[4]));
    gauges.windChill.set(parseFloat(values[5]));
    gauges.barometricPressure.set(parseFloat(values[6]));
    gauges.rain.set(parseFloat(values[7]));
    gauges.windSpeed.set(parseFloat(values[8]));
    gauges.windAverage.set(parseFloat(values[9]));
    gauges.windPeak.set(parseFloat(values[10]));
    gauges.windDirection.set(parseFloat(values[11]));
    gauges.indoorTemp.set(parseFloat(values[12]));
    gauges.indoorHumidity.set(parseFloat(values[13]));

    cb();
};

module.exports = Updater;
