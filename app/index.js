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
let chargerStartState = charger.connected; // set to distinguish the first charger events

console.log('=== APP INIT ===');
console.log(`charger connected: ${charger.connected}`);
console.log(`charger power is good: ${charger.powerIsGood}`);


// init first page
batteryValue.text = `${battery.chargeLevel}%`;
batteryCharge.width = BATTERY_WIDTH * battery.chargeLevel / 100;
batteryCharge.style.fill = chargeColor(battery.chargeLevel);
// chargeColor(battery.chargeLevel);
connectState.text = charger.connected ? charger.powerIsGood ? 'Plugged in, charging' : 'Plugged in, not charging' : 'Unplugged';

//init second page
try {
    connectDate = fs.readFileSync('lastCharged.txt', 'cbor');
} catch (e) {
    console.error('there was an error reading "lastCharged" file:');
    console.error(e);
}
if (connectDate) {
    console.log('connectDate read from file');
    let now = new Date().valueOf();
    lastChargedDateField.text = updateLastChargedDateField(new Date(connectDate));
    let [day, hr, min] = convertDate(now - connectDate);
    // timeSinceLastCharge.text = `${day} ${day === 1 ? 'day' : 'days'} ${hr} ${hr === 1 ? 'hr' : 'hrs'} : ${min} ${min === 1 ? 'min' : 'mins'}`;
    timeSinceLastCharge.text = `${day}d ${hr}h ${min}m`;
}

clock.ontick = e => {
    if (connectDate) {
        let now = e.date.valueOf();
        lastChargedDateField.text = updateLastChargedDateField(new Date(connectDate));
        let [day, hr, min] = convertDate(now - connectDate);
        timeSinceLastCharge.text = `${day}d ${hr}h ${min}m`;
    }
};

const checkChargerConnectState = () => {
        console.log(`[CHARGER] charger connected: ${charger.connected}`);
        // if (charger.connected === chargerStartState) {
        //     // first change event fires when the app starts but only on the simulator as it seems - it must be a bug
        //     //this part does not affect the real device
        //     console.log('[CHARGER] first charger event canceled');
        //     chargerStartState = null;
        //     return;
        // }
        connectState.text = charger.connected ? charger.powerIsGood ? 'Plugged in, charging' : 'Plugged in, not charging' : 'Unplugged';
        
        if (charger.connected) {
            // save the date to a file on the device, later utilize companion and/or cloud
            connectDate = new Date();
            fs.writeFileSync('lastCharged.txt', connectDate.valueOf(), 'cbor');
            me.appTimeoutEnabled = false;
            display.autoOff = false;
            setInterval(() => { display.poke(); console.log('POKE') }, 1000);
        }
        timeSinceLastCharge.text = `0d 00h 00m`;
        console.log('app timeout: ', me.appTimeoutEnabled);

}

// UPDATE battery info
battery.onchange = evt => {
    batteryValue.text = `${battery.chargeLevel}%`;
    batteryCharge.width = BATTERY_WIDTH * battery.chargeLevel / 100;
    chargeColor(battery.chargeLevel);
};

// UPDATE charging info
charger.onchange = evt => {
    console.log(' ==== CHARGER STATE CHANGED ==== ');
    checkChargerConnectState();
    if (!charger.connected) {
        // save the date to a file on the device, later utilize companion and/or cloud
        connectDate = new Date();
        fs.writeFileSync('lastCharged.txt', connectDate.valueOf(), 'cbor');
        me.appTimeoutEnabled = true;
        //update date and time in GUI
        lastChargedDateField.text = updateLastChargedDateField(connectDate);
    }
};

checkChargerConnectState();
