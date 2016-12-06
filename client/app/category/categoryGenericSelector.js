/**
 * CategoryGenericSelector: class name explains what this directive does!
 *
 * options :{
 *  searchView: specify default search view: textonly, treeonly, vertical, treecollapse, treemodal, verticalmodal
 *  skilltype:  skillsOffered or skillsRequired,
 *  selectLimit: limitation of how many categories can be selected, leave it undefined as unlimited,
 *  cacheEnabled: boolean; whether or not use cache,
 *  toggleText: text used for toggle button,
 *  currentCategories:
 * }
 * selectCallback: callback method defined in controller, which will get invoked when a category is selected or updated
 * searchBoxData: optional explicit list of categories to use. use only with `searchView=='textonly'`
 */
class CategoryGenericSelectorCtrl {
  constructor($scope, $mdMenu, $mdDialog, $filter, Category, $cacheFactory) {
    this.showSection = [];
    this.$filter = $filter;
    this.$scope = $scope;
    this.$mdDialog = $mdDialog;
    if (this.options) {
      if (!this.options.toggleText) {
        this.options.toggleText = "show skills";
      }
      this.config = this.options;
    } else {
      this.config = {
        searchView: this.searchView,
        skilltype: this.skilltype,
        selectLimit: parseInt(this.selectLimit) ? parseInt(this.selectLimit) : undefined,
        cacheEnabled: this.cacheEnabled,
        toggleText: this.toggleText ? this.toggleText : "show skills",
        currentCategories: this.currentCategories
      };
    }

    this.validateGivenOptions();
    //this.selectedCategories = this.config.currentCategories ? this.config.currentCategories : [];
    this.searchPlaceholder = this.options.searchPlaceholder || 'Search by keyword';
    this.searchText = "";
    this.showSuggestMailLink = false;
    if (this.config.cacheEnabled == true) {
      this.prevSearchOptions = ($cacheFactory.get('villageAppCache') ? $cacheFactory.get('villageAppCache') : $cacheFactory('villageAppCache')).get('skillSearchOptions');
      if (this.prevSearchOptions) {
        this.config.currentCategories = this.prevSearchOptions.selectedCategories;
        this.selectedItem = this.prevSearchOptions.selectedItem;
        this.searchAutocompleteIsActive = this.prevSearchOptions.searchAutocompleteIsActive;
        if (this.prevSearchOptions.options) {
          this.config = this.prevSearchOptions.options;
        }
        if (this.prevSearchOptions.showSection) {
          this.showSection = this.prevSearchOptions.showSection;
        }
        this.showTreeView = this.prevSearchOptions.showTreeView;
        this.searchTextItemSelect(this.selectedItem);
      }
    }
    $mdMenu.hide(null, {closeAll: true});
    this.originatorEv = undefined;

    if (this.searchBoxData) {
      if (this.config.searchView !== 'textonly') {

      }
    } else {
      Category.getSearchableTree().then(data => {
        this.searchBoxData = data.flat;
        this.categorySkills = data.tree;
      });
    }

    this.theme = this.config.skilltype == "skillsRequired" ? 'skills-needed' : 'skills-offered';
  }


  //assign default option values if it was not specified
  validateGivenOptions() {
    if (!this.config.searchView) {
      this.config.searchView = "treecollapse";
    }
    if (!this.config.skilltype) {
      this.config.skilltype = "skillsOffered";
    }
    if (!this.selectCallback) {

    }
  }

  updateShowSection() {
    if (this.config.cacheEnabled == true) {
      this.prevSearchOptions.showSection = this.showSection;
    }
  }

  /*Called from the Search and from the picker  - includes a check to prevent calling the callbackk in modal view*/
  updateModel($event, skill) {
    if (this.autoCompleteScope) {
      this.autoCompleteScope.$$childHead.$mdAutocompleteCtrl.clear();
    }
    $event.preventDefault();
    let existing = _.find(this.config.currentCategories, function (el) {
      return el._id == skill._id;
    });
    if (!existing) {
      if (this.allowSelect()) {
        this.config.currentCategories.push(skill);
        if (this.config.searchView != 'verticalmodal') {
          this.selectCallback({
            categories: this.config.currentCategories
          });
        }
      } else {
        return false;
      }
    }
  };

  checkActive(skillModel) {
    return this.config.currentCategories.map((category) =>{
      return category._id;
    }).includes(skillModel._id);
  };

  openMenu($mdOpenMenu, ev) {
    this.originatorEv = ev;
    $mdOpenMenu(ev);
  };

  removeSkill(skillModel) {
    for (let i = 0; i < this.config.currentCategories.length; i++) {
      if (this.config.currentCategories[i]._id === skillModel._id) {
        this.config.currentCategories.splice(i, 1);
        return true;
      }
    }
  };

// show the modal with all skills
  toggleTreeView($event) {
    $event.preventDefault();
    if (this.config.searchView == 'treemodal') {
      this.showTreeInModal();
    }
    if (this.config.searchView == 'treecollapse') {
      this.showTreeCollapse();
    } else {
      this.showTreeCollapse();
    }
  };

  showTreeCollapse() {
    this.showTreeView = !this.showTreeView;
    if (this.config.cacheEnabled == true) {
      this.prevSearchOptions.showTreeView = this.showTreeView;
    }
  };

  showVerticalModal() {
    this.$mdDialog.show({
      scope: this.$scope.$new(),
      controller: CategorySelectorModalCtrl,
      templateUrl: 'app/category/categorySelectorVerticalModalTemplate.html',
      locals: {
        parent: this
      }
    }).then(function (answer) {
      // accepted
    }, function () {
      // cancelled
    });
  }

  showTreeInModal() {
    this.$mdDialog.show({
      scope: this.$scope.$new(),
      controller: CategorySelectorModalCtrl,
      templateUrl: 'app/category/categorySelectorTreeModalTemplate.html',
      locals: {
        parent: this
      }
    }).then(function (answer) {
      // accepted
    }, function () {
      // cancelled
    });
  };

//---------- keywords select related -------------
  getCategoriesInFlat(searchText) {
    if (searchText) {
      let result = this.$filter('filter')(this.searchBoxData, searchText, '==');
      if ((result && result.length > 0) || !this.searchText) {
        this.showSuggestMailLink = false;
      } else {
        this.showSuggestMailLink = true;
      }
      return result;
    } else {
      return this.searchBoxData;
    }
  };

// for when the search text changes
  searchTextChange(text) {
    this.searchAutocompleteIsActive = text.length > 0;
    if (this.config.cacheEnabled == true) {
      this.prevSearchOptions.searchAutocompleteIsActive = this.searchAutocompleteIsActive;
    }
    this.searchText = text;
    if (!this.searchText) {
      this.showSuggestMailLink = false;
    }
  };

// for when an autocomplete item is selected
  searchTextItemSelect($event, item, autoCompleteScope) {
    this.autoCompleteScope = autoCompleteScope;
    if (item != undefined) {
      if (this.config.cacheEnabled == true) {
        this.prevSearchOptions.selectedItem = item;
        this.prevSearchOptions.options = this.config;
      }
      if (!this.allowSelect()) {
        _.delay(function () {
          autoCompleteScope.$$childHead.$mdAutocompleteCtrl.hidden = true;
          autoCompleteScope.$$childHead.$mdAutocompleteCtrl.clear();
        }, 100);
        return false;
      }
      // push to search keywords
      if (item) {
        let existing = _.find(this.config.currentCategories, function (el) {
          return el._id == item._id;
        });

        if (!existing) {
          this.config.currentCategories.push(item);
          if (this.config.searchView != 'verticalmodal') {
            this.selectCallback({
              categories: this.config.currentCategories
            });
          }
        }
      }
      _.delay(function () {
        autoCompleteScope.$$childHead.$mdAutocompleteCtrl.clear();
      }, 100);
    }
  };

  removeSelectedCategory($event, category) {
    $event.preventDefault();
    for (let i = 0; i < this.config.currentCategories.length; i++) {
      if (this.config.currentCategories[i]._id === category._id) {
        this.config.currentCategories.splice(i, 1);
      }
    }
    if (this.config.searchView != 'verticalmodal') {
      this.selectCallback({
        categories: this.config.currentCategories
      });
    }
  };

  toggleSkillChosen($event, category) {
    if (this.checkActive(category)) {
      this.removeSelectedCategory($event, category);
    } else {
      this.updateModel($event, category, false);
    }

  }

  removeChosenSelectedCategory($event, category) {
    $event.preventDefault();
    for (let i = 0; i < this.config.currentCategories.length; i++) {
      if (this.config.currentCategories[i]._id === category._id) {
        this.config.currentCategories.splice(i, 1);
      }
    }

    this.selectCallback({
      categories: this.config.currentCategories
    });

  };

  resetSelectedCategories(categories) {
    this.config.currentCategories = categories;
  };

  allowSelect() {
    return !this.config.selectLimit || (Number.isInteger(this.config.selectLimit) && this.config.selectLimit > this.config.currentCategories.length);
  }
}


angular.module('digitalVillageApp')
  .directive('categoryGenericSelector', function () {
    return {
      restrict: 'AE',
      scope: {
        options: "=",
        searchView: "=",
        skilltype: "=",
        selectLimit: "=",
        cacheEnabled: "=",
        modalid: "=",
        currentCategories: "=",
        searchBoxData: '=?',
        selectCallback: "&selectCallback"
      },
      bindToController: true,
      templateUrl: 'app/category/categoryGenericSelector.html',
      controller: CategoryGenericSelectorCtrl,
      controllerAs: 'vm'
    }
  });
