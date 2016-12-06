'use strict';

angular.module('digitalVillageApp')
  .factory('PaymentService', function ($resource) {
    return $resource('/api/payments/:controller/:id',
      {
        id: '@id'
      },
      {
        session: {
          url: '/api/payments/:controller?itemId=:itemId&paymentType=:paymentType',
          method: 'GET',
          params: {
            controller: 'session'
          }
        },
        bankAccount: { method: 'GET', params: { controller: 'bankAccount' } },
        creditCard: { method: 'GET', params: { controller: 'creditCard' } },
        deleteBankAccount: { method: 'DELETE', params: { controller: 'bankAccount' } },
        deleteCardAccount: { method: 'DELETE', params: { controller: 'creditCard' } },
        setBankAccount: { method: 'PUT', params: { controller: 'bankAccount' } },
        getUser: { method: 'GET', params: { controller: 'user' } },
        updateUser: { method: 'PUT', params: { controller: 'user' } },
        getCompany: { method: 'GET', params: { controller: 'company'} },
        createCompany: { method: 'POST', params: {controller: 'company' } },
        updateCompany: { method: 'PUT', params: {controller: 'company' } }
      }
    );
  });
