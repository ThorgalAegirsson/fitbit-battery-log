import { battery, charger } from 'power';
import document from 'document';
import * as fs from 'fs';


// DOM refs
const batteryValue = document.getElementById('batteryValue');
const batteryCharge = document.getElementById('batteryCharge');
const connectState = document.getElementById('connectState');
const lastChargedDateField = document.getElementById('lastChargedDate');
const lastChargedTimeField = document.getElementById('lastChargedTime');
const timeSinceLastCharge = document.getElementById('timeSinceLastCharge');
const container = document.getElementById("container");

// Get the selected index
let currentIndex = container.value;
// Set the selected index
container.value = 0; // jump to first slide

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
}

try {
    connectDate = fs.readFileSync('lastCharged.txt', 'cbor');
    console.log(new Date(connectDate));
} catch (e) {
    console.error('there was an error reading "lastCharged" file:');
    console.error(e);
}
// init GUI
let chargerStartState = charger.connected; // set to distinguish the first charger events
// batteryValue.text = `${battery.chargeLevel}%`;
// batteryCharge.width = 141*battery.chargeLevel/100;
connectState.text = charger.connected ? 'Plugged in' : 'Unplugged';
if (connectDate) {
    // lastChargedDateField.text = `${connectDate.toLocaleDateString()}  ${connectDate.getHours()}:${connectDate.getMinutes()}`;
    console.log('connectDate read from file');
    console.log('DATE DIFFERENCE:');
    let today = new Date().valueOf();
    console.log(Math.abs(today - connectDate));
    let lastCharge = new Date(connectDate);
    lastChargedDateField.text = `${lastCharge.toLocaleDateString()}  ${lastCharge.getHours()}:${lastCharge.getMinutes()}`;
    let [day, hr, min] = convertDate(today-connectDate);
    // timeSinceLastCharge.text = `${day} ${day === 1 ? 'day' : 'days'} ${hr} ${hr === 1 ? 'hr' : 'hrs'} : ${min} ${min === 1 ? 'min' : 'mins'}`;
    timeSinceLastCharge.text = `${day}d ${hr}h ${min}m`;
}

console.log('=== CHARGER ===');
console.log(`charger connected: ${charger.connected}`);
console.log(`charger power is good: ${charger.powerIsGood}`);

battery.onchange = evt => {
    batteryValue.text = `${battery.chargeLevel}%`;
    batteryCharge.width = 141 * battery.chargeLevel / 100;
    console.log(`BATTERY charger connected: ${charger.connected}`);
};

charger.onchange = evt => {
    if (charger.connected === chargerStartState) {
        console.log('first charger event canceled');
        chargerStartState = null;
        return;
    }
    console.log(`CHARGER charger connected: ${charger.connected}`);
    connectState.text = charger.connected ? charger.powerIsGood ? 'Plugged in, charging' : 'Plugged in, not charging' : 'Unplugged';
    if (!charger.connected) {
        connectDate = new Date();
        // save the date to a file on the device, later utilize companion and/or cloud
        fs.writeFileSync('lastCharged.txt', connectDate.valueOf(), 'cbor');
        lastChargedDateField.text = `${connectDate.toLocaleDateString()}  ${connectDate.getHours()}:${connectDate.getMinutes()}`;
        // lastChargedTimeField.text = `${connectDate.getHours()}:${connectDate.getMinutes()}`;
        // lastChargedTimeField.text = connectDate.toLocaleTimeString();
        console.log(connectDate);
        console.log(connectDate.toLocaleDateString());
        console.log(connectDate.toLocaleTimeString());
        console.log(connectDate.toDateString());
        console.log(connectDate.toTimeString());
        console.log(connectDate.getHours());
    }
};
