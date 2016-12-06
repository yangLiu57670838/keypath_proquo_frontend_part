'use strict';

class MyProfileController {
  constructor($scope, modalService, Business, Social, Auth, Document, Review) {
    this._Social = Social;
    this.user = Auth.getCurrentUser();
    this.toggleUsername = false;
    this.toggleLocation = false;
    this.serverErrors = {};
    this.experienceMaxDate = new Date();
    this.expPattern = /^\d+$/;
    this.ratings = [];
    this.$scope = $scope;
    this.modalService = modalService;
    this.Document = Document;

    if (!this.business) {
      Business.mine().$promise.then(result => {
        this.isLoggedIn = Auth.isLoggedIn;
        this.business = result;
        let reviewFilter = {reviewedBusinessId: this.business._id};
        this.ratings = Review.query({
          filter: JSON.stringify(reviewFilter),
          sort: 'updatedAt:desc'
        });

        // if date has been recorded
        if (this.business.businessEstablished && Date.parse(this.business.businessEstablished)) {
          this.businessEstablished = moment(this.business.businessEstablished).fromNow(true);
          this.businessDateObj = new Date(this.business.businessEstablished);
        }

        this.requiredCategories = this.business.needs.map(need => {
          return {
            _id: need.refId,
            name: need.name
          };
        });

        this.offeredCategories = this.business.offers.map(offer => {
          return {
            _id: offer.refId,
            name: offer.name
          };
        });
        this.offeredSelectorOptions = {
          searchView: "verticalmodal",
          toggleText: "Click here to add skills you want to offer",
          skilltype: "skillsOffered",
          modalid: "profile-edit-skills",
          selectorid: 'profile-edit',
          currentCategories: this.offeredCategories
        };

        this.neededSelectorOptions = {
          searchView: "verticalmodal",
          toggleText: "Click here to add skills you need",
          skilltype: "skillsRequired",
          modalid: "profile-edit-skills-offered",
          selectorid: 'profile-edit-offered',
          currentCategories: this.requiredCategories
        };

        this.$scope.$watch(() => this.businessDateObj, (newVal, oldVal) => {
          if (newVal != oldVal) {
            this.business.businessEstablished = newVal;
            this.businessEstablished = moment(this.business.businessEstablished).fromNow(true);
            this.save({id: this.business._id, businessEstablished: this.business.businessEstablished});
          }
        });
      });
    }


    // This cancelEditLocation method is defined here to keep the 'this' scope unchanged.
    this.cancelEditLocation = () => {
      this.toggleLocation = !this.toggleLocation;
    };

    // This save method is defined here to keep the 'this' scope unchanged.
    this.save = itemToSave => {
      return Business.update(itemToSave).$promise
        .then(newBusiness => {
          Object.keys(itemToSave).forEach(key => this.business[key] = newBusiness[key]);
          this.business.__v = newBusiness.__v;
          return newBusiness;
        });
    };
  }

  get businessUrl() {
    return this.business && this.business.urls[0];
  }

  // This saveEditLocation method is defined here to keep the 'this' scope unchanged,
  // as it is being used in other directives, e.g. <location save-location="myProfileCtrl.saveEditLocation"></location>
  saveEditLocation() {
    this.copyLocationBetweenObjects(this.editLocationObject, this.business);
    let objectToUpdate = {id: this.business._id};
    this.copyLocationBetweenObjects(this.editLocationObject, objectToUpdate);
    this.save(objectToUpdate);
    this.toggleLocation = !this.toggleLocation;
  };

  changeAccepts(accepts) {
    this.business[accepts] = !this.business[accepts];
    let objectToUpdate = {id: this.business._id};
    objectToUpdate[accepts] = this.business[accepts];
    this.save(objectToUpdate);
  }

  setEditUsername() {
    this.toggleUsername = !this.toggleUsername;
    this.editFirstName = this.business.primaryContactFirstName;
    this.editLastName = this.business.primaryContactLastName;
  }

  saveEditUsername() {
    if (this.editFirstName == undefined || this.editFirstName == '') {
      this.editFirstName == this.business.primaryContactFirstName;
    } else if (this.editLastName == undefined || this.editLastName == '') {
      this.editLastName == this.business.primaryContactLastName;
    } else {
      this.toggleUsername = !this.toggleUsername;
      this.business.primaryContactFirstName = this.editFirstName;
      this.business.primaryContactLastName = this.editLastName;
      this.save({
        id: this.business._id,
        primaryContactFirstName: this.business.primaryContactFirstName,
        primaryContactLastName: this.business.primaryContactLastName
      });
    }
  }

  cancelEditUsername() {
    this.toggleUsername = !this.toggleUsername;
  }

  editIndustryExp() {
    this.toggleIndustryExp = !this.toggleIndustryExp;
    this.experienceYear = this.business.experienceYear;
  }

  saveIndustryExp() {
    this.$scope.profileEditForm.industryExp.$validate();
    if (!this.$scope.profileEditForm.industryExp.$error.pattern && !this.$scope.profileEditForm.industryExp.$error.maxlength) {
      this.save({id: this.business._id, experienceYear: this.experienceYear})
        .then(this.toggleIndustryExp = !this.toggleIndustryExp)
        .catch((response) => this.serverErrors = response.data.errors);
    }
  }

  cancelIndustryExp() {
    this.toggleIndustryExp = !this.toggleIndustryExp;
  }

  checkExpValue(event) {
    if (event.charCode != 43 && event.charCode > 31 && (event.charCode < 48 || event.charCode > 57)) {
      event.preventDefault();
      return false;
    }
  }

  editABN() {
    this.toggleABN = !this.toggleABN;
    this.abn = this.business.abn;
  }

  saveABN() {
    this.$scope.profileEditForm.abn.$validate();
    if (!this.$scope.profileEditForm.abn.$error.abn) {
      this.save({id: this.business._id, abn: this.abn})
        .then(newBusiness => {
          this.toggleABN = !this.toggleABN;
          this.abn = newBusiness.abn;
          this.business.abnVerified = newBusiness.abnVerified;
        })
        .catch(response => this.serverErrors = response.data.errors);
    }
  }

  cancelABN() {
    this.toggleABN = !this.toggleABN;
    this.clearServerError("abn");
  }

  changeAccepts(accepts) {
    this.business[accepts] = !this.business[accepts];
    this.save({id: this.business._id, [accepts]: this.business[accepts]});
  }

  locationReadonlyText() {
    if (this.business === '' || this.business === undefined) {
      return;
    }
    let locationText;
    if (this.business) {
      if (this.business.suburb === '' || this.business.suburb === undefined) {
        locationText = 'Provide location';
      } else if (this.business.postCode === '' || this.business.postCode === undefined) {
        locationText = this.business.suburb;
      } else {
        locationText = this.business.suburb + ', ' + this.business.postCode;
      }
    } else {
      locationText = 'Location not provided';
    }
    return locationText;
  }

  setEditLocation() {
    this.toggleLocation = !this.toggleLocation;
    this.editLocationObject = {};
    this.copyLocationBetweenObjects(this.business, this.editLocationObject);
  }

  copyLocationBetweenObjects(fromObject, toObject) {
    const properties = ['suburb', 'postCode', 'formattedAddress', 'loc'];
    properties.forEach((property) => {
      toObject[property] = fromObject[property];
    });
  }

  selectedOffers(categories) {
    this.business.offers = categories.map(category => {
      return {
        name: category.name,
        refId: category._id
      };
    });
    this.save({id: this.business._id, offers: this.business.offers});
  }

  selectedNeeds(categories) {
    this.business.needs = categories.map(category => {
      return {
        name: category.name,
        refId: category._id,
        // Some UI stuff from dom - see if needed
        active: true
      };
    });
    this.save({id: this.business._id, needs: this.business.needs});
  }

  uploadImage() {
    this.Document.uploadImage().then(blob => {
      this.business.portfolio.unshift({
        name: "Untitled",
        description: "",
        date: new Date(),
        fullImageUrl: blob[0].url,
        thumbnailImageUrl: blob[0].url,
        projectId: ""
      });
      this.save({id: this.business._id, portfolio: this.business.portfolio});
    }, console.error);
  }

  uploadAvatar(type) {
    const id = this.business._id;
    (type === 'avatar' ?
      this.Document.uploadAvatar().then(([{url}]) => ({id, primaryContactAvatarUrl: url})) :
      this.Document.uploadImage().then(([{url}]) => ({id, businessLogoUrl: url})))
      .then(itemToSave => this.save(itemToSave), console.error);
  }

  deleteAvatar(type) {
    const propertyToDelete = type === 'avatar' ? 'primaryContactAvatarUrl' : 'businessLogoUrl';
    const itemToSave = {
      id: this.business._id,
      [propertyToDelete]: null
    }
    this.save(itemToSave);
  }

  showEnlargedImg(portfolioItem, portfolioIndex) {
    let item = {portfolioItem: portfolioItem, portfolioIndex: portfolioIndex, business: this.business};
    this.modalService.showSuperEnlargedImgEditableModal(null, item);
  }

  editUrl($event) {
    let item = {socialUrls: this.business.socialUrls, business: this.business};
    this.modalService.showUrlModal($event, item);
  }

  editCompanyName($event) {
    let item = {urls: this.business.urls, business: this.business};
    this.modalService.showCompanyNameModal($event, item);
  }

  openBusinessUrlIfLoggedIn($event) {
    if (this.isLoggedIn()) {
      if (this.businessUrl && this.businessUrl.url) {
        window.open(this.businessUrl.url);
      }
    } else {
      this.modalService.showLoginModal($event);
    }
  }

  openSocialUrlIfLoggedIn($event, socialUrl) {
    if (this.isLoggedIn()) {
      this._Social.openUrl(socialUrl);
    } else {
      this.modalService.showLoginModal($event);
    }
  }

  deleteImgPrompt(portfolioItem) {
    let item = {
      confirmCallback: () => {
        let idx = this.business.portfolio.indexOf(portfolioItem);
        if (idx > -1) {
          this.business.portfolio.splice(idx, 1);
        }
        this.save({id: this.business._id, portfolio: this.business.portfolio});
      },
      id: portfolioItem,
      confirmationMessage: "Are you sure you want to delete this image?"
    };
    this.modalService.showGenericConfirmModal(null, item);
  }

  clearServerError(key) {
    this.$scope.profileEditForm.abn.$setPristine();
    this.$scope.profileEditForm.abn.$setUntouched();
    delete this.$scope.profileEditForm.abn.$error.abn;
    delete this.serverErrors[key];
  }

  addNewSwapThing(event) {
    let item = {
      formObject: {
        title: "Add a new thing that you can swap",
        fields: [
          {
            fieldName: "serviceName",
            fieldLabel: "Service Name",
            fieldType: "text",
            fieldRequired: true,
            fieldMaxLength: 40
          }
        ],
        selfValidate: (newServiceName)=> {
          let duplicate = _.find(this.business.thingsICanSwap, (theThing) => {
            return theThing.toLowerCase() === newServiceName.toLowerCase();
          });
          if (duplicate) return {error: duplicate + " exists already."};
          else return null;
        }
      },
      submitCallback: (form) => {
        let newSwapThing = form.fields[0].value;
        this.business.thingsICanSwap.push(newSwapThing);
        this.save({id: this.business._id, thingsICanSwap: this.business.thingsICanSwap});
      }
    };
    this.modalService.showSimpleFormModal(event, item);
  }

  removeSwapThing(index) {
    this.business.thingsICanSwap.splice(index, 1);
    this.save({id: this.business._id, thingsICanSwap: this.business.thingsICanSwap});
  }
}

angular.module('digitalVillageApp')
  .controller('MyprofileCtrl', MyProfileController);
