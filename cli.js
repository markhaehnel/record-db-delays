#!/usr/bin/env node
'use strict'

const mri = require('mri')
const pkg = require('./package.json')

const argv = mri(process.argv.slice(2), {
	boolean: ['help', 'h', 'version', 'v', 'quiet', 'q']
})

if (argv.help || argv.h) {
	process.stdout.write(`
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
\n`)
	process.exit(0)
}

if (argv.version || argv.v) {
	process.stdout.write(`record-db-delays v${pkg.version}\n`)
	process.exit(0)
}

const showError = (err) => {
	console.error(err)
	process.exit(1)
}

const cmd = argv._[0]
const dbPath = argv.db || argv.d || 'db-delays.ldb'

if (cmd === 'export-sql') {
	const {Transform} = require('stream')
	const exportSql = require('hafas-record-delays/export-sql')
	const pump = require('pump')

	const out = new Transform({
		transform: (sqlQuery, _, cb) => {
			cb(null, Buffer.from(sqlQuery + '\n', 'utf8'))
		}
	})

	exportSql(dbPath, out)
	pump(out, process.stdout, showError)
} else if (cmd === 'record' || !cmd) {
	const {readFileSync} = require('fs')
	const dbStations = require('db-stations')
	const {isatty} = require('tty')
	const differ = require('ansi-diff-stream')
	const esc = require('ansi-escapes')
	const record = require('.')

	let stations = argv.stations || argv.s
	if (stations) {
		stations = 'string' === typeof stations ? stations.split(',') : [stations + '']
		const nr = /^\d+$/
		for (let station of stations) {
			if (!nr.test(station)) showError('Every station ID must be a number.')
		}
	} else if (argv['stations-file']) {
		stations = JSON.parse(fs.readFileSync(argv['stations-file']), {encoding: 'utf8'})
	} else stations = dbStations('all').map(s => s.id)

	let interval = argv.interval || argv.i
	if (interval) {
		interval = parseInt(interval) * 1000
		if (Number.isNaN(interval)) showError('Interval musst be a number.')
	} else interval = 30 * 1000

	const recording = record(stations, interval, dbPath)
	recording.on('error', (err) => {
		if (!err.isHafasError || process.env.NODE_DEBUG === 'record-db-delays') {
			console.error(err)
		} else console.error(err && err.message || (err + ''))
	})
	process.once('beforeExit', () => recording.stop())

	if (!argv.quiet && !argv.q) {
		const clearReports = isatty(process.stderr.fd)

		let reporter = process.stderr
		if (clearReports) {
			reporter = differ()
			reporter.pipe(process.stderr)
			recording.on('error', () => {
				process.stderr.write('\n')
				reporter.reset()
			})
		}

		const report = ({reqs, departures, avgDuration}) => {
			reporter.write([
				reqs + (reqs === 1 ? ' request' : ' requests'),
				departures + (departures === 1 ? ' departure' : ' departures'),
				'~ ' + Math.round(avgDuration) + ' ms/req'
			].join(', ') + (clearReports ? '' : '\n'))
		}
		recording.on('stats', report)
	}
} else showError('Missing or invalid command.')
