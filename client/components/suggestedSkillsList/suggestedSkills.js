class SuggestedSkillCtrl {
  constructor($scope) {
    this.pageNumber = 1;
    this.pageSize = 5;
    this.isFirstPage = true;
    this.isLastPage = false;
    this.allSkills = this.categorySkills;

    $scope.$watch("vm.categorySkills", (newVal, oldVal) => {
      if (newVal != oldVal && newVal != undefined) {
        this.allSkills = newVal;
        if (this.selectedSkills.length > 0) {
          const skillsTobeRemoved = newVal.filter((existingSkill) =>
            this.selectedSkills.findIndex((selectedSkill) => existingSkill._id == selectedSkill._id) > -1
          );
          if (skillsTobeRemoved.length > 0) {
            skillsTobeRemoved.map((skill) => this.removeSkillFromList(skill));
          }
        }
        this.init();
      }
    });

    $scope.$watchCollection("vm.selectedSkills", (newVal, oldVal) => {
      if (newVal != oldVal && newVal != undefined) {
        let longer = [];
        let shorter = [];
        let addBack = true;
        if (newVal.length > oldVal.length) {
          longer = newVal;
          shorter = oldVal;
          addBack = false;
        } else {
          shorter = newVal;
          longer = oldVal;
        }
        const differentSkill = longer.find((newSkill) =>
          (shorter.findIndex((oldSkill) => newSkill._id == oldSkill._id) < 0)
          && newSkill.parentCategory == this.categoryId
        );
        if (differentSkill) {
          if (addBack) {
            this.addSkillToList(differentSkill);
          } else {
            this.removeSkillFromList(differentSkill);
          }
        }
      }
    });
  }

  init() {
    this.calculateTotalPages();
    this.isLastPage = this.pageNumber == this.totalPages;
    this.currentSkills = this.allSkills.slice((this.pageNumber - 1) * this.pageSize, this.pageSize + ((this.pageNumber - 1) * this.pageSize));
  }

  prePage() {
    this.pageNumber -= 1;
    this.updateCurrentList();
  }

  nextPage() {
    this.pageNumber += 1;
    this.updateCurrentList();
  }

  selectSkill(selectedSkill) {
    if (this.skillSelectCallback) {
      this.skillSelectCallback({selectedSkill: selectedSkill});
    }
  }

  addSkillToList(newSkill) {
    const insertIndex = this.allSkills.findIndex((skill) => skill.name.localeCompare(newSkill.name) == 1);
    this.allSkills.splice(insertIndex, 0, newSkill);
    this.calculateTotalPages();
    this.updateCurrentList();
  }

  removeSkillFromList(selectedSkill) {
    this.allSkills = this.allSkills.filter(skill => skill._id != selectedSkill._id);
    this.calculateTotalPages();
    if (this.totalPages < this.pageNumber) {
      this.prePage();
    } else {
      this.updateCurrentList();
    }
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.allSkills.length / this.pageSize);
    //the minimum total page is 1 even there is no item
    if (this.totalPages == 0) this.totalPages = 1;
  }

  updateCurrentList() {
    this.currentSkills = this.allSkills.slice((this.pageNumber - 1) * this.pageSize, this.pageSize + ((this.pageNumber - 1) * this.pageSize));
    this.isFirstPage = this.pageNumber == 1;
    this.isLastPage = this.pageNumber == this.totalPages;
  }
}


angular.module('digitalVillageApp')
  .directive('suggestedSkills', () => ({
    templateUrl: 'components/suggestedSkillsList/suggestedSkills.html',
    restrict: 'E',
    scope: {
      categoryId: "=",
      categorySkills: "=",
      selectedSkills: "=",
      skillSelectCallback: "&skillSelectCallback"
    },
    bindToController: true,
    controller: SuggestedSkillCtrl,
    controllerAs: 'vm'
  }));
