# record-db-delays

**Record DB departures.**

[![npm version](https://img.shields.io/npm/v/record-db-delays.svg)](https://www.npmjs.com/package/record-db-delays)
![ISC-licensed](https://img.shields.io/github/license/markhaehnel/record-db-delays.svg)

## Installing

```shell
npm i -g record-db-delays
```

Or just use [npx](https://npmjs.com/package/npx):

```shell
record-db-delays --interval 10 --stations 900000100003,900000100001
```


## Usage

```shell
Usage:
    record-db-delays [command] [options]
Options:
	--db            -d  Path to LevelDB. Default: db-delays.ldb
	--stations      -s  Stations to monitor. Default: all
	--stations-file     JSON file with stations to monitor.
	--interval      -i  In seconds. Default: 30
	--quiet         -q  Don't show progress reports. Default: false
Examples:
    record-db-delays --db my-custom.leveldb -s 900000100003,900000100001
    record-db-delays --stations-file stations-to-monitor.json -q
    record-db-delays export-sql --db my-custom.leveldb
```

You can get station IDs using [`db-stations-cli`](https://github.com/derhuerst/db-stations-cli).

*Pro Tip:* Use [`screen`](https://www.gnu.org/software/screen/manual/screen.html#Invoking-Screen) to handle this long-running process.


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/record-db-delays/issues).
