/**
 * Created by Slavik on 4/28/16.
 */
export const base64Symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

export  function revObj(obj) {
    const new_obj = {};

    for (let prop in obj) {
        if(obj.hasOwnProperty(prop)) {
            new_obj[obj[prop]] = prop;
        }
    }

    return new_obj;
};

export function forOf(it:IterableIteratorShim<any>) {
    let res = [];
    let i = it.next();
    while (!i.done) {
        res.push(i.value);
        i = it.next();
    }
    return res;
}

const faFileMapping = {
    'image': 'image-o',
    'audio': 'audio-o',
    'video': 'video-o',
    'application/pdf': 'pdf-o',
    'text/plain': 'text-o',
    'text/html': 'code-o',
    'application/gzip': 'archive-o',
    'application/zip': 'archive-o',
    'application/octet-stream': 'o'
}

export function getFileClass({ mime }) {
    return 'fa-file-' + (faFileMapping[mime] || faFileMapping[mime.split('/')[0]] || 'o');
}