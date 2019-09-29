import { battery, charger } from 'power';
import document from 'document';
import * as fs from 'fs';


// DOM refs
const batteryValue = document.getElementById('batteryValue');
const batteryCharge = document.getElementById('batteryCharge');
const connectState = document.getElementById('connectState');
const lastChargedDateField = document.getElementById('lastChargedDate');
const lastChargedTimeField = document.getElementById('lastChargedTime');
const container = document.getElementById("container");

// Get the selected index
let currentIndex = container.value;

// Set the selected index
container.value = 0; // jump to first slide

let connectDate = null;

try {
    let connectDate = fs.readFileSync('lastCharged.txt', 'cbor');
} catch (e) {
    console.error('there was an error reading "lastCharged" file:');
    console.error(e);
}
// init GUI
batteryValue.text = `${battery.chargeLevel}%`;
batteryCharge.width = 141*battery.chargeLevel/100;
connectState.text = charger.connected ? 'Plugged in' : 'Unplugged';
if (connectDate) {
    lastChargedDateField.text = connectDate.toDateString();
    lastChargedTimeField.text = `${connectDate.getHours()}:${connectDate.getMinutes()}`;
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
    console.log(`CHARGER charger connected: ${charger.connected}`);
    connectState.text = charger.connected ? charger.powerIsGood ? 'Plugged in, charging' : 'Plugged in, not charging' : 'Unplugged';
    if (!charger.connected) {
        connectDate = new Date();
        // save the date to a file on the device, later utilize companion and/or cloud
        fs.writeFileSync('lastCharged.txt', connectDate, 'cbor');
        lastChargedDateField.text = connectDate.toLocaleDateString();
        // lastChargedTimeField.text = `${connectDate.getHours()}:${connectDate.getMinutes()}`;
        lastChargedTimeField.text = connectDate.toLocaleTimeString();
        console.log(connectDate);
        console.log(connectDate.toLocaleDateString());
        console.log(connectDate.toLocaleTimeString());
        console.log(connectDate.toDateString());
        console.log(connectDate.toTimeString());
        console.log(connectDate.getHours());
    }
};
