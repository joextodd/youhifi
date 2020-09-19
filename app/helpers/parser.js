/**
 * Taken from youtube-stream-url
 */
export const parseYouTubeUrl = (str, array) => {

    let strArr = String(str).replace(/^&/, '').replace(/&$/, '').split('&');
    let sal = strArr.length;
    let i;
    let j;
    let ct;
    let p;
    let lastObj;
    let obj;
    let undef;
    let chr;
    let tmp;
    let key;
    let value;
    let postLeftBracketPos;
    let keys;
    let keysLen;

    let _fixStr = function (str) {
        return decodeURIComponent(str.replace(/\+/g, '%20'))
    };

    let $global = (typeof window !== 'undefined' ? window : global);
    $global.$locutus = $global.$locutus || {};
    let $locutus = $global.$locutus;
    $locutus.php = $locutus.php || {};

    if (!array) {
        array = $global
    }

    for (i = 0; i < sal; i++) {
        tmp = strArr[i].split('=');
        key = _fixStr(tmp[0]);
        value = (tmp.length < 2) ? '' : _fixStr(tmp[1]);

        while (key.charAt(0) === ' ') {
            key = key.slice(1)
        }
        if (key.indexOf('\x00') > -1) {
            key = key.slice(0, key.indexOf('\x00'))
        }
        if (key && key.charAt(0) !== '[') {
            keys = [];
            postLeftBracketPos = 0;
            for (j = 0; j < key.length; j++) {
                if (key.charAt(j) === '[' && !postLeftBracketPos) {
                    postLeftBracketPos = j + 1
                } else if (key.charAt(j) === ']') {
                    if (postLeftBracketPos) {
                        if (!keys.length) {
                            keys.push(key.slice(0, postLeftBracketPos - 1))
                        }
                        keys.push(key.substr(postLeftBracketPos, j - postLeftBracketPos));
                        postLeftBracketPos = 0;
                        if (key.charAt(j + 1) !== '[') {
                            break
                        }
                    }
                }
            }
            if (!keys.length) {
                keys = [key]
            }
            for (j = 0; j < keys[0].length; j++) {
                chr = keys[0].charAt(j);
                if (chr === ' ' || chr === '.' || chr === '[') {
                    keys[0] = keys[0].substr(0, j) + '_' + keys[0].substr(j + 1)
                }
                if (chr === '[') {
                    break
                }
            }

            obj = array;
            for (j = 0, keysLen = keys.length; j < keysLen; j++) {
                key = keys[j].replace(/^['"]/, '').replace(/['"]$/, '');
                lastObj = obj;
                if ((key !== '' && key !== ' ') || j === 0) {
                    if (obj[key] === undef) {
                        obj[key] = {}
                    }
                    obj = obj[key]
                } else {
                    // To insert new dimension
                    ct = -1;
                    for (p in obj) {
                        if (obj.hasOwnProperty(p)) {
                            if (Number(p) > ct && p.match(/^\d+$/g)) {
                                ct = Number(p)
                            }
                        }
                    }
                    key = ct + 1
                }
            }
            lastObj[key] = value
        }
    }
};