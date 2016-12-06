'use strict';

angular.module('digitalVillageApp')
  .factory('Project', function ($resource, $http) {
    let projects = $resource('/api/projects/:id?action=:action',
      {
        id: '@id'
      },
      {
        update:             { method: 'PUT' },
        invokeAction:       { method: 'PUT', params: { action: '@action'         }},
        editBrief:          { method: 'PUT', params: { action: 'editBrief'       }},
        addSeller:          { method: 'PUT', params: { action: 'addSeller'       }},
        removeSeller:       { method: 'PUT', params: { action: 'removeSeller'    }},
        offer:              { method: 'PUT', params: { action: 'offer'           }},
        recallBrief:        { method: 'PUT', params: { action: 'recallBrief'     }},
        rejectBrief:        { method: 'PUT', params: { action: 'rejectBrief'     }},
        submitQuote:        { method: 'PUT', params: { action: 'submitQuote'     }},
        recallQuote:        { method: 'PUT', params: { action: 'recallQuote'     }},
        deleteQuote:        { method: 'PUT', params: { action: 'deleteQuote'     }},
        rejectQuote:        { method: 'PUT', params: { action: 'rejectQuote'     }},
        editQuote:          { method: 'PUT', params: { action: 'editQuote'       }},
        acceptQuote:        { method: 'PUT', params: { action: 'acceptQuote'     }},
        acceptAgreement:    { method: 'PUT', params: { action: 'acceptAgreement' }},
        payDeposit:         { method: 'PUT', params: { action: 'payDeposit'      }},
        checkDeposit:       { method: 'PUT', params: { action: 'checkDeposit'    }},
        sellerEditFile:     { method: 'PUT', params: { action: 'sellerEditFile'  }},
        buyerEditFile:      { method: 'PUT', params: { action: 'buyerEditFile'   }},
        payFinalPayment:    { method: 'PUT', params: { action: 'payFinalPayment' }},
        checkFinalPayment:  { method: 'PUT', params: { action: 'checkFinalPayment' }},
        rateBuyer:          { method: 'PUT', params: { action: 'rateBuyer'       }},
        rateSeller:         { method: 'PUT', params: { action: 'rateSeller'      }},
        toggleProjectType:  { method: 'PUT', params: { action: 'toggleProjectType' }},
        acceptCashQuote:    { method: 'PUT', params: { action: 'acceptCashQuote' }},
        completeWork:       { method: 'PUT', params: { action: 'completeWork' }},
        buyerCompleteWork:  { method: 'PUT', params: { action: 'buyerCompleteWork' }},
        sellerCompleteWork: { method: 'PUT', params: { action: 'sellerCompleteWork' }},
        supplierAcceptAgreement: { method: 'PUT', params: { action: 'supplierAcceptAgreement' }}
      }
    );

    projects.deleteProject = function(id, reason){
      return $http({
        method: 'DELETE',
        url : '/api/projects/' + id,
        data: {
          reason: reason
        },
        headers: {"Content-Type": "application/json;charset=utf-8"}
      });
    };

    return projects;
  });
