'use strict';

angular.module('digitalVillageApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('notifications', {
        url: '/notifications',
        templateUrl: 'app/notification/notificationHistory.html',
        controller: 'NotificationHistoryCtrl',
        controllerAs: 'vm',
        sticky: true,
        authenticate: true,
        data: {
          pageTitle : 'Notification history',
          activeTab: 'notifications'
        }
      })
      .state('chats', {
        url: '/chats',
        templateUrl: 'app/notification/notificationHistory.html',
        controller: 'NotificationHistoryCtrl',
        controllerAs: 'vm',
        sticky: true,
        authenticate: true,
        data: {
          pageTitle : 'Chat history',
          activeTab: 'chats'
        }
      })
      .state('chats.chat', {
        url: '/:chatId',
        templateUrl: 'app/notification/notificationHistory.html',
        controller: 'NotificationHistoryCtrl',
        controllerAs: 'vm',
        sticky: true,
        authenticate: true
      })
  });
