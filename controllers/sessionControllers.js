const fs = require('fs')

module.exports = {
    createRandomString: (strLength) => {
            strLength = typeof (strLength) == 'number' && strLength > 0 ? strLength : false;
            if (strLength) {
                let possibleCharacter = 'abcdefghiklmnopqwerszx1234567890';
                let str = '';
                for (let i = 0; i < strLength; i++) {
                    let randomCharacter = possibleCharacter.charAt(Math.floor(Math.random() * possibleCharacter.length));
                    str += randomCharacter;
                }
                return str;
            }
    },
    createTokenSessions: (data) => {
        let tokenId = createRandomString(20);
        let fileName = './token/' + tokenId;
        fs.writeFile(fileName, data, err => {

        })


    }
}