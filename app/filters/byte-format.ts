import {Pipe, PipeTransform} from 'angular2/core';

@Pipe({ name: 'byteFormat'})
export default class ByteFormatPipe implements PipeTransform {
    transform(bytes, args) {
        if(bytes == 0) return '0 Bytes';
        var k = 1000;
        var sizes = ['Bytes', 'KB', 'MB', 'GB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
    }
}
