const updateNotifier = require('update-notifier');
const pkg = require('./package.json');
const log = require('node-time-log').SimpleLog;
const Chalk = require('chalk');
const meow = require('meow');

// This will notify the user to update the
// package if a new version is released
updateNotifier({ pkg }).notify();

// Main code //

const COMMAND_PAUSE = 'ssap://media.controls/pause';
const COMMAND_PLAY = 'ssap://media.controls/play';
const COMMAND_SET_VOLUME = 'ssap://audio/setVolume';
const COMMAND_SET_VOLUME_UP = 'ssap://audio/volumeUp';
const COMMAND_SET_VOLUME_DOWN = 'ssap://audio/volumeDown';
const COMMAND_TOAST = 'ssap://system.notifications/createToast';
const COMMAND_TURN_OFF = 'ssap://system/turnOff';
const COMMAND_LAUNCH = 'ssap://system.launcher/launch';
const COMMAND_CHANGE_INPUT = 'ssap://tv/switchInput';

const cli = meow(`
	Usage
	  $ foo <input>

	Options
	  --launch, -l  description
	  --volume, -v  description
	  --play, -p  description
	  --pause, -p  description
	  --off, -o  shuts the tv down

	Examples
	  $ foo unicorns --launch
	  🌈 unicorns 🌈
`, {
    alias: {
        l: 'launch'
    }
});

if (Object.keys(cli.flags).length === 0) {
    cli.showHelp(2);
    process.exit();
}

const lgtv = require("lgtv2")({
    url: 'ws://lgwebostv:3000'
});

function performRequest(command, params) {
    log(command)
    lgtv.request(command, params || {}, (err, res) => {
        if (err) {
            log(err);
        }

        if (res.returnValue === false) {
            log(Chalk.red(res.errorText));
        }

        lgtv.disconnect();
        process.exit();
    }, _);
}

function handleParams(key, value) {
    if (key.includes('volume')) {
        if (value === 'up') {
            performRequest(COMMAND_SET_VOLUME_UP);
        } else if (value === 'down') {
            performRequest(COMMAND_SET_VOLUME_DOWN);
        } else {
            performRequest(COMMAND_SET_VOLUME, { volume: value });
        }
    }

    if (key.includes('launch')) {
        performRequest(COMMAND_LAUNCH, { id: value });
    }

    if (key.includes('off')) {
        performRequest(COMMAND_TURN_OFF);
    }

    if (key.includes('play')) {
        performRequest(COMMAND_PLAY);
    }

    if (key.includes('pause')) {
        performRequest(COMMAND_PAUSE);
    }

    if (key.includes('input')) {
        performRequest(COMMAND_CHANGE_INPUT);
    }
}

lgtv.on('connect', () => {
    // log('connected');

    Object.keys(cli.flags).forEach(key => {
        handleParams(key, cli.flags[key]);
    });

    // lgtv.disconnect();
    // process.exit();

});