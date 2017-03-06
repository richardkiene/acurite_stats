# acurite_stats
Exposes Prometheus gauages collected from an AcuRite Professional Weather Center.

## Usage
```
$ node index.js
usage: node index.js [OPTIONS]
options:
    --version             Print tool version and exit.
    -h, --help            Print this help and exit.
    -f FILE, --file=FILE  File to process.
    -p INT, --port=INT    port to listen on.


$ node index.js --file=/path/to/acuriteweather.CSV --port=9163
```

## Exposed metrics
* Outdoor Temp *gauge*
* Outdoor Humidity  *gauge*
* Dew Point  *gauge*
* Heat Index  *gauge*
* Wind Chill  *gauge*
* Barometric Pressure  *gauge*
* Rain  *gauge*
* Wind Speed  *gauge*
* Wind Average  *gauge*
* Peak Wind  *gauge*
* Wind Direction  *gauge*
* Indoor Temp  *gauge*
* Indoor Humidity  *gauge*

## Example Prometheus config snippet
```
- job_name: 'acurite_stats'
  scrape_interval: 300s
  static_configs:
    - targets: ['127.0.0.1:9163']
```

## Assumptions
* Acurite receiver is configured to use Imperial units of measure
* Acurite PC Connect is configured to append to a single file
* Acurite weather station is a 5-1 Professional Weather Center

## Future
* Support other types of Acurite weather stations
* Support configurable units of measure
