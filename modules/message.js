const moment = require('moment');

const formatMsg = (username, txt) => {
    return{
        username,
        txt,
        time: moment().format('h:mm a')
    }
}

module.exports = formatMsg;