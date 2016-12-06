'use strict';

describe('Directive: projectTabs', function () {

  // load the directive's module and view
  beforeEach(module('digitalVillageApp'));
  beforeEach(module('app/projects/projectTabs/projectTabs.html'));

  beforeEach(inject(($rootScope, $httpBackend, $compile, $injector) => {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.when('GET', '/api/users/57731ffe70a4ee0f006aadb0').respond(buyer);
    $httpBackend.when('GET', '/api/users/57732d3b70a4ee0f006aadff').respond(seller);

    scope = $rootScope.$new();

    scope.theModel = theModel;

    scope.tabModel = tabModel;

    scope.tabModel.allStates = [];
    template_place_holder = '<project-tabs tab-model="tabModel" the-model="theModel"></project-tabs>';
    element = angular.element(template_place_holder);

    $compile(element)(scope);
    scope.$digest();
  }));

  it('should get current user info', inject(($httpBackend) => {
    $httpBackend.flush();
    const ctrl = element.controller('projectTabs');
    const currentUser = ctrl.buyer;
    should.equal(currentUser.firstName, 'Richard');
  }));

  it('should have two tabs element', () => {
    const tabsElement = element.find('.project-tab');
    should.equal(tabsElement.length, 5);
  });


  /*
   * all fake data are down here
   * */
  let element, scope, template_place_holder;

  const buyer = {
    "_id": "57731ffe70a4ee0f006aadb0",
    "salt": "cFP08pXPWSOZXoRnBr4qzg==",
    "provider": "local",
    "firstName": "Richard",
    "lastName": "Branson",
    "email": "rb1@gmail.com",
    "password": "JbRuupMc9pxOc/1m/N3NlUYgeAI1vm3i66YK6vccSFJuqGNYFfOlhpyJYFYC+q5fBOn5KDR9CUQVDYuQLTjWNw==",
    "billing": {
      "verificationState": "pending"
    },
    "roles": [
      "user"
    ],
    "emailValidated": true
  };

  const seller = {
    "_id": "57732d3b70a4ee0f006aadff",
    "salt": "okom2L07qG00vqTqxSXqXw==",
    "provider": "local",
    "firstName": "Michael",
    "lastName": "Jordan",
    "email": "mj@gmail.com",
    "password": "kFIzWV8jKtA9yz/ga0/5qdImU+Qsck1ZclRIyB5mLSqC1kMg5lERSjzV6n9pZ3HEFPxiJrEuJoW4e4M35c9XUA==",
    "billing": {
      "verificationState": "pending"
    },
    "roles": [
      "user"
    ],
    "emailValidated": true
  };

  const theModel = {
    "_id": "5775d855f4372d0f00aa425e",
    "brief": {
      "supplierId": "57732d3b70a4ee0f006aae00",
      "considerSwap": false,
      "workTitle": "Cash.Quote-Accepted",
      "description": "Quote accepted",
      "rejectReason": "",
      "_id": "5775d855f4372d0f00aa425f",
      "supplierViewedBrief": true,
      "supplierInfo": {
        "firstName": "Michael",
        "lastName": "Jordan"
      },
      "thingsICanSwap": [],
      "attachments": [],
      "links": []
    },
    "userId": "57731ffe70a4ee0f006aadb0",
    "quote": {
      "fee": 5000,
      "gst": 0,
      "_id": "57760716075bb90f00b500d5",
      "deliverables": [],
      "termsAndConditions": [],
      "gstPayable": true,
      "swapServices": false
    },
    "collaborators": [
      "57731ffe70a4ee0f006aadb0",
      "57732d3b70a4ee0f006aadff"
    ],
    "buyerFiles": [],
    "sellerFiles": [],
    "buyerInfo": {
      "firstName": "Richard",
      "lastName": "Branson"
    },
    "supplierReviewed": false,
    "buyerReviewed": false,
    "supplierCompletedWork": false,
    "buyerCompletedWork": false,
    "nameSpace": "cash",
    "status": "cash.quote-accepted"
  };

  const tabModel = {
    tabs: [
      {
        "tabTitle": "Brief",
        "tab": "tab-brief",
        "stateOn": 0,
        "active": true,
        "template": "app/projects/projectTabs/tab.html"
      },
      {
        "tabTitle": "Quote",
        "tab": "tab-quote",
        "stateOn": 0,
        "active": false,
        "template": "app/projects/projectTabs/tab.html"
      },
      {
        "tabTitle": "Agreement",
        "tab": "tab-deposit",
        "stateOn": 0,
        "active": false,
        "template": "app/projects/projectTabs/tab.html"
      },
      {
        "tabTitle": "Work Completed",
        "tab": "tab-payments",
        "stateOn": 0,
        "active": false,
        "template": "app/projects/projectTabs/tab.html"
      },
      {
        "tabTitle": "Rate & Review",
        "tab": "tab-rate",
        "stateOn": 0,
        "active": false,
        "template": "app/projects/projectTabs/tab.html"
      }
    ]
  }
});
