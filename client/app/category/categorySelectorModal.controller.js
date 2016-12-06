class CategorySelectorModalCtrl {
  constructor($scope, parent) {
    let existingCategories = _.clone(parent.config.currentCategories);
    $scope.cancel = () => {
      ////cancel dialog will remove all categories selected in the dialog, but leave all previous selected ones
      parent.resetSelectedCategories(existingCategories);
      parent.$mdDialog.hide();
    };
    $scope.done = () => {
      parent.selectCallback({
        categories: parent.config.currentCategories
      });
      parent.$mdDialog.hide();
    };
  }
}

angular.module('digitalVillageApp').controller('CategorySelectorModalController', CategorySelectorModalCtrl);
