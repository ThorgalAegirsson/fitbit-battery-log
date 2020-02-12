export const convertDate = time => {
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

export const chargeColor = batteryLevel => {
    let color;
    switch (true) {
        case batteryLevel < 20:
            color = '#c00';
            break;
        case batteryLevel < 30:
            color = '#c30';
            break;
        case batteryLevel < 40:
            color = '#c60';
            break;
        case batteryLevel < 50:
            color = '#c90';
            break;
        case batteryLevel < 60:
            color = '#cc0';
            break;
        case batteryLevel < 70:
            color = '#9c0';
            break;
        case batteryLevel < 80:
            color = '#6c0';
            break;
        case batteryLevel < 90:
            color = '#3c0';
            break;
        default:
            color = '#0c0';
            break;
    }
    return color;
};

export const updateLastChargedDateField = date => `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}  ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`;