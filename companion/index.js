import { settingsStorage } from 'settings';
import * as messaging from 'messaging';
import { me } from 'companion';

const updateSettings = (key, value) => {
    if (value) pushSettings({ key, value });
};

const pushSettings = data => {
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        messaging.peerSocket.send(data);
    } else {
        console.log('no socket connection');
    }
}
settingsStorage.onchange = e => {
    //update settings
    console.log(e.key, e.newValue);
    updateSettings(e.key, e.newValue);
}

if (me.launchReasons.settingsChanged) {
    //update settings
    updateSettings('toggle', settingsStorage.getItem('toggle'));
}

