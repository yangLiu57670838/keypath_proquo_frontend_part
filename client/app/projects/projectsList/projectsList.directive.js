'use strict';

class ProjectsListController {
  constructor(Project, Business, $http, $cacheFactory, $location, $anchorScroll, $state, Auth, modalService, $document, ChatService, Toast, User) {
    this.Project = Project;
    this.Business = Business;
    this.Auth = Auth;
    this.ChatService = ChatService;
    this.$http = $http;
    this.$document = $document;
    this.moment = moment;
    this.projects = [];
    this.Location = $location;
    this.ScrollControll = $anchorScroll;
    this.projectIdToOpen = $location.hash();
    this.Toast = Toast;
    this.filteredActionList = [];
    if ($state.params.projectId) {
      this.projectIdToOpen = $state.params.projectId;
    } else if (!this.projectIdToOpen) {
      this.projectIdToOpen = this.previousParams ? this.previousParams.projectId : undefined;
    }

    this.cache = ($cacheFactory.get('villageAppCache') ? $cacheFactory.get('villageAppCache') : $cacheFactory('villageAppCache'));
    this.modalService = modalService;
    this.$state = $state;
    this.initPagination();

    this.listProjects(this.buildQuery())
      .then(() => {
        const listEmpty = !this.recordCount;
        this.listEmptyCallback && this.listEmptyCallback({ listEmpty });
        this.emptyMessageNeeded = listEmpty && this.showEmptyMessage !== 'false';
      });
    Auth.getCurrentUser(usr=> {if (usr) {this.user = usr;}});

    this.myUserId = this.Auth.getCurrentUser()._id;

    this.filterByStatus = (action, project) => action.states.includes(project.status);

    this.filterByAction = (action, project) => project.availableActions.map(availableAction => availableAction.referenceKey).includes(action.key);

    this.messageActionFilterByStatus = (action, project) => project.brief.supplierId && action.states.includes(project.status);

    this.filteredActionListFunc = (projects) => {
      projects.forEach(project => {
        if (this.myUserId === project.userId) {
          this.filteredActionList.push(this.actionListBuyer.filter(action => action.filterBy(action, project))
            .map(action => this.mapMessageReceiverFirstName(action, project.brief.supplierInfo.firstName)));
        } else {
          this.filteredActionList.push(this.actionListSupplier.filter(action => action.filterBy(action, project))
            .map(action => this.mapMessageReceiverFirstName(action, project.buyerInfo.firstName)));
        }
      });
    };

    this.swapWorkCompletionFilterByStates = (action, project) => {
      return action.states.includes(project.status) &&
        (action.key === 'buyerCompleteWork' && this.myUserId === project.userId && !project.buyerCompletedWork ||
        action.key === 'sellerCompleteWork' && project.collaborators.length > 1 && project.collaborators[1] === this.myUserId && !project.supplierCompletedWork);
    };

    this.mapMessageReceiverFirstName = (action, firstName) => {
      const label = (action.key === 'message') ? "Message " + firstName : action.label;
      return { key: action.key, label };
    };

    // Generates buyer actions (buttons)
    this.actionListBuyer = [
      {
        key: 'message',
        label: 'Message',
        states: [
          null, 'common.draft'
          , 'cash.quote-pending'
          , 'cash.quote-lodged'
          , 'cash.quote-accepted'
          , 'cash.deposit-pending'
          , 'cash.deposit-paid'
          , 'cash.in-progress'
          , 'cash.final-payment-pending'
          , 'cash.final-payment-paid'
          , 'cash.in-dispute'
          , 'common.rating-review-pending'
          , 'common.complete'
          , 'swap.quote-pending'
          , 'swap.quote-lodged'
          , 'swap.swap-quote-lodged'
          , 'swap.deposit-pending'
          , 'swap.deposit-paid'
          , 'swap.in-progress'
          , 'swap.final-payment-pending'
          , 'swap.final-payment-paid'
        ],
        filterBy: this.messageActionFilterByStatus
      },
      {
        key: 'cancelDeleteProject',
        label: 'Cancel project',
        states: ["common.draft", "cash.quote-pending", "cash.quote-lodged", "cash.quote-accepted",
          "swap.quote-pending", "swap.quote-lodged", "swap.swap-quote-lodged"],
        filterBy: this.filterByStatus
      },
      {
        key: 'cancelProject',
        label: 'Cancel project',
        states: ["cash.deposit-pending", "cash.deposit-paid", "cash.in-progress", "cash.final-payment-pending",
          "swap.deposit-pending", "swap.deposit-paid", "swap.in-progress", "swap.final-payment-pending"],
        filterBy: this.filterByStatus
      },
      {
        key: 'buyerCompleteWork',
        label: 'Complete work',
        states: ['swap.in-progress', 'swap.final-payment-pending', 'swap.final-payment-paid'],
        filterBy: this.swapWorkCompletionFilterByStates
      },
      {
        key: 'sellerCompleteWork',
        label: 'Complete work',
        states: ['swap.in-progress', 'swap.final-payment-pending'],
        filterBy: this.swapWorkCompletionFilterByStates
      }
    ];
    // Generates supplier actions (buttons)
    this.actionListSupplier = [
      {
        key: 'message',
        label: 'Message',
        states: [
          null, 'common.draft'
          , 'cash.quote-pending'
          , 'cash.quote-lodged'
          , 'cash.quote-accepted'
          , 'cash.deposit-pending'
          , 'cash.deposit-paid'
          , 'cash.in-progress'
          , 'cash.final-payment-pending'
          , 'cash.final-payment-paid'
          , 'cash.in-dispute'
          , 'common.rating-review-pending'
          , 'common.complete'
          , 'swap.quote-pending'
          , 'swap.quote-lodged'
          , 'swap.swap-quote-lodged'
          , 'swap.deposit-pending'
          , 'swap.deposit-paid'
          , 'swap.in-progress'
          , 'swap.final-payment-pending'
          , 'swap.final-payment-paid'
        ],
        filterBy: this.filterByStatus
      },
      {
        key: 'rejectBrief',
        label: 'Cancel project',
        states: ["cash.quote-pending", "swap.quote-pending"],
        filterBy: this.filterByStatus
      },
      {
        key: 'supplierCancelDeleteProject',
        label: 'Cancel project',
        states: ["cash.quote-lodged", "cash.quote-accepted", "swap.quote-lodged", "swap.swap-quote-lodged"],
        filterBy: this.filterByStatus
      },
      {
        key: 'cancelProject',
        label: 'Cancel project',
        states: ["cash.deposit-pending", "cash.deposit-paid", "cash.in-progress", "cash.final-payment-pending",
          "swap.deposit-pending", "swap.deposit-paid", "swap.in-progress", "swap.final-payment-pending"],
        filterBy: this.filterByStatus
      },
      {
        key: 'completeWork',
        label: 'Complete work',
        states: ['cash.in-progress'],
        filterBy: this.filterByStatus
      },
      {
        key: 'buyerCompleteWork',
        label: 'Complete work',
        states: ['swap.in-progress', 'swap.final-payment-pending', 'swap.final-payment-paid'],
        filterBy: this.swapWorkCompletionFilterByStates
      },
      {
        key: 'sellerCompleteWork',
        label: 'Complete work',
        states: ['swap.in-progress', 'swap.final-payment-pending'],
        filterBy: this.swapWorkCompletionFilterByStates
      }
    ];

  }

  formatDate(projects) {
    projects.map(project => {
      if (project.completionDate) {
        project.projectCycle = 'Completed on ' + moment(project.completionDate).format('DD/MM/YY');
      } else {
        project.projectCycle = project.brief.dueDate ? 'Due ' + moment(project.brief.dueDate).from(moment().startOf('day')) : 'Not specified';
      }
    })
  }

  initPagination() {
    //pagination options
    this.pagingOptions = {};
    this.pagingOptions.pageLimitPerSection = 5;
    this.pagingOptions.pageSize = 20;
    this.pagingOptions.pageNum = 1;
    this.pagingOptions.totalRecord = 0;
    this.pagingOptions.currentSectionNum = 1;

    //manage param in cache
    let prevProjectListOptions = this.getSearchParams();
    if (prevProjectListOptions) {
      this.pagingOptions.pageNum = prevProjectListOptions.pagingOptions.pageNum;
    } else {
      let projectListOptions = {};
      projectListOptions.pagingOptions = this.pagingOptions;
      this.cache.put(this.cacheKey, projectListOptions);
    }
  }

  buildQuery() {
    let query = {};
    query.pageSize = this.pagingOptions.pageSize;
    query.pageNum = this.pagingOptions.pageNum;
    // collaborators depositPayment buyerCompletedWork supplierCompletedWork fields are required to decorate availableActions
    query.fields = '"brief.workTitle brief.supplierId brief.supplierInfo brief.dueDate status userId buyerInfo collaborators depositPayment buyerCompletedWork supplierCompletedWork completionDate"';

    let filter = this.filter;
    query.filter = JSON.stringify(filter);
    query.sort = "updatedAt:desc";
    return query;
  }

  changePage() {
    this.getSearchParams().pagingOptions.pageNum = this.pagingOptions.pageNum;
    this.currentSectionNum = Math.floor(this.pagingOptions.pageNum / this.windowSize);
    this.getSearchParams().pagingOptions.currentSectionNum = this.pagingOptions.currentSectionNum;
    let query = this.buildQuery();
    this.listProjects(query);
  }

  listProjects(query) {
    return this.Project.query(query, (value, responseHeaders) => {
      this.recordCount = Number(responseHeaders('record-count'));
      this.pagingOptions.totalRecord = this.recordCount;
    }).$promise.then((projects) => {
        this.filteredResults = projects;
        this.windowSize = projects.length;
        this.projects = projects && projects.length > 0 ? projects : [];
        if (this.projects.length) {

          this.projects.forEach(project => {
            if (this.myUserId == project.userId) {
              this.Business.get({ id: project.brief.supplierId }).$promise.then(otherBusiness => project.otherBusiness = otherBusiness);
            } else {
              this.Business.query({ filter: { userId: project.userId } }).$promise.then(([otherBusiness]) => project.otherBusiness = otherBusiness);
            }
          });
        }
        this.formatDate(this.projects);
        this.filteredActionListFunc(this.projects);
        this.reposition(projects);
      })
      .catch(err => {
        this.errors = err.message;
      });
  }

  getSearchParams() {
    return this.cache.get(this.cacheKey);
  }

  reposition(projects) {
    if (this.projectIdToOpen) {
      let projectAvailable = false;
      var match = _.each(projects, (project)=> {
        if (project._id === this.projectIdToOpen) projectAvailable = true;
      }, this);
      if (projectAvailable) {
        this.anchorProjectId = this.projectIdToOpen;
        let newHash = 'anchor' + this.anchorProjectId;
        if (this.Location.hash() !== newHash) {
          this.Location.hash(newHash);
        } else {
          this.ScrollControll();
        }
      } else {
        this.anchorProjectId = undefined;
      }
    } else {
      this.anchorProjectId = undefined;
    }
  }

  isBuyerIn(project) {
    return project && angular.equals(this.user._id, project.userId);
  }

  toggleActions(project) {
    project.showActionList = !project.showActionList;
  }

  /* buyer functions */
  buyerCancelProject = (id, reason) => {
    this.Project.deleteProject(id, reason).then(() => {
      this.listProjects(this.buildQuery());
    });
  };

  /* supplier functions*/
  supplierProjectBriefReject = (id, reason) => {
    var self = this;
    this.Project.rejectBrief({ "id": id }, { brief: { rejectReason: reason } }).$promise.then(function () {
      self.changePage();
      self.scrollToPos('projects');
    });
  };

  supplierProjectQuoteCancel = (id, reason) => {
    var self = this;
    this.Project.deleteQuote({ "id": id }, { quote: { rejectReason: reason } }).$promise.then(function () {
      self.changePage();
      self.scrollToPos('projects');
    });
  };

  supplierProjectQuoteRecall = (id) => {
    var self = this;
    this.Project.recallQuote({ "id": id }).$promise.then(function () {
      self.changePage();
      self.scrollToPos('projects');
    });
  };

  //seller complete work
  completeWork = (projectId) => {
    var self = this;
    this.Project.completeWork({ "id": projectId }, {}).$promise.then(project => {
      self.User.get({ id: project.userId }).$promise.then(buyer => {
        self.Toast.show("We will let " + buyer.firstName +
          " know that work is complete from your end so that payment can be processed.")
      }, (error)=> {
        console.log(error);
      });
      this.$state.go("projects", { projectId: projectId }, { reload: true });
    }, (error)=> {
      console.log(error);
    });
  };

  //swap buyer complete work
  swapBuyerCompleteWork = (projectId) => {
    this.Project.buyerCompleteWork({ "id": projectId }, {}).$promise.then(project => {
      this.$state.go("projects", { projectId: projectId }, { reload: true });
    }, (error)=> {
      console.log(error);
    });
  };

  //swap seller complete work
  swapSellerCompleteWork = (projectId) => {
    this.Project.sellerCompleteWork({ "id": projectId }, {}).$promise.then(project => {
      this.$state.go("projects", { projectId: projectId }, { reload: true });
    }, (error)=> {
      console.log(error);
    });
  };

  scrollToPos(id) {
    var top = 0;
    var duration = 1000;
    var elementToScrollTo = angular.element(document.getElementById(id));
    this.$document.scrollToElementAnimated(elementToScrollTo, top, duration);
  }

  doAction(event, action, project) {
    var projectId = project._id;

    var item;
    switch (action) {
      case "message":
        this.showChatModal(project);
        break;
      case "cancelDeleteProject":
        if (project.collaborators.length == 2) {
          item = {
            title: 'Cancel project',
            confirmCallback: this.buyerCancelProject,
            id: projectId,
            confirmationMessage: "Are you sure you want to cancel the project and discard all details?<br/> We'll let the supplier know you don't want to go ahead with the project."
          };
          this.modalService.showGenericConfirmWithReasonModal(this.$event, item);
        } else {
          item = {
            title: 'Cancel project',
            confirmCallback: this.buyerCancelProject,
            id: projectId,
            confirmationMessage: "Are you sure you want to cancel the project and discard all details?"
          };
          this.modalService.showGenericConfirmModal(this.$event, item);
        }
        break;
      case "supplierCancelDeleteProject":
        item = {
          confirmCallback: this.supplierProjectQuoteCancel,
          id: projectId,
          confirmationMessage: "Are you sure you want to cancel the project and discard all details?<br/> We'll let the buyer know you don't want to go ahead with the project."
        };
        this.modalService.showGenericConfirmWithReasonModal(this.$event, item);
        break;
      case "rejectBrief":
        item = {
          confirmCallback: this.supplierProjectBriefReject,
          id: projectId,
          confirmationMessage: "Are you sure you want to cancel the project and discard all details? We'll let the buyer know you don't want to go ahead with the project."
        };
        this.modalService.showGenericConfirmWithReasonModal(this.$event, item);
        break;
      case "recallQuote":
        item = {
          confirmCallback: this.supplierProjectQuoteRecall,
          id: projectId,
          confirmationMessage: "Are you sure you want to recall the project and discard all details? We'll let the buyer know you have recalled."
        };
        this.modalService.showGenericConfirmModal(this.$event, item);
        break;
      case "cancelProject":
        item = {
          depositPaid: project.status != 'cash.deposit-pending'
        };
        this.modalService.showCancelInProgressProjectConfirmModal(this.$event, item);
        break;
      case "completeWork":
        item = {
          confirmCallback: this.completeWork,
          id: project._id,
          confirmationMessage: "Are you sure you want to complete work on the project?"
        };
        this.modalService.showGenericConfirmModal(undefined, item);
        break;

      case "sellerCompleteWork":
        item = {
          confirmCallback: this.swapSellerCompleteWork,
          id: project._id,
          confirmationMessage: "Are you sure you want to complete work on the project?"
        };
        this.modalService.showGenericConfirmModal(undefined, item);
        break;
      case "buyerCompleteWork":
        item = {
          confirmCallback: this.swapBuyerCompleteWork,
          id: project._id,
          confirmationMessage: "Are you sure you want to complete work on the project?"
        };
        this.modalService.showGenericConfirmModal(undefined, item);
        break;
      default:

    }
  }

  showChatModal(project) {
    const otherUserId = project.collaborators.find((collaboratorId) => this.user._id != collaboratorId) ||
      this.Business.get({ id: project.brief.supplierId }).$promise.then((otherBusiness) => otherBusiness.userId);
    Promise.resolve(otherUserId).then(otherUserId => this.ChatService.startChat(otherUserId));
  }
}

angular.module('digitalVillageApp')
  .directive('projectsList', () => {
    return {
      templateUrl: 'app/projects/projectsList/projectsList.html',
      controller: ProjectsListController,
      controllerAs: 'vm',
      restrict: 'E',
      bindToController: {
        showEmptyMessage: '@',  // `true` by default
        cacheKey: '@',
        filter: '=',
        listEmptyCallback: '&', // called with listEmpty == `true` if the list is empty, listEmpty == `false` if not empty
      },
      scope: {}
    };
  });
