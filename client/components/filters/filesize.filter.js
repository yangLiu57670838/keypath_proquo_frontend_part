'use strict';

angular.module('digitalVillageApp')
  .filter('filesize', () => size => {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let unit = 0;

    while (size >= 1024 && unit < units.length) {
      size /= 1024;
      unit++;
    }
    return size.toFixed(2) + ' ' + units[unit];
  });
