import { battery, charger } from 'power';
import { display } from 'display';
import { me as device } from 'device';
import { me } from 'appbit';
import clock from 'clock';
import document from 'document';
import * as fs from 'fs';
import * as messaging from 'messaging';
import { convertDate, chargeColor, updateLastChargedDateField } from './utils';

// DOM refs
const batteryValue = document.getElementById('batteryValue');
const batteryCharge = document.getElementById('batteryCharge');
const connectState = document.getElementById('connectState');
const lastChargedDateField = document.getElementById('lastChargedDate');
const timeSinceLastCharge = document.getElementById('timeSinceLastCharge');
const container = document.getElementById("container");

// Get the selected index
let currentIndex = container.value;
// Set the selected index
container.value = 0; // jump to first slide
clock.granularity = 'minutes';

if (!device.screen) device.screen = { width: 348, height: 250 }
const BATTERY_WIDTH = device.screen.width === 300 ? 200 : 139;

let connectDate = null;
let saveInterval = null;
let displayOn = false;

messaging.peerSocket.onmessage = e => {
    if (e.data.key === 'toggle') {
        // cancel interval so it's not recreated
        clearInterval(saveInterval);
        displayOn = e.data.value;
        checkChargerConnectState();
    }
    if (e.data.key === 'fontColor') {
        document.getElementsByTagName('text').forEach(element => element.style.fill = JSON.parse(e.data.value));
    }
}

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
        }, 30000);
        me.appTimeoutEnabled = false;
        //BELOW WILL BE AN OPTION FOR USER TO SET UP:
        if (displayOn) {
            console.log('display is on');
            display.autoOff = false;
            setInterval(() => display.poke(), 5000);
        } else {
            console.log('display is off');
        }
        timeSinceLastCharge.text = `Charging...`;
    }
}

// UPDATE battery info
battery.onchange = evt => {
    batteryValue.text = `${battery.chargeLevel}%`;
    batteryCharge.width = BATTERY_WIDTH * battery.chargeLevel / 100;
    batteryCharge.style.fill = chargeColor(battery.chargeLevel);
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
