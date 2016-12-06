'use strict';

class QuoteController {
  constructor($scope, Project, $stateParams, Auth, $state, Document, $mdDialog, modalService, User, Business, ChatService, Toast, $document) {
    this.$stateParams = $stateParams;
    this.$state = $state;
    this.$document = $document;
    this.Auth = Auth;
    this._toast = Toast;
    this._Business = Business;
    this._Project = Project;
    this._User = User;
    this._Document = Document;
    this._Dialog = $mdDialog;
    this.ChatService = ChatService;
    this.modalService = modalService;
    this.projectId = this.$stateParams.projectId;
    this.project = undefined;
    this.quote = undefined;
    this.isSeller = true;
    this.pageMode = undefined;
    this.availableActions = [];
    this.canRejectBrief = false;
    this.currencyPattern = /(?=.)^\$?(([1-9][0-9]{0,2}(,[0-9]{3})*)|[0-9]+)?(\.[0-9]{1,2})?$/;
    this.todayDate = new Date();
    this.minDueDate = new Date(
      this.todayDate.getFullYear(),
      this.todayDate.getMonth(),
      this.todayDate.getDate());


    this.Auth.isLoggedIn((isLoggedIn)=> {
      if (isLoggedIn) {
        this.user = Auth.getCurrentUser();
        if (this.projectId) {
          this._Project.get({id: this.projectId}).$promise.then((project) => {
            if (project) {
              this.project = project;
              if(!this.project.quote) {
                this.project.quote = {deliverables: [], termsAndConditions: []};
              }
              if (this.project.brief.considerSwap) {
                if (['swap.quote-pending'].includes(this.project.status) && !this.project.swapProject) {
                  this.project.swapProject = {brief: {links: [], attachments: [], thingsICanSwap: []}};
                }

                if (this.project.swapProject) {
                  if (!this.project.swapProject.brief && ['cash.quote-pending', 'swap.quote-pending'].includes(this.project.status)) {
                    this.project.swapProject.brief = {links: [], attachments: [], thingsICanSwap: []};
                  }

                  if (this.project.swapProject.brief.dueDate) {
                    this.project.swapProject.brief.dueDate = new Date(this.project.swapProject.brief.dueDate);
                  }

                  if (!this.project.swapProject.quote && 'swap.quote-lodged' === this.project.status) {
                    this.project.swapProject.quote = {deliverables: [], termsAndConditions: []};
                  }
                }
              }
              if (this.project.userId == this.user._id) {
                this.isSeller = false;
              }
              this.pageMode = this.identifyPageMode();

              if (this.pageMode === 'none') {
                this.$state.go('brief', {projectId: this.project._id});
              }
              this.availableActions = this.identifyAvailableActions();
              this.buyer = this._User.get({id: this.project.userId});
              if (this.project.collaborators.length > 1) {
                this.seller = this._User.get({id: this.project.collaborators[1]});
              }
              this.business = this._Business.get({id: this.project.brief.supplierId});
              this.calculateTotal();
              this.calculateTotal4Swap();
              this.calculateFinalBalance();
            } else {
              this.$state.go('projects');
            }
          }, (error) => {
            this.$state.go('projects');
          });
        }
      }
    });
  }

  /**
   * based on user role and project status to determine page mode
   */
  identifyPageMode() {
    let mode = undefined;
    if (this.isSeller) {
      if (this.project.status === 'common.draft') {
        mode = 'none';
      } else if (['cash.quote-pending', 'swap.quote-pending'].includes(this.project.status) || this.isSwapBriefEditable()) {
        mode = 'edit';
      } else {
        mode = 'view';
      }
    } else {
      if (['common.draft', 'cash.quote-pending', 'swap.quote-pending'].includes(this.project.status)) {
        //buyer should not see the quote page at all if the project is currently in common.draft or cash.quote-pending
        mode = 'none';
      } else {
        //buyer can see quote if project is not in common.draft or cash.quote-pending
        mode = 'view';
      }
    }
    return mode;
  }

  calculateTotal() {
    if (this.project.quote) {
      if (this.project.quote.gstPayable) {
        this.quoteTotalAmount = Number(this.project.quote.fee) + Number(this.project.quote.gst);
      } else {
        this.project.quote.gst = 0;
        this.quoteTotalAmount = this.project.quote.fee;
      }
      this.quoteDeposit = Number(this.quoteTotalAmount) / 2;
      return this.quoteTotalAmount;
    }
    return 0;
  }

  calculateTotal4Swap() {
    if (this.project.swapProject && this.project.swapProject.quote) {
      if (this.project.swapProject.quote.gstPayable) {
        this.swapQuoteTotalAmount = Number(this.project.swapProject.quote.fee) + Number(this.project.swapProject.quote.gst);
      } else {
        this.project.swapProject.quote.gst = 0;
        this.swapQuoteTotalAmount = this.project.swapProject.quote.fee;
      }
      this.swapQuoteDeposit = Number(this.swapQuoteTotalAmount) / 2;
      return this.swapQuoteTotalAmount;
    }
    return 0;
  }

  identifyAvailableActions() {
    var actions = [];
    _.each(this.project.availableActions, function (action) {
      var actionObj = undefined;
      if (['submitQuote'].includes(action.referenceKey)) {
        actionObj = {
          btnLabel: 'Submit'
        };
      }
      if (action.referenceKey === 'acceptQuote') {
        actionObj = {
          btnLabel: 'Next'
        };
      }
      if (['recallQuote', 'recallSwapQuote'].includes(action.referenceKey)) {
        actionObj = {
          btnLabel: 'Modify'
        };
      }
      if (action.referenceKey === 'rejectBrief') {
        this.rejectBriefAction = {
          btnLabel: "I don't want to quote"
        };
      }
      if (action.referenceKey === 'rejectQuote') {
        this.rejectQuoteAction = {
          btnLabel: 'Reject quote'
        };
      }
      if (actionObj != undefined) {
        actionObj.actionLabel = action.referenceKey;
        actions.push(actionObj);
      }
    }, this);

    return actions;
  }

  clickUpload(form) {
    //$event.preventDefault();
    this._Document.uploadAttachment().then(blobs => {
      _.each(blobs, function (blob) {
        var attachment = {
          attachmentName: blob.filename,
          attachmentMimeType: blob.mimetype,
          attachmentType: 'termsAndConditions',
          size: blob.size,
          url: blob.url,
          description: 'quote terms and conditions',
          attachedBy: {
            name: this.user.firstName + " " + this.user.lastName,
            id: this.user._id
          }
        };
        if (!this.project.quote) {
          this.addQuote();
        } else if (!this.project.quote.termsAndConditions) {
          this.project.quote.termsAndConditions = [];
        }
        this.project.quote.termsAndConditions.push(attachment);
      }, this);
      this.saveQuote(form);
    }, console.error);
  }

  clickUpload4Swap($event, form) {
    //$event.preventDefault();
    this._Document.uploadAttachment().then(blobs => {
      _.each(blobs, function (blob) {
        var attachment = {
          attachmentName: blob.filename,
          attachmentMimeType: blob.mimetype,
          attachmentType: 'termsAndConditions',
          size: blob.size,
          url: blob.url,
          description: 'quote terms and conditions',
          attachedBy: {
            name: this.user.firstName + " " + this.user.lastName,
            id: this.user._id
          }
        };

        this.project.swapProject.quote.termsAndConditions.push(attachment);
      }, this);
      this.saveQuote(form);
    }, console.error);
  }

  addQuote() {
    this.project.quote = {
      termsAndConditions: []
    };
  }

  deleteAttachment(index, form) {
    this.project.quote.termsAndConditions.splice(index, 1);
    this.saveQuote(form);
  }

  deleteTAndC4Swap(index, form) {
    this.project.swapProject.quote.termsAndConditions.splice(index, 1);
    this.saveQuote(form);
  }

  setSwapProjectDate() {
    if (this.project.swapProject) {
      if(this.timingSelection) {
        let today = moment();
        this.project.swapProject.brief.dueDate = angular.equals(this.timingSelection, 'week') ?
          today.add(7, 'days').toDate():
          today.add(1,'months').toDate();
      } else if (!this.project.swapProject.brief.dueDate) {
        this.project.swapProject.brief.dueDate = "";
      }
    }
  }

  saveQuote(form, callback) {
    if (!this.isValidForm(form)) {
      this.scrollToInvalidInputField(form);
      return;
    }

    this.setSwapProjectDate();

    const action = this.project.availableActions.some(action => action.referenceKey === 'editSwapQuote') ? 'editSwapQuote' : 'editQuote';
    this._Project.update({id: this.project._id, action: action}, this.project).$promise.then((result) => {
      if (result.swapProject && result.swapProject.brief.dueDate) {
        result.swapProject.brief.dueDate = moment(result.swapProject.brief.dueDate).toDate();
      }
      this.project = result;

      if (callback) {
        callback();
      }
    }, (error)=> {
      console.log(error);
    });
  }

  saveAndClose = (form) => { this.saveQuote(form, () => this.$state.go('projects', {projectId: this.project._id})) };

  //brief is readonly unless status is cash.quote-pending and user is the supplier (i.e. NOT the owner)
  isReadonly() {
    if (!this.project || !this.project._id) {
      return true;
    }

    if (['cash.quote-pending', 'swap.quote-pending'].includes(this.project.status) && this._User._id !== this.project.userId) {
      return false;
    } else {
      return true;
    }
  }

  //swap quote is editable for buyer
  isSwapQuoteEditable() {
    return this.project.status === 'swap.quote-lodged' && this.user._id === this.project.userId;
  }

  //swap brief is editable for seller
  isSwapBriefEditable() {
    return ['cash.quote-pending', 'swap.quote-pending'].includes(this.project.status) && this.isSeller;
  }

  //seller rejectBrief action
  confirmRejectBrief(event) {
    const item = {
      confirmCallback: this.rejectBrief,
      id: this.projectId,
      title: "Cancel / Delete Project",
      confirmationMessage: "Are you sure you want to cancel the project and discard all details?<br/> We'll let the " + this.buyer.firstName + " know you don't want to go ahead with the project."
    };
    this.modalService.showGenericConfirmWithReasonModal(event, item);
  }

  //seller reject brief
  rejectBrief = (projectId, reason) => {
    this.project.brief.rejectReason = reason;
    this._Project.rejectBrief({"id": this.project._id}, {brief: {rejectReason: reason}}).$promise.then((result) => {
      this.$state.go('projects');
    }, (error)=> {
      console.log(error);
    });
  };

  //seller cancel project(deleteQuote action)
  confirmDeleteQuote(event) {
    const item = {
      title: 'Cancel project',
      confirmCallback: this.deleteQuote,
      id: this.projectId,
      confirmationMessage: "Are you sure you want to cancel the project and discard all details?<br/> We'll let the " + this.buyer.firstName + " know you don't want to go ahead with the project."
    };
    this.modalService.showGenericConfirmWithReasonModal(event, item);
  }

  //seller cancel project(deleteQuote action)
  deleteQuote = (projectId, reason) => {
    this.Project.deleteQuote({"id": this.project._id}, {quote: {rejectReason: reason}}).$promise.then((result) => {
      this.$state.go('projects');
    }, (error)=> {
      console.log(error);
    });
  };

  removeSellerSwapDate() {
    this.project.swapProject.brief.dueDate = undefined;
  }

  //buyer reject quote
  confirmRejectQuote(event) {
    let item = {};
    item.project = this.project;
    item.confirmCallback = this.rejectQuote;
    item.recipientName = this.seller.firstName;
    this.modalService.showRejectQuoteConfirmModal(event, item);

  }

  submitQuoteRegisterABN(event) {
    let item = {};
    item.business = this.business;
    item.confirmCallback = this.submitQuote;
    this.modalService.showABNRegisterModal(event, item);
  }

  submitQuote = (form) => {
    if(this.finalDepositBalance >0 && this.finalDepositBalance <1){
      return;
    }
    if (!this.isValidForm(form)) {
      return;
    }

    this.setSwapProjectDate();

    const action = this.project.availableActions.some(action => action.referenceKey === 'submitSwapQuote') ? 'submitSwapQuote' : 'submitQuote';
    this._Project.update({id: this.project._id, action: action}, this.project).$promise.then((result) => {
      if (action === 'submitSwapQuote') {
        this._toast.show('Great. Your swap quote has been sent to ' + this.seller.firstName);
      }
      this.$state.go('projects');
    }, (error)=> {
      console.log(error);
    });
  };

  //buyer reject quote
  rejectQuote = (reason) => {
    this.project.quote.rejectReason = reason;
    let sellerName = this.seller.firstName;
    this._Project.update({
      id: this.project._id,
      action: 'rejectQuote'
    }, this.project).$promise.then((result) => {
      this._toast.show("You have removed " + sellerName + " from your project. Now you need to browse for a new supplier.");
      this.$state.go('projects');
    }, (error)=> {
      console.log(error);
    });
  };

  isValidForm(form) {
    if (form) {
      form.$setSubmitted();
      if (form['fee']) {
        form['fee'].$setTouched();
      }
      if (form['swapfee']) {
        form['swapfee'].$setTouched();
      }
      if (form['gst']) {
        form['gst'].$setTouched();
      }
      if (form['swapgst']) {
        form['swapgst'].$setTouched();
      }

      return form.$valid;

    }
    return true;
  }

  action(actionLabel, event, form) {
    if (actionLabel === 'deleteQuote') {
      this.confirmDeleteQuote(event);
    } else if (actionLabel === 'rejectQuote') {
      this.confirmRejectQuote(event);
    } else if (actionLabel === 'submitQuote') {
      if (this.business.abnVerified && this.business.name) {
        this.submitQuote(form);
      } else {
        this.submitQuoteRegisterABN(event);
      }
    } else {
      if (!this.isValidForm(form)) {
        return;
      }

      if (this.isSwapBriefEditable()) {
        this.setSwapProjectDate();
      }

      this._Project.update({id: this.project._id, action: actionLabel}, this.project).$promise.then((result) => {
        if (['recallQuote', 'recallSwapQuote'].includes(actionLabel)) {
          var previousStatus = this.project.status;
          this.project = result;
          //re-render page mode and bottom actions if project status was changed
          if (previousStatus != this.project.status) {
            this.pageMode = this.identifyPageMode();
            if (this.pageMode === 'none') {

              this.$state.go('projects');
            }
            this.availableActions = this.identifyAvailableActions();
          }
          this.$state.reload();
        } else if (actionLabel === 'acceptQuote') {
          this.$state.go('agreement', {projectId: this.project._id});
        } else {
          form.$invalid = false;
          this.$state.go('projects');
        }
      }, (error)=> {
        console.log(error);
      });
    }
  }

  showChatModal($event) {
    let otherUserId = _.find(this.project.collaborators, (collaboratorId) => {
      return this.user._id != collaboratorId;
    });
    this.ChatService.startChat(otherUserId);
  }

  close() {
    this.$state.go('projects', {projectId: this.project._id});
  }

  shouldDisableAddDeliverableButton() {
    return this.hasEmptyDeliverables(this.project.quote);
  }

  shouldDisableAddDeliverableButton4SwapQuote() {
    return this.hasEmptyDeliverables(this.project.swapProject.quote);
  }

  hasEmptyDeliverables(quoteObj) {
    return quoteObj.deliverables.some(deliverable => !deliverable || !deliverable.trim());
  }

  addDeliverable(form) {
    if (!this.shouldDisableAddDeliverableButton()) {
      this.project.quote.deliverables.unshift("");
    }
  }

  removeDeliverable(idx) {
    if (idx > -1) {
      this.project.quote.deliverables.splice(idx, 1);
    }
  }

  addDeliverable4SwapQuote(form) {
    if (!this.shouldDisableAddDeliverableButton4SwapQuote()) {
      this.project.swapProject.quote.deliverables.unshift("");
    }
  }

  removeDeliverable4SwapQuote(idx) {
    if (idx > -1) {
      this.project.swapProject.quote.deliverables.splice(idx, 1);
    }
  }


  addLink(form) {
    this.project.swap.links.push({})
  }

  numberOfFilesReachLimit(ev) {
    this._Dialog.show(
      this._Dialog.alert()
        .title('Add Attachments')
        .textContent('You can attach a maximum of ' + this.fileNumberLimit + ' files. Please delete an existing file in order to attach more.')
        .ariaLabel('File Number Limit')
        .ok('OK')
        .targetEvent(ev)
    );
  }

  scrollToPos(id) {
    const elementToScrollTo = angular.element(document.getElementById(id));
    this.$document.scrollToElementAnimated(elementToScrollTo, 120, 1000);
};

  scrollToInvalidInputField(form) {
    //till Angular provides an easier way to loop through all form fields(or even better to get all invalid fields);
    //this is what we have to do :(
    if (form.fee && (form.fee.$invalid || form.gst.$invalid)) {
      this.scrollToPos("fee");
    }
    if (form.swapfee && (form.swapfee.$invalid || form.gst.$invalid)) {
      this.scrollToPos("swapfee");
    }
  }
  //swap
  //swap flag --nameSpace : swap

  addLink2Swap(form) {
    form.$setSubmitted();
    this.scrollToInvalidInputField(form);

    if (form.$valid) {
      this.project.swapProject.brief.links.unshift({});
    }

  }

  deleteLinkFromSwap(link) {
    const idx = this.project.swapProject.brief.links.indexOf(link);
    if (idx != -1) {
      this.project.swapProject.brief.links.splice(idx, 1);
    }
  }


  addAttachment2Swap(form, ev) {
    let confirm = this._Dialog.confirm()
      .title('Save Quote')
      .textContent("Would you like to save the Quote before uploading documents?")
      .ariaLabel('Save Quote Dialog')
      .targetEvent(ev)
      .ok("OK")
      .cancel("Cancel");

    if (form.$dirty || !this.project.swapProject.brief._id) {
      this._Dialog.show(confirm).then(()=> {
        form.$setSubmitted();
        this.scrollToInvalidInputField(form);
        form.fee.$setTouched();
        if (form.$valid) {
          this.saveQuote(form);
          this.promptUploadDialog(form, ev);
        }

      });
    } else {
      this.promptUploadDialog(form, ev);
    }
  }

  promptUploadDialog(form, ev) {
    this._Document.uploadAttachment(this.project._id).then(docs => {
      if (!docs || docs.length == 0) {
        return;
      }

      let newDocs = [];
      let repeatedDocs = [];
      let repeatedDocNames = "";
      angular.forEach(docs, (doc, idx)=> {
        let newDoc = {};
        newDoc.url = doc.url;
        newDoc.attachmentMimeType = doc.mimetype;
        newDoc.attachmentType = 'Swap Brief Attachment';
        newDoc.size = doc.size;
        newDoc.attachmentName = doc.filename;
        newDoc.description = doc.filename;
        newDoc.attachedBy = {name: this.user.firstName + ' ' + this.user.lastName, id: this.user._id};

        //check if it is a repeated file
        let repeated = false;
        angular.forEach(this.project.swapProject.brief.attachments, (existingDoc, idx)=> {
          if (angular.equals(existingDoc.attachmentName, newDoc.attachmentName)) {
            repeated = true;
          }
        });
        if (repeated) {
          repeatedDocs.push(newDoc);
          repeatedDocNames += (repeatedDocNames.length > 0 ? ", " : "") + newDoc.attachmentName;
        } else {
          newDocs.push(newDoc);
        }
      });

      //confirm and replace name-duplicated files
      let confirm = this._Dialog.confirm()
        .title('Save Attachments')
        .htmlContent('<div>Would you like to replace the following attachments with new one' +
          (repeatedDocs.length > 1 ? 's' : '') + '?</div><div>' + repeatedDocNames + '</div>')
        .ariaLabel('Save Quote Dialog')
        .targetEvent(ev)
        .ok("OK")
        .cancel("Cancel");
      if (repeatedDocs.length > 0) {
        this._Dialog.show(confirm).then(()=> {
          angular.forEach(this.project.swapProject.brief.attachments, (existingDoc, idx)=> {
            angular.forEach(repeatedDocs, (repeatedDoc, idx)=> {
              if (angular.equals(existingDoc.attachmentName, repeatedDoc.attachmentName)) {
                this._Document.deleteAttachment({
                  url: existingDoc.url
                });
                existingDoc.url = repeatedDoc.url;
                existingDoc.size = repeatedDoc.size;
                existingDoc.attachmentMimeType = repeatedDoc.attachmentMimeType;
                existingDoc.attachedBy = repeatedDoc.attachedBy;
                return this.saveQuote(form);
              }
            });
          });
        });
      }

      this.project.swapProject.brief.attachments.push.apply(this.project.swapProject.brief.attachments, newDocs);
      return this.saveQuote(form);
    }, console.error);
  }

  deleteAttachmentFromSwap(form, attachment, ev) {
    let confirm = this._Dialog.confirm()
      .title('Delete Attachment')
      .textContent("Would you like to delete the attachment " + attachment.attachmentName + "?")
      .ariaLabel('Delete Attachment')
      .targetEvent(ev)
      .ok("OK")
      .cancel("Cancel");

    this._Dialog.show(confirm).then(()=> {
      const idx = this.project.swapProject.brief.attachments.indexOf(attachment);
      if (idx != -1) {
        this.project.swapProject.brief.attachments.splice(idx, 1);
      }
      this._Document.deleteAttachment({
        url: attachment.url
      });
      this.saveQuote(form);
    });

  }

  toggleProjectType(type) {
    if (type === 'cash' && 'swap' === this.project.nameSpace ||
      type === 'swap' && 'cash' === this.project.nameSpace) {
      this._Project.toggleProjectType({id: this.project._id}).$promise.then((project) => {
        if (project) {
          this.project.nameSpace = project.nameSpace;
          this.project.status = project.status;
          if (this.project.brief.considerSwap) {
            if (['swap.quote-pending'].includes(this.project.status) && !this.project.swapProject) {
              this.project.swapProject = {brief: {links: [], attachments: [], thingsICanSwap: []}};
            }
          }
        }
      }, ()=> {
        this.$state.go('projects', {projectId: this.project._id});
      });
    }
  }

  acceptCashQuote() {
    this._Project.acceptCashQuote({id: this.project._id}, this.project).$promise.then(() => {
      this.$state.go('pay', {projectId: this.project._id});
    }, (error)=> {
      console.log(error);
    });
  }

  getAvailableActions() {
    return this.project.availableActions.map(action => action.referenceKey);
  }


  //seller or buyer pay the deposit
  whoPaysBill() {
    const payee = (this.quoteTotalAmount - this.swapQuoteTotalAmount) < 0 ? 'seller' : 'buyer';
    let payeeName = "you";
    if (payee === 'seller' && !this.isSeller) {
      payeeName = this.seller.firstName;
    }
    if (payee === 'buyer' && this.isSeller) {
      payeeName = this.buyer.firstName;
    }
    return payeeName;
  }

  //the deposit to be paid by whoever quoted less.
  calculateFinalBalance() {
    const quoteTotal = isNaN(this.quoteTotalAmount) ? 0 : Number(this.quoteTotalAmount);
    const swapQuoteTotal = isNaN(this.swapQuoteTotalAmount) ? 0 : Number(this.swapQuoteTotalAmount);
    this.finalBalance = Math.abs(quoteTotal - (this.cashOnly ? 0 : swapQuoteTotal));
    this.finalDepositBalance = this.finalBalance / 2;
  }
}

angular.module('digitalVillageApp')
  .controller('QuoteCtrl', QuoteController);

// range validation: min < diff < max or not ( min < diff < max) if excludeRange is true
// diff = abs(modelValue - offset)
// excludeRange = true if '!' is used
angular.module('digitalVillageApp')
  .directive('range', () => {
    return {
      require: 'ngModel',
      restrict: 'A',
      scope: {
        'rangeOffset': '=',
      },
      link: (scope, element, attrs, ngModel) => {
        const excludeRange = attrs.range[0] === '!';
        const [min, max] = attrs.range.substr(excludeRange ? 1 : 0).split('-');
        ngModel.$validators.range = modelValue => {
          const diff = Math.abs(modelValue - (scope.rangeOffset || 0));
          return !!(excludeRange ^ (min < diff && diff < max));
        };
      }
    };
  });
