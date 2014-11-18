'use strict';

/* Filters */

angular.module('myApp.filters', []).
    filter('interpolate', ['version', function (version) {
        return function (text) {
            return String(text).replace(/\%VERSION\%/mg, version);
        };
    }]).
    filter('range',function () {
        return function (input, min, max, stringify) {
            min = parseInt(min);
            max = parseInt(max);
            for (var i = max; i > min; i--) {
                input.push(stringify && ("" + i) || i);
            }
            return input;
        };
    }).
    filter('elapsedDays', function () {
        return function (timeStamp) {
            return ~~((+new Date() - timeStamp) / (1000 * 60 * 60 * 24));
        };
    }).
    filter('humanDate', function () {
        return function (timeStamp) {
            return new Date(timeStamp).toLocaleString();
        };
    });
