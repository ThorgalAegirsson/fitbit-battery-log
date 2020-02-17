import { battery, charger } from 'power';
import { display } from 'display';
import { me as device } from 'device';
import { me } from 'appbit';
import clock from 'clock';
import document from 'document';
import * as fs from 'fs';
import { convertDate, chargeColor, updateLastChargedDateField } from './utils';
import * as settings from './device-settings';

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


const updateChargeInfo = e => {
    let now = e ? e.date.valueOf() : new Date().valueOf();
    lastChargedDateField.text = updateLastChargedDateField(new Date(connectDate));
    const [day, hr, min] = convertDate(now - connectDate);
    timeSinceLastCharge.text = charger.connected ? `Charging...` : `${day}d ${hr}h ${min}m`;
}

// ======== init first page ==========
batteryValue.text = `${battery.chargeLevel}%`;
batteryCharge.width = BATTERY_WIDTH * battery.chargeLevel / 100;
batteryCharge.style.fill = chargeColor(battery.chargeLevel);
connectState.text = charger.connected ? charger.powerIsGood ? 'Plugged in, charging' : 'Plugged in, not charging' : 'Unplugged';

// ======== init second page ==========
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

        if (displayOn) {
            console.log('[DISPLAY] is ON');
            display.autoOff = false;
            setInterval(() => display.poke(), 5000);
        } else {
            console.log('[DISPLAY] is OFF');
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
        updateChargeInfo();
    }
};

checkChargerConnectState();

// =========== SETTINGS ============= 
const settingsCallback = data => {
    if (!data) return;
    if (data.display) {
        // cancel interval so it's not recreated
        clearInterval(saveInterval);
        displayOn = data.display;
        checkChargerConnectState();
    }
    if (data.fontColor) {
        document.getElementsByTagName('text').forEach(element => element.style.fill = data.fontColor);
    }
}

settings.initialize(settingsCallback);