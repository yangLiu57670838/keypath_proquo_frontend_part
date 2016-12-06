'use strict';

class PaymentsController {
  constructor($state, $stateParams, Auth, User, Business, $mdDialog, PaymentService, currentBusiness, currentUser, $q, $document) {
    this.$state = $state;
    this._returnToProjectId = $stateParams.returnToProjectId;
    this.Auth = Auth;
    this.User = User;
    this.Business = Business;
    this.Payment = PaymentService;
    this.$mdDialog = $mdDialog;
    this.currentUser = currentUser;
    this.currentBusiness = currentBusiness;
    this.billingUser = undefined;
    this.billingCompany = undefined;
    this.bankAccount = undefined;
    this.creditCard = undefined;
    this.processing = true;
    this.$q = $q;
    this.sameAsPersonalAddress = false;
    this.$document = $document;

    if (this.currentUser.billing.verificationState === 'pending') {
      this.editMode = true;
    }

    this.init = () => {
      this.processing = true;

      // Get billing user details
      const getBillingUserPromise = PaymentService.getUser().$promise;

      const getCompanyPromise = PaymentService.getCompany().$promise.catch(error => {
          if (error.status == 404) {
            this.editMode=true;
            return Promise.resolve({});
          } else {
            return error;
          }
        });

      const bankAccountPromise = PaymentService.bankAccount().$promise.catch(error => {
        if (error.status === 404) {
          this.editMode=true;
          return Promise.resolve({});
        } else {
          return error;
        }
      });

      // DO NOT USE Promise.all it causes problems
      $q.all([
          getBillingUserPromise
          , getCompanyPromise
          , bankAccountPromise])
        .then(all => {

          this.billingUser = all[0];
          this.billingCompany = all[1];
          this.bankAccount = all[2];

          if (!this.billingCompany.name || this.billingCompany.name === '') {
            this.billingCompany.name = this.currentBusiness.name;
          }

          if (!this.billingCompany.tax_number || this.billingCompany.tax_number === '') {
            this.billingCompany.tax_number = this.currentBusiness.abn;
          }

          if (this.billingUser.dob) {
            this.billingUser.dob = "**/**/****";
          }

          if (this.editMode) {
            this.bulkEdit();
          }

          this.processing = false
        });
    };

    this.init();
  }

  bulkEdit() {
    this.editBillingUser();
    this.editBankAccount();
    this.editCompanyDetails();
    this.editMode=true;
  }

  editBillingUser() {
    this.billingUser.first_name = this.currentUser.firstName;
    this.billingUser.last_name = this.currentUser.lastName;
    this.billingUser.dob = '';
  }

  editBankAccount() {
    this.bankAccount.routing_number = '';
    this.bankAccount.account_number = '';
  }

  editCompanyDetails() {
    this.billingCompany.name = this.currentBusiness.name;
    this.billingCompany.tax_number = this.currentBusiness.abn;
  }

  cancelBulkEdit() {
    if (!this.returnToProject(false)) {
      this.editMode = false;
      this.init();
    }
  }

  bulkSubmit() {
    this.processing=true;
    this.editMode=false;
    this.personalDetailsForm.mobile.$error.exists =false;
    this.personalDetailsForm.$setSubmitted();
    this.businessDetailsForm.$setSubmitted();
    this.bankAccountForm.$setSubmitted();

    if (this.personalDetailsForm.$invalid
      || this.businessDetailsForm.$invalid
      || this.bankAccountForm.$invalid) {

      if(this.personalDetailsForm.$invalid){
        this.scrollToPos("personal");
      }else if(this.businessDetailsForm.$invalid){
        this.scrollToPos("business");
      }else{
        this.scrollToPos("banking");
      }
      this.editMode=true;
      this.processing=false;
      return;
    }

    if (this.sameAsPersonalAddress) {
      Object.assign(this.billingCompany, {
        address_line1: this.billingUser.address_line1,
        city: this.billingUser.city,
        state: this.billingUser.state,
        zip: this.billingUser.zip
      });
    }

    let companyDetPromise = undefined;
    if (this.billingCompany.id) {
      companyDetPromise = this.Payment.updateCompany(this.billingCompany).$promise;
    } else {
      companyDetPromise = this.Payment.createCompany(this.currentUser._id, this.billingCompany).$promise;
    }

    delete this.bankAccount.id;

    // Replace 044 with +6144
    if (this.billingUser.mobile.startsWith('0')) {
      Object.assign(this.billingUser, {mobile: '+61'+this.billingUser.mobile.substr(1)});
    }

    this.$q.all([
      this.Payment.updateUser(this.billingUser).$promise,
      companyDetPromise,
      this.Payment.setBankAccount(this.bankAccount).$promise
    ]).then(resp => {
      if (!this.returnToProject()) {
        // After form submission this state may have changed
        if (this.currentUser.billing.verificationState === 'pending') {
          this.$state.reload();
        } else {
          this.init();
        }
      }
    }).catch(err => {
      this.editMode=true;
      this.processing=false;
      this.personalDetailsForm.$invalid = true;
      if(err.data.errors.mobile[0] === "already exists"){
        this.err = err.data.errors.mobile[0];
        this.personalDetailsForm.mobile.$error.exists =true;
        this.scrollToPos("mobile");
      }

    });
  }

  returnToProject(updateUser = true) {
    if (this._returnToProjectId) {
      (updateUser ? this.updateBillingState() : this.$q.resolve())
        .then(() => this.$state.go('projects', { projectId: this._returnToProjectId }));
    }
    return this._returnToProjectId;
  }

  updateBillingState() {
    return this.User.verifyBillingState().$promise
      .then(() => this.Auth.refresh()); // refresh cached user with new KYC status
  }

  deleteBankAccount($event, accountId) {
    let confirm = this.$mdDialog.confirm()
      .title('Are you sure you want to delete your bank account?')
      .textContent('If this is your primary payment method you will need to set it to something else')
      .ariaLabel('Deleting bank account')
      .targetEvent($event)
      .ok('Yes')
      .cancel('Cancel');
    this.$mdDialog.show(confirm).then(() => {
      this.Payment.deleteBankAccount({id: accountId}).$promise.then( (response) => {
        this.init();
      });
    }, () => {
     return false;
    });
  }

  // Credit card methods will still be required when credit card is brought back with promise pay js integration
  deleteCreditCard($event, accountId) {
    let confirm = this.$mdDialog.confirm()
      .title('Are you sure you want to delete your credit card record?')
      .textContent('If this is your primary payment method you will need to set it to something else')
      .ariaLabel('Deleting credit card account')
      .targetEvent($event)
      .ok('Yes')
      .cancel('Cancel');
    this.$mdDialog.show(confirm).then(() => {
      this.Payment.deleteCardAccount({id: accountId}).$promise.then( (response) => {
        this.creditCard = undefined;
        this.editMode = true;
      });
    }, () => {
     return false;
    });
  }

  editCreditCard() {
    this.editMode= true;
    this.creditCardForm.expiryMonth.$setValidity('ccExpMonth', true);
    this.creditCardForm.expiryYear.$setValidity('ccExpYear', true);
    this.creditCard.securityCode = '';
    this.creditCard.cardNumber = '';
  }

  isCardType(cardType) {
    let _cardType = cardType.toLowerCase();
    return (this.editMode &&
      this.creditCardForm.cardNumber &&
      this.creditCardForm.cardNumber.$ccType &&
      this.creditCardForm.cardNumber.$ccType.toLowerCase()==_cardType) ||
      (!this.editMode && this.creditCard && this.creditCard.cardType.toLowerCase()==_cardType)
  }



  scrollToPos(id) {
    const top = 0;
    const duration = 1000;
    let elementToScrollTo = angular.element(document.getElementById(id));
    this.$document.scrollToElementAnimated(elementToScrollTo, top, duration);
  }

}

angular.module('digitalVillageApp')
  .controller('PaymentsCtrl', PaymentsController);

angular.module('digitalVillageApp')
  .directive('supportedTypes', function() {
    return {
      require: 'ngModel',
      link: function(scope, elm, attrs, ctrl) {
        ctrl.$validators.supportedTypes = function(modelValue) {
          if (ctrl.$isEmpty(modelValue)) {
            return true;
          }

          // Master card check
          if (/^5[1-5]\d{14}$/.test(modelValue)) {
            return true;
          }

          // Visa check
          if (/^4\d{12}(\d{3}|\d{6})?$/.test(modelValue)) {
            return true;
          }

          return false;
        }
      }
    };
  });
