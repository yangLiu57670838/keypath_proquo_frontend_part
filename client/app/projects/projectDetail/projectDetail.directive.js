'use strict';

// TODO FIX THIS: WHAT HAPPENED HERE? NEW ES6 CLASS STRUCTURE WAS MOULDED INTO ES5 AND ALL LOGIC NOW SITS IN CONSTRUCTOR??????
class ProjectDetailController {
  constructor ($rootScope, $scope, Project, Business, Auth, Document, $mdDialog, modalService, Toast, $state) {
    var self = this;
    const icon = {'off': 0, 'inprogress': 1, 'done': 2};
    this.Project = Project;
    this.modalService = modalService;
    this._toast = Toast;
    this.projectId = $scope.projectId;
    this.projectDetail = undefined;
    this.user = Auth.getCurrentUser();
    this.$state = $state;
    self.buyerSupplierTitle = "";


    /* Use this to build our tabs and pass it to the projectTab directive*/
    this.tabModel = {
      allStates: [
        null                            // 0
        , "common.draft"                // 1

        , "cash.quote-pending"          // 2
        , "swap.quote-pending"          // 3
        , "swap.quote-lodged"           // 4
        , "cash.quote-lodged"           // 5

        , "swap.swap-quote-lodged"      // 6
        , "cash.quote-accepted"         // 7
        , "cash.deposit-pending"        // 8
        , "swap.deposit-pending"        // 9

        , "cash.deposit-paid"           // 10
        , "swap.deposit-paid"           // 11
        , "cash.in-progress"            // 12
        , "swap.in-progress"            // 13

        , "cash.final-payment-pending"  // 14
        , "swap.final-payment-pending"  // 15
        , "cash.final-payment-paid"     // 16
        , "swap.final-payment-paid"     // 17

        , "common.rating-review-pending"  // 18
        , "common.complete"               // 19
      ],
      tabs: []
    };



    /* Supplier tab model */
    this.tabModelSupplier =  [
      {
        tabTitle: "Brief",
        tab: "tab-brief",
        setState: function (stateOn) {
          if (stateOn === null  || stateOn === 1) {
            this.stateOn = icon.off;
          }else{
            this.stateOn = icon.done;
          }
          this.state = 'brief-' + Object.keys(icon)[this.stateOn];
          return this.state;
        },
        stateOn: 0,
        active: true,
        template: "app/projects/projectTabs/tab.html"
      },

      {
        tabTitle: "Quote",
        tab: "tab-quote",
        setState: function (stateOn) {
          if (stateOn === null || stateOn < 2) {
            this.stateOn = icon.off;
          } else if ([2, 3, 4].includes(stateOn)) {
            this.stateOn = icon.inprogress;
          } else {
            this.stateOn = icon.done;
          }
          this.state = 'quote-' + Object.keys(icon)[this.stateOn];
          return this.state;
        },
        stateOn: 0,
        active: false,
        template: "app/projects/projectTabs/tab.html"
      },

      {
        tabTitle: "Agreement",
        tab: "tab-deposit",
        setState: function (stateOn) {
          if (stateOn === null || stateOn < 6) {
            this.stateOn = icon.off;
          } else if ([6, 7, 8, 9].includes(stateOn)) {
            this.stateOn = icon.inprogress;
          } else {
            this.stateOn = icon.done;
          }
          this.state = 'deposit-' + Object.keys(icon)[this.stateOn];
          return this.state;
        },
        stateOn: 0,
        active: false,
        template: "app/projects/projectTabs/tab.html"
      },

      {
        tabTitle: "Work Completed",
        tab: "tab-payments",
        setState: function (stateOn, project) {
          if (stateOn === null || stateOn < 12) {
            this.stateOn = icon.off;
            //excluding pure swap work in progress with supplier work completed
          } else if([12, 13, 14, 15, 16, 17].includes(stateOn)
            && !(stateOn === 13 && project.depositPayment &&
            project.depositPayment.paymentAmount === 0 && project.supplierCompletedWork)) {
            this.stateOn = icon.inprogress;
          } else {
            this.stateOn = icon.done;
          }
          this.state = 'payment-' + Object.keys(icon)[this.stateOn];
          return this.state;
        },
        stateOn: 0,
        active: false,
        template: "app/projects/projectTabs/tab.html"
      },

      {
        tabTitle: "Rate & Review",
        tab: "tab-rate",
        setState: function (stateOn, project) {
          // Relying on the list being in order of most recent. Will need to sort by timestamp if this becomes an issue.
          const prevStateLog = _.find(project.log, statusLog => {
            return statusLog.transitionName!== 'sellerEditFile' && statusLog.toState === project.status;
          });
          // If previously in-progress then it has been cancelled via promise pay
          if (stateOn === null || stateOn < 18 ||
            (stateOn === 19 && (prevStateLog.fromState==='cash.in-progress' || prevStateLog.fromState==='swap.in-progress'))
          ) {
            this.stateOn = icon.off;
          } else if (stateOn === 18) {
            this.stateOn = icon.inprogress;
          } else {
            this.stateOn = icon.done;
          }
          this.state = 'rate-' + Object.keys(icon)[this.stateOn];
          return this.state;
        },
        stateOn: 0,
        active: false,
        template: "app/projects/projectTabs/tab.html"
      }
    ];

    /* Buyer tab model */
    this.tabModelBuyer =  [
        {
          tabTitle: "Brief",
          tab: "tab-brief",
          setState: function (stateOn) {
            if (stateOn === null) {
              this.stateOn = icon.off;
            } else if (stateOn === 1) {
              this.stateOn = icon.inprogress;
            }else{
              this.stateOn = icon.done;
            }
            this.state = 'brief-' + Object.keys(icon)[this.stateOn];
            return this.state;
          },
          stateOn: 0,
          active: true,
          template: "app/projects/projectTabs/tab.html"
        },

        {
          tabTitle: "Quote",
          tab: "tab-quote",
          setState: function (stateOn) {
            if (stateOn === null || stateOn < 4) {
              this.stateOn = icon.off;
            } else if ([4, 5].includes(stateOn)) {
              this.stateOn = icon.inprogress;
            } else {
              this.stateOn = icon.done;
            }
            this.state = 'quote-' + Object.keys(icon)[this.stateOn];
            return this.state;
          },
          stateOn: 0,
          active: false,
          template: "app/projects/projectTabs/tab.html"
        },

        {
          tabTitle: "Agreement",
          tab: "tab-deposit",
          setState: function (stateOn) {

            if (stateOn === null || stateOn < 6) {
              this.stateOn = icon.off;
            } else if ([6, 7, 8, 9].includes(stateOn)) {
              this.stateOn = icon.inprogress;
            } else {
              this.stateOn = icon.done;
            }
            this.state = 'deposit-' + Object.keys(icon)[this.stateOn];
            return this.state;
          },
          stateOn: 0,
          active: false,
          template: "app/projects/projectTabs/tab.html"
        },

        {
          tabTitle: "Work Completed",
          tab: "tab-payments",
          setState: function (stateOn, project) {
            if (stateOn === null || stateOn < 12) {
              this.stateOn = icon.off;
              //excluding pure swap work in progress with buyer work completed
            } else if ([12, 13, 14, 15, 16, 17].includes(stateOn)
              && !(stateOn === 13 && project.depositPayment &&
              project.depositPayment.paymentAmount === 0 && project.buyerCompletedWork)) {
              this.stateOn = icon.inprogress;
            } else {
              this.stateOn = icon.done;
            }
            this.state = 'payment-' + Object.keys(icon)[this.stateOn];
            return this.state;
          },
          stateOn: 0,
          active: false,
          template: "app/projects/projectTabs/tab.html"
        },

        {
          tabTitle: "Rate & Review",
          tab: "tab-rate",
          setState: function (stateOn, project) {
            // Relying on the list being in order of most recent. Will need to sort by timestamp if this becomes an issue.
            const prevStateLog = _.find(project.log, statusLog => {
              return statusLog.transitionName!== 'sellerEditFile' && statusLog.toState === project.status;
            });
            // If previously in-progress then it has been cancelled via promise pay
            if (stateOn === null || stateOn < 18 ||
              (stateOn === 19 && (prevStateLog.fromState==='cash.in-progress' || prevStateLog.fromState==='swap.in-progress'))
            ) {
              this.stateOn = icon.off;
            } else if (stateOn === 18) {
              this.stateOn = icon.inprogress;
            } else {
              this.stateOn = icon.done;
            }
            this.state = 'rate-' + Object.keys(icon)[this.stateOn];
            return this.state;
          },
          stateOn: 0,
          active: false,
          template: "app/projects/projectTabs/tab.html"
        }
      ];

    self.getProjectDetails = function() {
      Project.get({id: this.projectId}).$promise.then((project) => {
        if (project) {
          this.projectDetail = project;
          if(this.projectDetail.userId == this.user._id){
            // then i am the buyer
            this.tabModel.tabs = this.tabModelBuyer;
            // so we set the collaborator as the supplier and search for an org using their supplierId (org id)
            self.buyerSupplierTitle = "Supplier";
            if(this.projectDetail.brief.supplierId && this.projectDetail.brief.supplierId !=undefined && this.projectDetail.brief.supplierId != ""){
              self.query= {_id:this.projectDetail.brief.supplierId};
            }
          }else{
            this.tabModel.tabs = this.tabModelSupplier;
            // so we set the collaborator as the buyer and search for an org using their userId
            self.query= {userId:this.projectDetail.userId};
            self.buyerSupplierTitle = "Buyer";
          }
          if(self.query){
            Business.query({filter:self.query}).$promise.then(function(result){
              self.collaborator= result[0];
            });
          }

        }
      });

      this.business = Business.mine();
      var originatorEv;
      this.openMenu = function($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
      };
    };

    if ($scope.initialLoad) {
      self.getProjectDetails();
    }

    $scope.$on('loadProject', (event, payload) => {
      if (payload.projectId == this.projectId) {
        self.getProjectDetails();
      }
    });

    self.fileActionMap = {
      buyerEditFile: {
        files: () => this.projectDetail.buyerFiles,
        uploadAction: files => Project.buyerEditFile({id:this.projectDetail._id, buyerFiles:files }).$promise.then(
          newProject => {
            this.projectDetail = newProject;
          }
        )
      },

      sellerEditFile: {
        files: () => this.projectDetail.sellerFiles,
        uploadAction: files => Project.sellerEditFile({id:this.projectDetail._id, sellerFiles:files }).$promise.then(
          newProject => {
            this.projectDetail = newProject;
          }
        )
      }
    };

    self.removeFile = function(file, ev, projectAction) {
      let confirm = $mdDialog.confirm()
        .title('Delete Attachment')
        .textContent("Would you like to delete the attachment " + file.attachmentName + "?")
        .ariaLabel('Delete Attachment')
        .targetEvent(ev)
        .ok("OK")
        .cancel("Cancel");

      const files = self.fileActionMap[projectAction].files();

      $mdDialog.show(confirm).then( () => {

        let idx = files.indexOf(file);
        if(idx > -1){
          files.splice(idx, 1);
        }
        Document.deleteAttachment({
          url: file.url
        });

        self.fileActionMap[projectAction].uploadAction(files);

      });

    };

    //Return project file List title
    self.fileListTitle = (projectAction) => {
      if (this.projectDetail.nameSpace === 'cash' || this.projectDetail.nameSpace === 'init' || !this.projectDetail.brief.supplierId) {
        return "Files Uploaded (e.g. Project Files, Invoice)";
      }

      if (this.projectDetail.userId == this.user._id) {
        return "Files "+ (projectAction === 'buyerEditFile' ? "sent to " : "from ") + this.projectDetail.brief.supplierName;
      }

      return "Files " + (projectAction === 'sellerEditFile' ? "sent to " : "from ") + this.projectDetail.buyerName;
    };

    //Determine whether to show project file list.
    self.showFileList = (projectAction) => {
      return (this.projectDetail.nameSpace === 'swap' && this.projectDetail.brief.supplierId) || projectAction === 'sellerEditFile';
    };

    //upload attachment dialog;
    self.addFile = function(project, ev, projectAction) {
      Document.uploadAttachment(project._id).then(docs => {
        if(!docs || docs.length==0){
          return;
        }

        let newDocs = [];
        let repeatedDocs = [];
        let repeatedDocNames = "";

        const files = self.fileActionMap[projectAction].files();

        angular.forEach(docs, (doc, idx) => {
          let newDoc = {};
          newDoc.url = doc.url;
          newDoc.attachmentMimeType = doc.mimetype;
          newDoc.attachmentType = 'Brief Attachment';
          newDoc.size = doc.size;
          newDoc.attachmentName = doc.filename;
          newDoc.description = doc.filename;
          newDoc.attachedBy = {name:this.user.firstName + ' ' + this.user.lastName, id: this.user._id};

          //check if it is a repeated file
          let repeated = false;
          angular.forEach(files, (existingDoc, idx) => {
            if(angular.equals(existingDoc.attachmentName, newDoc.attachmentName)) {
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
        let confirm = $mdDialog.confirm()
          .title('Save Attachments')
          .htmlContent('<div>Would you like to replace the following attachments with new one' +
          (repeatedDocs.length > 1 ? 's' : '') + '?</div><div>' + repeatedDocNames + '</div>')
          .ariaLabel('Save Brief Dialog')
          .targetEvent(ev)
          .ok("OK")
          .cancel("Cancel");
        if(repeatedDocs.length > 0) {
          $mdDialog.show(confirm).then(() => {
            angular.forEach(files, (existingDoc, idx) => {
              angular.forEach(repeatedDocs, (repeatedDoc, idx) => {
                if(angular.equals(existingDoc.attachmentName, repeatedDoc.attachmentName) ) {
                  Document.deleteAttachment({
                    url: existingDoc.url
                  });
                  existingDoc.url = repeatedDoc.url;
                  existingDoc.size = repeatedDoc.size;
                  existingDoc.attachmentMimeType = repeatedDoc.attachmentMimeType;
                  existingDoc.attachedBy = repeatedDoc.attachedBy;
                  files.push.apply(files, newDocs);
                  self.fileActionMap[projectAction].uploadAction(files);
                }
              });
            });
          });
        } else {
          files.push.apply(files, newDocs);
          self.fileActionMap[projectAction].uploadAction(files);
        }
      }, console.error);
    };

    self.removeSeller = function (project,event){
      var item = {
        confirmCallback: ()=>{
          this.Project.removeSeller({id: project._id}).$promise.then((result) =>{
            this._toast.show("You have removed " +  this.collaborator.name + " from your project. Now you need to browse for a new supplier.");
            this.$state.reload();
          });
        },
        confirmationMessage: "Are you sure you want to remove " + this.collaborator.name + " from the project?"
      };
      this.modalService.showGenericConfirmModal(event, item)
    };

    self.hasProjectAction = function(project, action) {
      if (project && action) {
        return _.filter(project.availableActions, availAction => availAction.referenceKey == action).length > 0;
      } else {
        return false;
      }
    };

    self.numberOfFilesReachLimit = function(ev){
      $mdDialog.show(
        $mdDialog.alert()
          .title('Add Attachments')
          .textContent('You can attach a maximum of 10 files. Please delete an existing file in order to attach more.')
          .ariaLabel('File Number Limit')
          .ok('OK')
          .targetEvent(ev)
      );
    }
  }
}

angular.module('digitalVillageApp')
  .directive('projectDetail', function () {
    return {
      controller: ProjectDetailController,
      controllerAs: 'vm',
      templateUrl: 'app/projects/projectDetail/projectDetail.html',
      restrict: 'EA',
      scope: {
        'projectId' : '=',
        'initialLoad' : '='
      },
      link: function (scope, element, attrs) {
      }
    };
  });
