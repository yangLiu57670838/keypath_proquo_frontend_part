'use strict';

angular.module('digitalVillageApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('skill-search', {
        url: '/skill-search?searchType',
        templateUrl: 'app/skill-search/skill-search.html',
        controller: 'SkillSearchController',

        data: {
          pageTitle : 'Skill Search'
        },
        controllerAs: 'vm',
        resolve: {
          currentUser: (Auth) => Auth.getCurrentUser().$promise
        }
      })
      .state('proquote-search', {
        url: '/offer-quote/?offerProquoteFlag&proquoteId=',
        templateUrl: 'app/skill-search/skill-search.html',
        controller: 'SkillSearchController',
        controllerAs: 'vm',
        authenticate: true,
        data: {
          pageTitle : 'Find Users'
        },
        resolve: {
          currentUser: (Auth) => Auth.getCurrentUser().$promise
        }
      })
      .state('itdb-search', {
      url: '/offer-invite/?offerItdbFlag&itdbId=',
      templateUrl: 'app/skill-search/skill-search.html',
      controller: 'SkillSearchController',
      controllerAs: 'vm',
      authenticate: true,
      data: {
        pageTitle : 'Find Users'
      },
      resolve: {
        currentUser: (Auth) => Auth.getCurrentUser().$promise
      }
    });

  });
