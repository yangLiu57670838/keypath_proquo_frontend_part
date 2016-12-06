'use strict';

class SkillSelectorCtrl {
  constructor($scope, Category) {
    // N.B. These category icon paths need to be simple string literals so the grunt usemin step can perform the appropriate substitutions
    this.topCategories = [
      {
        name: 'marketing',
        activeIcon: '/assets/images/icon_marketing_circle.svg',
        inactiveIcon: '/assets/images/icon_marketing_outline.svg'
      },
      {
        name: 'design',
        activeIcon: '/assets/images/icon_design_circle.svg',
        inactiveIcon: '/assets/images/icon_design_outline.svg'
      },
      {
        name: 'accounting and legal',
        activeIcon: '/assets/images/icon_accounting_circle.svg',
        inactiveIcon: '/assets/images/icon_accounting_outline.svg'
      },
      {
        name: 'technology',
        activeIcon: '/assets/images/icon_technology_circle.svg',
        inactiveIcon: '/assets/images/icon_technology_outline.svg'
      },
      {
        name: 'business support',
        activeIcon: '/assets/images/icon_business_circle.svg',
        inactiveIcon: '/assets/images/icon_business_outline.svg'
      },
    ];

    this.activeTopCategoryIndex = undefined;
    this.activeCategories = [];

    this.skillSelectorOptions = {
      searchView: 'textonly',
      searchPlaceholder: 'Pick a category from above, then type here to search for skills',
      skilltype: this.skillType,
      selectorid: 'profile-edit-offered',
      currentCategories: this.selectedSkills
    };

    // merge children and id information into our top-level categories
    Category.getTree().then(categories => {
      const rootCategories = categories.filter(category => category.root);
      const rootNameToCategory = rootCategories.reduce((accum, category) => { accum[category.name.toLowerCase()] = category; return accum; }, {});
      this.topCategories.forEach(category => {
        const { _id, children } = rootNameToCategory[category.name] || { children: [] };
        Object.assign(category, { _id, children });
      });
    });

    this.theme = this.skillType == "skillsOffered" ? "skills-offered" : "skills-needed";

    $scope.$watch('vm.selectedSkills',(newSelectedSkills) => { this.skillSelectorOptions.currentCategories = newSelectedSkills; });
  }

  selectTopCategory(index) {
    this.activeTopCategoryIndex = index;
    this.activeCategoryId = this.topCategories[index]._id;
    this.activeCategories = this.topCategories[index].children;
  }

  updateSelectedSkills(categories) {
    this.selectedSkills = categories;
  }

  selectSkillFromSuggestedList(selectedSkill){
    this.selectedSkills.push(selectedSkill);
  }
}

angular.module('digitalVillageApp')
  .directive('skillSelector', () => ({
    templateUrl: 'app/skill-search/skill-selector/skill-selector.html',
    restrict: 'E',
    scope: {},
    bindToController: {
      'skillType': '@',       // 'skillsOffered' or 'skillsRequired'
      'selectedSkills': '='  // array of category objects
    },
    controller: SkillSelectorCtrl,
    controllerAs: 'vm'
  }));
