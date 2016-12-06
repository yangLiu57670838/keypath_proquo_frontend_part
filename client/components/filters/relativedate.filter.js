'use strict';

angular.module('digitalVillageApp')
  .filter('relativedate', () => date => {
    return moment(date).calendar(null, {
      sameDay: 'h:mmA',
      lastDay: '[Yesterday], h:mmA',
      lastWeek: 'ddd, h:mmA',
      sameElse: 'DD/MM/YYYY, h:mmA'
    });
  });
