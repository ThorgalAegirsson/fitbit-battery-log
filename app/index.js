import { battery, charger } from 'power';
import { display } from 'display';
import { me } from 'appbit';
import clock from 'clock';
import document from 'document';
import * as fs from 'fs';
import { convertDate, chargeColor, updateLastChargedDateField } from './utils';

// DOM refs
const batteryValue = document.getElementById('batteryValue');
const batteryCharge = document.getElementById('batteryCharge');
const connectState = document.getElementById('connectState');
const lastChargedDateField = document.getElementById('lastChargedDate');
const timeSinceLastCharge = document.getElementById('timeSinceLastCharge');
const container = document.getElementById("container");

const BATTERY_WIDTH = 141;
// Get the selected index
let currentIndex = container.value;
// Set the selected index
container.value = 0; // jump to first slide
clock.granularity = 'minutes';
let connectDate = null;
let saveInterval = null;

const updateChargeInfo = e => {
    let now = e ? e.date.valueOf() : new Date().valueOf();
    lastChargedDateField.text = updateLastChargedDateField(new Date(connectDate));
    const [day, hr, min] = convertDate(now - connectDate);
    timeSinceLastCharge.text = charger.connected ? `Charging...` : `${day}d ${hr}h ${min}m`;
}

// init first page
batteryValue.text = `${battery.chargeLevel}%`;
batteryCharge.width = BATTERY_WIDTH * battery.chargeLevel / 100;
batteryCharge.style.fill = chargeColor(battery.chargeLevel);
connectState.text = charger.connected ? charger.powerIsGood ? 'Plugged in, charging' : 'Plugged in, not charging' : 'Unplugged';

//init second page
try {
    connectDate = fs.readFileSync('lastCharged.txt', 'cbor');
} catch (e) {
    console.error('there was an error reading "lastCharged" file:');
    console.error(e);
}

if (connectDate) {
    updateChargeInfo();
}

clock.ontick = e => {
    if (charger.connected) connectDate = new Date();
    if (connectDate) updateChargeInfo(e);
};

const checkChargerConnectState = () => {
    connectState.text = charger.connected ? charger.powerIsGood ? 'Plugged in, charging' : 'Plugged in, not charging' : 'Unplugged';
    if (charger.connected) {
        // save the date to a file on the device, later utilize companion and/or cloud
        saveInterval = setInterval(() => {
            connectDate = new Date();
            fs.writeFileSync('lastCharged.txt', connectDate.valueOf(), 'cbor');
        }, 5000);
        me.appTimeoutEnabled = false;
        //BELOW WILL BE AN OPTION FOR USER TO SET UP:
        // display.autoOff = false;
        // setInterval(() => { display.poke(); console.log('POKE') }, 5000);
    }
    timeSinceLastCharge.text = `Charging...`;
}

// UPDATE battery info
battery.onchange = evt => {
    batteryValue.text = `${battery.chargeLevel}%`;
    batteryCharge.width = BATTERY_WIDTH * battery.chargeLevel / 100;
    chargeColor(battery.chargeLevel); // do I need it here? Or is it updated from init first page section?
};

// UPDATE charging info
charger.onchange = evt => {
    checkChargerConnectState();
    if (!charger.connected) {
        clearInterval(saveInterval);
        // save the date to a file on the device, later utilize companion and/or cloud
        connectDate = new Date();
        fs.writeFileSync('lastCharged.txt', connectDate.valueOf(), 'cbor');
        me.appTimeoutEnabled = true;
        lastChargedDateField.text = updateLastChargedDateField(connectDate);
    }
};

checkChargerConnectState();
