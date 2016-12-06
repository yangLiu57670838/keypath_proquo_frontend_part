'use strict';


class BriefController {
  constructor($scope, $state, $stateParams, Project, $filter, $mdDialog, Document, Auth, modalService, Toast,
              $location, Business, ChatService, $document, $timeout, RequestForQuote) {
    this._$state = $state;
    this._Business = Business;
    this.$document = $document;
    this.budget = "";
    this.Auth = Auth;
    this.dialog = $mdDialog;
    this.document = Document;
    this.modalService = modalService;
    this.ChatService = ChatService;
    this.fileNumberLimit = 10;
    this.Toast = Toast;
    this.scope = $scope;
    this.location = $location;
    this.$filter = $filter;
    this.$timeout = $timeout;
    this.$stateParams = $stateParams;

    this.Auth.getCurrentUser(usr => this.user = usr);
    this.isProquote = !!$stateParams.proquote;
    this.fileNumberLimit = 10;
    this.errors = {};
    this.pageTitle = $state.current.data.pageTitle;
    this.timingSelection = undefined;
    this.timingSelectionRequired = false;
    this.business = undefined;
    this.otherParty = undefined;
    this.engageWith = $stateParams.engageWith;
    this.currencyPattern = /(?=.)^\$?(([1-9][0-9]{0,2}(,[0-9]{3})*)|[0-9]+)?(\.[0-9]{1,2})?$/;
    this.todayDate = new Date();
    this.minDueDate = new Date(
      this.todayDate.getFullYear(),
      this.todayDate.getMonth(),
      this.todayDate.getDate());
    this.businessSwapItems = [];
    this.supplierSwapPreference = false;
    this.swapError = false;
    this.processing = false;
    this.entityUpdateService = this.isProquote ? RequestForQuote : Project;
    this.project = {
      brief: {
        thingsICanSwap: [],
        links: [],
        considerSwap: true
      }
    };

    $scope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
      this.fromStateName = fromState.name;
      this.fromStateParams = fromParams;
    });

    this.init();
  }

  init() {
    const entityId = this.$stateParams.projectId;
    if (entityId) {
      this.entityUpdateService.get({id: entityId}).$promise
        .then(entity => {
          this._loadEntityInfo(entity);
          if (this.readonly) {
            this.pageTitle = this.isProquote ? "View Brief Template" : "View Brief";
          } else {
            this.pageTitle = this.isProquote ? "Modify Brief Template" : "Edit Brief";
          }
        });
    } else if (this.$stateParams.proquote) {// init a new proquote
      this.project.status = 'draft';
      this.supplierSwapPreference = true;
      this.pageTitle = 'Create Project Brief';
    } else {
      this.project.status = 'common.draft';
    }
    if (this.$stateParams.engageWith) {
      this._loadSupplierInfo(this.$stateParams.engageWith)
        .then(supplierBusiness => {
          this.project.brief.supplierId = supplierBusiness._id;
          this.project.brief.supplierInfo = {
            firstName: supplierBusiness.primaryContactFirstName,
            lastName: supplierBusiness.primaryContactFirstName
          };
          this.project.brief.considerSwap = supplierBusiness.acceptsSwaps;
        })
        .catch(() => {
          this.Toast.show("Failed to get seller information.");
          this.gotoProjectsPage();
        });
    }
  }

  _loadSupplierInfo(supplierId) {
    return this._Business.get({id: supplierId}).$promise.then(supplierBusiness => {
      this.otherParty = supplierBusiness;
      this.supplierSwapPreference = supplierBusiness.acceptsSwaps;
      if (!this.readonly && supplierBusiness.acceptsSwaps) {
        this._Business.mine().$promise.then(business => this.getSwapItems(business));
      }
      return supplierBusiness;
    });
  }

  // Load a project or a proquote entity from db
  _loadEntityInfo(entity) {
    if (entity) {
      if (!angular.equals(entity.userId, this.user._id)) {
        this.gotoProjectsPage();
      }
      this.project = entity;
      this.readonly = this._isReadonly();

      this.budget = angular.copy(entity.brief.budget);
      this.formatCurrency();
      if (entity.brief.dueDate) {
        this.project.brief.dueDate = new Date(entity.brief.dueDate);
      }
      if (entity.brief.supplierId) {
        this._loadSupplierInfo(entity.brief.supplierId);
      }
      return entity;
    }
  }

  showBriefSwapSkillsModal($event) {
    this.modalService.showBriefSwapSkillsModal($event, this.businessSwapItems, this.project, this.business);
  }

  getSwapItems(business) {
    if (business) {
      this.business = business;
      this.businessSwapItems = [];

      // Add thingsICanSwap items from business model
      for (var n = 0; n < business.thingsICanSwap.length; n++) {
        this.businessSwapItems.push({chosen: false, swapItem: business.thingsICanSwap[n]});
      }

      // Add 'Offer' items from business model
      for (var i = 0; i < business.offers.length; i++) {
        this.businessSwapItems.push({chosen: false, swapItem: business.offers[i].name});
      }

      // Add 'thingsICanSwap' from project and making sure not to add duplicates
      var addIt = true;
      for (i = 0; i < this.project.brief.thingsICanSwap.length; i++) {
        //if the item isn't present then... add it
        for (n = 0; n < this.businessSwapItems.length; n++) {
          if (this.businessSwapItems[n].swapItem.toLowerCase() === this.project.brief.thingsICanSwap[i].toLowerCase()) {
            addIt = false;
            break;
          }
        }
        if (addIt) {
          this.businessSwapItems.push({swapItem: this.project.brief.thingsICanSwap[i], chosen: true});
        }
        addIt = true;
      }

      // check for items already added when in modify brief mode
      for (i = 0; i < this.businessSwapItems.length; i++) {
        for (n = 0; n < this.project.brief.thingsICanSwap.length; n++) {
          if (this.businessSwapItems[i].swapItem === this.project.brief.thingsICanSwap[n]) {
            this.businessSwapItems[i].chosen = true;
            break;
          }
        }
      }

    }

  }


  removeThingsIcanSwap(index, swapItem) {
    this.project.brief.thingsICanSwap.splice(index, 1);

    for (var i = 0; i < this.businessSwapItems.length; i++) {
      if (swapItem.toLowerCase() === this.businessSwapItems[i].swapItem.toLowerCase()) {
        this.businessSwapItems[i].chosen = false;
      }
    }
  }


  formatCurrency() {
    if (this.budget) {

      //Turn into a string and remove any commas added by our pattern checker and also remove whitespace for good measure
      this.budget = this.budget.toString().replace(/[, ]+/g, "").trim();
      //Copy the amount to our modal which will be our savable version minus any formatting including trailing zero etc
      this.project.brief.budget = angular.copy(this.budget);
      // Ensure number is to 2 decimal places again - with zero ending if needed.
      this.budget = this.$filter('number')(this.budget, 2);
    }

  }


  scrollToPos(skillLabel) {
    const top = 0;
    const duration = 1000;
    let id = skillLabel;
    let elementToScrollTo = angular.element(document.getElementById(id));
    this.$document.scrollToElementAnimated(elementToScrollTo, top, duration);
  }


  //brief is readonly when not a common.draft or user is not the owner
  _isReadonly() {
    if (!this.project || !this.project._id) {
      return false;
    }

    if (!this.project.availableActions) {
      return true;
    }

    return !this.project.availableActions.map( action => {
      return action.referenceKey;
    }).includes('editBrief');
  }

  saveAndClose(form) {
    this.timingSelectionRequired = false;
    form.$setSubmitted();
    // Save brief/project
    if (form.$invalid) {
      return;
    }
    this.saveBrief(form).then(()=> {
      this.gotoProjectsPage();
    });
  }

  gotoProjectsPage() {
    return this.location.url("/projects/" + (this.project._id ? "#" + this.project._id : ''));
  }

  gotoPreviousPage() {
    return this._$state.go(this.fromStateName, this.fromStateParams);
  }

  submit(event, form, findUsers = false) {
    form.$setSubmitted();
    if (this.project.brief.considerSwap && this.project.brief.thingsICanSwap < 1 && this.supplierSwapPreference) {
      this.scrollToPos("swap-required-details");
      this.swapError = true;
      return;
    }
    if (form.$invalid) {
      this.scrollToPos("required-details");
      return;
    }

    if (this.processing) return;
    this.processing = true;

    this._Business.mine().$promise
      .then(business => business.abnVerified && business.name || this.modalService.showABNRegisterModal(event, { business }))
      .then(() => this.saveBrief(form, true))
      .then((rfq) => {findUsers ? this._$state.go('proquote-search', { proquoteId: rfq._id, offerProquoteFlag: true }) : this.gotoProjectsPage()})
      .catch(() => { this.processing = false; });
  }

  //upload attachment dialog;
  promptUploadDialog(form, ev) {
    this.document.uploadAttachment(this.project._id).then(docs => {
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
        newDoc.attachmentType = 'Brief Attachment';
        newDoc.size = doc.size;
        newDoc.attachmentName = doc.filename;
        newDoc.description = doc.filename;
        newDoc.attachedBy = {name: this.user.firstName + ' ' + this.user.lastName, id: this.user._id};

        //check if it is a repeated file
        let repeated = false;
        angular.forEach(this.project.brief.attachments, (existingDoc, idx)=> {
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
      let confirm = this.dialog.confirm()
        .title('Save Attachments')
        .htmlContent('<div>Would you like to replace the following attachments with new one' +
          (repeatedDocs.length > 1 ? 's' : '') + '?</div><div>' + repeatedDocNames + '</div>')
        .ariaLabel('Save Brief Dialog')
        .targetEvent(ev)
        .ok("OK")
        .cancel("Cancel");
      if (repeatedDocs.length > 0) {
        this.dialog.show(confirm).then(()=> {
          angular.forEach(this.project.brief.attachments, (existingDoc, idx)=> {
            angular.forEach(repeatedDocs, (repeatedDoc, idx)=> {
              if (angular.equals(existingDoc.attachmentName, repeatedDoc.attachmentName)) {
                this.document.deleteAttachment({
                  url: existingDoc.url
                });
                existingDoc.url = repeatedDoc.url;
                existingDoc.size = repeatedDoc.size;
                existingDoc.attachmentMimeType = repeatedDoc.attachmentMimeType;
                existingDoc.attachedBy = repeatedDoc.attachedBy;
                return this.saveBrief(form);
              }
            });
          });
        });
      }

      this.project.brief.attachments.push.apply(this.project.brief.attachments, newDocs);
      this.saveBrief(form);
      this._$state.go("brief", {"projectId": this.project._id, proquote: this.isProquote});
    }, console.error);
  };

  //save brief to db
  saveBrief(form, offerToSupplier = false) {
    if (this.timingSelection) {
      this.project.brief.dueDate = moment().add(1, this.timingSelection).toDate();
    }

    const editOrSave = this.project._id // pre-existing project or requestforquote
      ? this.entityUpdateService.invokeAction({
          id: this.project._id,
          brief: this.project.brief,
          action: 'editBrief'
        }).$promise
      : this.entityUpdateService.save(this.project).$promise;
    return editOrSave
      .then(entity => {
        // assign and/or offer to supplier if required
        if (this.isProquote) {
          return this.engageWith
            ? this.entityUpdateService.assignProject({
                id: entity._id,
                sellerIds: this.engageWith,
                offerToSupplier
              }, entity).$promise
            : entity;
        } else {
          return offerToSupplier
            ? this.entityUpdateService.invokeAction({ id: this.project._id, action: 'offer' }).$promise
            : entity;
        }
      })
      .then(entity => {
        const message = offerToSupplier && this.project.brief.supplierName
          ? `Great. Your brief has been sent${ this.isProquote ? '' : ' to ' + this.project.brief.supplierName }!`
          : 'Great. Your brief has been created!';
        this.Toast.show(message);
        this._loadEntityInfo(entity);
        return entity;
      });
  }

  addAttachment(form, ev) {
    let confirm = this.dialog.confirm()
      .title('Save Brief')
      .textContent("Would you like to save the Brief before uploading documents?")
      .ariaLabel('Save Brief Dialog')
      .targetEvent(ev)
      .ok("OK")
      .cancel("Cancel");

    if (form.$dirty || !this.project._id) {
      this.dialog.show(confirm).then(()=> {
        this.timingSelectionRequired = false;
        form.$setSubmitted();
        if (form.$invalid) {
          return;
        }
        this.saveBrief(form);
        this.promptUploadDialog(form, ev);
      });
    } else {
      this.promptUploadDialog(form, ev);
    }
  }

  removeAttachment(attachment, form, ev) {
    let confirm = this.dialog.confirm()
      .title('Delete Attachment')
      .textContent("Would you like to delete the attachment " + attachment.attachmentName + "?")
      .ariaLabel('Delete Attachment')
      .targetEvent(ev)
      .ok("OK")
      .cancel("Cancel");

    this.dialog.show(confirm).then(()=> {
      let idx = this.project.brief.attachments.indexOf(attachment);
      if (idx > -1) {
        this.project.brief.attachments.splice(idx, 1);
      }
      this.document.deleteAttachment({
        url: attachment.url
      });
      this.saveBrief(form);
    });
  }

  numberOfFilesReachLimit(ev) {
    this.dialog.show(
      this.dialog.alert()
        .title('Add Attachments')
        .textContent('You can attach a maximum of ' + this.fileNumberLimit + ' files. Please delete an existing file in order to attach more.')
        .ariaLabel('File Number Limit')
        .ok('OK')
        .targetEvent(ev)
    );
  }

  addLink(form) {
    form.$setSubmitted();
    if (form.$invalid) {
      return;
    }

    this.project.brief.links.unshift({});
  }

  messageName(index) {
    return "briefForm.linkUrlDescription" + index + ".$error";
  }

  removeLink(link) {
    let idx = this.project.brief.links.indexOf(link);
    if (idx > -1) {
      this.project.brief.links.splice(idx, 1);
    }
  }

  discard(ev) {
    const discard = this.dialog.confirm()
      .title('Cancel brief')
      .textContent('Are you sure you want to discard your brief?')
      .ariaLabel('Discard brief')
      .targetEvent(ev)
      .ok('Yes')
      .cancel('No');

    this.dialog.show(discard)
      .then(() => this.project._id && this.entityUpdateService.delete({id: this.project._id}).$promise)
      .then(() => {
        if (this.Auth.isLoggedIn()) {
          this.gotoProjectsPage();
        } else {
          this.gotoPreviousPage();
        }
      });
  }

  editBrief(ev) {
    const modify = this.dialog.confirm()
      .title('Modify brief')
      .textContent('This action will recall the brief?')
      .ariaLabel('Modify brief')
      .targetEvent(ev)
      .ok('Yes')
      .cancel('No');

    if (!this.processing) {
      //this.processing = true;
      this.dialog.show(modify).then(() => {
        if (this.project._id) {
          this.entityUpdateService.invokeAction({id: this.project._id, action: 'recallBrief'}).$promise.then(() => {
            this._$state.go('brief', {projectId: this.project._id}, {reload: true});
          });
        } else {
          // TODO Failed for whatever reason, inform the user maybe with toast
        }
      });
    }
  }

  hasProjectAction(project, action) {
    if (project && action) {
      return _.filter(project.availableActions, availAction => availAction.referenceKey == action).length > 0;
    } else {
      return false;
    }
  }

  showChatModal(ev) {
    let otherUserId = _.find(this.project.collaborators, (collaboratorId) => {
      return this.user._id != collaboratorId;
    });
    if (!otherUserId) {
      //for creating brief, get other user id from other party
      otherUserId = this.otherParty.userId;
    }
    this.ChatService.startChat(otherUserId);
  }
}


angular.module('digitalVillageApp')
  .controller('BriefCtrl', BriefController)
  .directive('number', () => ({
    require: 'ngModel',
    link: (scope, element, attrs, ngModel) => {
      //accept number only
      element.bind("keypress", (event) => {
        let keyCode = event.which || event.keyCode;
        if (keyCode >= 48 && keyCode <= 57 ||
          keyCode == 46 && ngModel.$modelValue.indexOf(".") == -1) {
          return;
        }
        if (event.preventDefault) {
          event.preventDefault();
        }
      });
    }
  }));
