'use strict';

class NotificationController {
  refreshNotificationsCount() {
    // we're not interested in the notifications themselves, just the count
    this._Notifications.query({
      filter: JSON.stringify({ notificationSeen: false })
    }, (notifications, responseHeaders) => {
      this.notificationCount = responseHeaders('record-count');
    });
  }

  constructor(Notifications, $rootScope, $scope) {
    const notificationChannelSuffix = 'not';

    this._Notifications = Notifications;
    this.$rootScope = $rootScope;
    this.notificationCount = 0;

    Notifications.subscribe(notificationChannelSuffix, message => {
      $scope.$apply(() => {
        this.notificationCount++;
      });
    });

    $scope.$on('reloadNotifications', () => { this.notificationCount = 0; });
    $scope.$on('refreshNotificationsCount', () => { this.refreshNotificationsCount(); });

    $scope.$on('$destroy', event => {
      Notifications.unsubscribe(notificationChannelSuffix);
    });

    this.refreshNotificationsCount();
  }

  resetNotifications() {
    // causes NotificationHistoryCtrl to refresh if it's active. done this way rather than by forcing a $state reload so
    // the notifications history doesn't momentarily disappear if the app is already in the notifications state.
    this.$rootScope.$broadcast('reloadNotifications');
  }
}

angular.module('digitalVillageApp')
  .controller('NotificationCtrl', NotificationController);
