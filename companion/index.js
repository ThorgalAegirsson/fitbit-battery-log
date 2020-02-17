import { settingsStorage } from 'settings';
import * as messaging from 'messaging';
import { me } from 'companion';

const pushSettings = data => {
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        messaging.peerSocket.send(data);
    } else {
        console.error('no peerSocket connection');
    }
}

const updateSettings = (key, value) => {
    if (value) pushSettings({ key, value: JSON.parse(value) });
};



settingsStorage.onchange = e => {
    if (e.oldValue !== e.newValue) updateSettings(e.key, e.newValue);
}

if (me.launchReasons.settingsChanged) {
    updateSettings('toggle', settingsStorage.getItem('toggle'));
    updateSettings('fontColor', settingsStorage.getItem('fontColor'));
}

