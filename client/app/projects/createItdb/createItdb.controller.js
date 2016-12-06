'use strict';

class CreateItdbController {
  constructor($state, $stateParams, $filter, $mdDialog, Document, Auth, modalService, Toast,
              $document, itdbService) {

    this.dialog = $mdDialog;
    this.modalService = modalService;
    this._$state = $state;
    this.document = Document;
    this.$document = $document;
    this.Auth = Auth;
    this.itdbService = itdbService;
    this.$stateParams = $stateParams;
    this.Toast = Toast;
    this.numberFilter = $filter('number');

    this.step = 0;
    this.currencyPattern = /(?=.)^\$?(([1-9][0-9]{0,2}(,[0-9]{3})*)|[0-9]+)?(\.[0-9]{1,2})?$/;

    this.steps = [
      { step: "" },
      { step: "" },
      { step: "" }
    ];

    this.budget = "";
    this.itdb = {};

    this.estimatedDurationSliderPositions = [
      '< a week',
      '2 weeks',
      '4 weeks',
      '2 months',
      '3 months',
      '4 months',
      '5 months',
      '> 6 months'
    ];

    this.noTimeSpan = false;
    this.estimatedDurationSliderPosition = 4;

    this.Auth.getCurrentUser((usr) => {
      this.user = usr;
      this.itdb = {
        acceptsSwap: false,
        acceptsCash: false,
        brief: {
          budget: "",
          considerSwap: false,
          links: [],
          attachments: []
        }
      };
    });
    this.init();
  }

  onSideChange() {
    this.sliderText = "";
    if (this.estimatedDurationSliderPosition > 0 && this.estimatedDurationSliderPosition < 7) {
      this.sliderText = this.estimatedDurationSliderPositions[this.estimatedDurationSliderPosition];
    }

  }

  formatCurrency() {
    if (this.budget) {
      //Turn into a string and remove any commas added by our pattern checker and also remove whitespace for good measure
      const budget = this.budget.toString().replace(/[, ]+/g, "").trim();
      //Copy the amount to our modal which will be our savable version minus any formatting including trailing zero etc
      this.itdb.brief.budget = budget;
      // Ensure number is to 2 decimal places again - with zero ending if needed.
      this.budget = this.numberFilter(budget, 2);
    }
  }

  gotoStep(form, stepOn) {
    if (this.validateForm(form)) {
      this.step = stepOn;
      this.scrollToPos("project-invitation");
      if (this.itdb._id) {
        this._$state.go("createItdbEdit", { "projectId": this.itdb._id, "hashId": stepOn }, { notify: false });
      }
    }

  }

  validateForm(form) {
    form.$setSubmitted();
    if (form.$invalid) {
      this.scrollToPos("project-invitation");
      return false;
    }
    this.checkboxInvalid = false;
    if (!this.itdb.acceptsCash && !this.itdb.acceptsSwap) {
      this.checkboxInvalid = true;
      this.scrollToPos("check-box");
      return false;
    }
    return true;
  }

  scrollToPos(skillLabel) {
    const top = 0;
    const duration = 1000;
    let id = skillLabel;
    let elementToScrollTo = angular.element(document.getElementById(id));
    this.$document.scrollToElementAnimated(elementToScrollTo, top, duration);
  }

  addLink(form) {
    form.$setSubmitted();
    if (form.$invalid) {
      return;
    }
    this.itdb.brief.links.unshift({});

  }

  removeLink(link) {
    let idx = this.itdb.brief.links.indexOf(link);
    if (idx > -1) {
      this.itdb.brief.links.splice(idx, 1);
    }
  }

  confirmDiscardInvite() {
    const item = {
      confirmCallback: () => {
        this._$state.go("skill-search");
      },
      title: "Discard Invitation",
      confirmationMessage: "Are you sure you want to discard this offer?"
    };
    this.modalService.showGenericConfirmModal(null, item);
  }

  addAttachment(form, ev) {
    let confirm = this.dialog.confirm()
      .title('Save Offer')
      .textContent("Would you like to save the Offer before uploading documents?")
      .ariaLabel('Save Offer Dialog')
      .targetEvent(ev)
      .ok("OK")
      .cancel("Cancel");

    if (form.$dirty || !this.itdb._id) {
      this.dialog.show(confirm).then(() => {
        form.$setSubmitted();
        if (form.$invalid) {
          return;
        }
        this.promptUploadDialog(form, ev);
      });
    } else {
      this.promptUploadDialog(form, ev);
    }
  }

  promptUploadDialog(form, ev) {
    this.document.uploadAttachment(this.itdb._id).then(docs => {
      if (!docs || docs.length == 0) {
        return;
      }
      let newDocs = [];
      let repeatedDocs = [];
      let repeatedDocNames = "";
      docs.forEach((doc) => {
        const newDoc = {
          url: doc.url,
          attachmentMimeType: doc.mimetype,
          attachmentType: 'Offer Attachment',
          size: doc.size,
          attachmentName: doc.filename,
          description: doc.filename,
          attachedBy: { name: this.user.firstName + ' ' + this.user.lastName, id: this.user._id },
        };

        //check if it is a repeated file
        let repeated = false;
        this.itdb.brief.attachments.forEach((existingDoc) => {
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

      const hashId = "1";
      //confirm and replace name-duplicated files
      let confirm = this.dialog.confirm()
        .title('Save Attachments')
        .htmlContent('<div>Would you like to replace the following attachments with new one' +
          (repeatedDocs.length > 1 ? 's' : '') + '?</div><div>' + repeatedDocNames + '</div>')
        .ariaLabel('Save Offer Dialog')
        .targetEvent(ev)
        .ok("OK")
        .cancel("Cancel");
      if (repeatedDocs.length > 0) {
        this.dialog.show(confirm).then(() => {
          this.itdb.brief.attachments.forEach((existingDoc) => {
            repeatedDocs.forEach((repeatedDoc) => {
              if (angular.equals(existingDoc.attachmentName, repeatedDoc.attachmentName)) {
                this.document.deleteAttachment({
                  url: existingDoc.url
                });
                existingDoc.url = repeatedDoc.url;
                existingDoc.size = repeatedDoc.size;
                existingDoc.attachmentMimeType = repeatedDoc.attachmentMimeType;
                existingDoc.attachedBy = repeatedDoc.attachedBy;
                return this.saveInvite().then(() => {
                  if (isCreation) {
                    this._$state.go("createItdbEdit", {
                      "projectId": this.itdb._id,
                      "hashId": hashId
                    }, { notify: false });
                  }
                });
              }
            });
          });
        });
      }

      this.itdb.brief.attachments.push.apply(this.itdb.brief.attachments, newDocs);
      this.saveInvite().then((isCreation) => {
        if (isCreation) {
          this._$state.go("createItdbEdit", { "projectId": this.itdb._id, "hashId": hashId }, { notify: false });
        }
      });
    }, console.error);
  }

  saveAndClose() {
    this.saveInvite().then(() => {
      this._$state.go("projects");
    })
  }

  saveInvite() {
    this.itdb.estimatedDuration = this.noTimeSpan ? null : this.estimatedDurationSliderPositions[this.estimatedDurationSliderPosition];
    // quick fix, need to refactor eliminating itbd.acceptsSwap in favor of itdb.brief.considerSwap
    this.itdb.brief.considerSwap = this.itdb.acceptsSwap;

    //If this is an update then call the invokeAction
    if (this.itdb._id) {
      return this.itdbService.update({ action: 'editBrief' }, this.itdb).$promise.then((entity) => {
        this._loadEntityInfo(entity);
        return false;
      });
    } else {
      // Else we are saving for the first time
      return this.itdbService.save(this.itdb).$promise.then((entity) => {
        this._loadEntityInfo(entity);
        const message = 'Great. Your offer has been created!';
        this.Toast.show(message);
        return true;
      });
    }
  }

  _loadEntityInfo(entity) {
    if (entity) {
      if (entity.estimatedDuration) {
        const index = this.estimatedDurationSliderPositions.indexOf(entity.estimatedDuration);
        if (index >= 0) {
          this.estimatedDurationSliderPosition = index;
        }
      } else {
        // stick with the default estimatedDuration in case the user unchecks the "don't know" duration checkbox
      }

      this.itdb = entity;
      this.budget = angular.copy(entity.brief.budget);
      this.formatCurrency();
      if (this.itdb.estimatedDuration === null) {
        this.noTimeSpan = true;
      } else {
        this.noTimeSpan = false;
      }
    }
  }

  init() {
    const entityId = this.$stateParams.projectId;
    if (this.$stateParams.hashId) {
      this.step = Number(this.$stateParams.hashId);
    }
    if (entityId) {
      this.itdbService.get({ id: entityId }).$promise
        .then(entity => {
          this._loadEntityInfo(entity);
          this.onSideChange();
        });
    }
    this.onSideChange();
  }

  removeAttachment(attachment, ev) {
    let confirm = this.dialog.confirm()
      .title('Delete Attachment')
      .textContent("Would you like to delete the attachment " + attachment.attachmentName + "?")
      .ariaLabel('Delete Attachment')
      .targetEvent(ev)
      .ok("OK")
      .cancel("Cancel");

    this.dialog.show(confirm).then(() => {
      let idx = this.itdb.brief.attachments.indexOf(attachment);
      if (idx > -1) {
        this.itdb.brief.attachments.splice(idx, 1);
      }
      this.document.deleteAttachment({
        url: attachment.url
      });
      this.saveInvite();
    });
  }

  findUsers() {
    this.saveInvite().then(() => {
      this._$state.go("itdb-search", { itdbId: this.itdb._id, offerItdbFlag: true });
    });
  }
}

angular.module('digitalVillageApp')
  .controller('CreateItdbCtrl', CreateItdbController);
