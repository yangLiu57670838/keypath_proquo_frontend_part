class NotificationRecordRowCtrl {
  constructor($scope, User, Chat, $state) {
    this.$state = $state;
  }

  clickNotification() {
    this.viewModel.checked = true;
    if (this.viewModel.isChat) {
      this.viewModel.tail.iconValue = 0;
    }
    if (this.viewModel.content.clickCB) {
      this.viewModel.content.clickCB();
    }
  }
}

angular.module('digitalVillageApp')
  .directive('notificationRecordRow', function () {
    return {
      restrict: 'AE',
      scope: {
        viewModel: "=",
        user: "="
      },
      bindToController: true,
      //replace: true,
      templateUrl: 'app/notification/notificationRecordRow.html',
      controller: NotificationRecordRowCtrl,
      controllerAs: 'vm'
    }
  });
