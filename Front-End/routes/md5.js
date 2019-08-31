var crypto = require('crypto');


function isEqualHash(raw, hash) {
    if(crypto.createHash('md5').update(raw).digest('hex')){
        return true;
    }
    return false;
}


module.exports = {
    isEqualHash : isEqualHash
};
