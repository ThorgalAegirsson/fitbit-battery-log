import { battery, charger } from 'power';
import clock from 'clock';
import document from 'document';
import * as fs from 'fs';


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

const convertDate = time => {
    let cd = 24 * 60 * 60 * 1000,
        ch = 60 * 60 * 1000,
        days = Math.floor(time / cd),
        hrs = Math.floor((time - days * cd) / ch),
        mins = Math.round((time - days * cd - hrs * ch) / 60000),
        pad = n => n < 10 ? '0' + n : n;

    if (mins === 60) {
        hrs++;
        mins = 0;
    }
    if (hrs === 24) {
        days++;
        hrs = 0;
    }
    return [days, pad(hrs), pad(mins)];
};
const updateLastChargedDateField = date => {
    lastChargedDateField.text = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}  ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`;
};

try {
    connectDate = fs.readFileSync('lastCharged.txt', 'cbor');
} catch (e) {
    console.error('there was an error reading "lastCharged" file:');
    console.error(e);
}
// init GUI
let chargerStartState = charger.connected; // set to distinguish the first charger events
batteryValue.text = `${battery.chargeLevel}%`;
batteryCharge.width = BATTERY_WIDTH*battery.chargeLevel/100;
connectState.text = charger.connected ? charger.powerIsGood ? 'Plugged in, charging' : 'Plugged in, not charging' : 'Unplugged';

if (connectDate) {
    console.log('connectDate read from file');
    let now = new Date().valueOf();
    updateLastChargedDateField(new Date(connectDate));
    let [day, hr, min] = convertDate(now-connectDate);
    // timeSinceLastCharge.text = `${day} ${day === 1 ? 'day' : 'days'} ${hr} ${hr === 1 ? 'hr' : 'hrs'} : ${min} ${min === 1 ? 'min' : 'mins'}`;
    timeSinceLastCharge.text = `${day}d ${hr}h ${min}m`;
}

clock.ontick = e => {
    if (connectDate) {
        let now = e.date.valueOf();
        updateLastChargedDateField(new Date(connectDate));
        let [day, hr, min] = convertDate(now - connectDate);
        timeSinceLastCharge.text = `${day}d ${hr}h ${min}m`;
    }
};


console.log('=== CHARGER ===');
console.log(`charger connected: ${charger.connected}`);
console.log(`charger power is good: ${charger.powerIsGood}`);

battery.onchange = evt => {
    batteryValue.text = `${battery.chargeLevel}%`;
    batteryCharge.width = BATTERY_WIDTH * battery.chargeLevel / 100;
};

charger.onchange = evt => {
    if (charger.connected === chargerStartState) {
        // first change event fires when the app starts but only on the simulator as it seems - it must be a bug
        //this part does not affect the real device
        console.log('first charger event canceled');
        chargerStartState = null;
        return;
    } else {
        console.log(`CHARGER charger connected: ${charger.connected}`);
        connectState.text = charger.connected ? charger.powerIsGood ? 'Plugged in, charging' : 'Plugged in, not charging' : 'Unplugged';
        if (!charger.connected) {
            connectDate = new Date();
            // save the date to a file on the device, later utilize companion and/or cloud
            fs.writeFileSync('lastCharged.txt', connectDate.valueOf(), 'cbor');
            //date and time update
            updateLastChargedDateField(connectDate);
        }
        timeSinceLastCharge.text = `0d 00h 00m`;
    }
};

