import request from 'request';
import {decorateAddress} from './payment_address';
import {getPaymentUser} from './payment_user';
import {auth} from './payment_auth';

export function createCompany(userId, company) {
  const companyPayload = Object.assign(company, {user_id: userId, country: 'AUS'});

  let options = {
    url: process.env.PP_API_HOSTNAME + '/companies',
    auth: auth,
    method: 'POST',
    json: true,
    body: companyPayload
  };

  return new Promise((resolve, reject) => {
    request(options, function(error, response, body) {
      if (error) {
        reject(error);
      } else if (response.statusCode != 201) {
        reject(body);
      } else {
        resolve(body.companies);
      }
    });
  });
}

export function getCompany(companyId) {
  let options = {
    url: process.env.PP_API_HOSTNAME + '/companies/'+companyId,
    auth: auth,
    method: 'GET',
    json: true
  };

  return new Promise((resolve, reject) => {
    request(options, function(error, response, body) {
      if (error) {
        reject(error);
      } else if (response.statusCode != 200) {
        reject(body);
      } else {
        resolve(body.companies);
      }
    });
  });
}

export const getCompanyWithAddress = companyId => getCompany(companyId).then(decorateAddress);

export const getCompanyWithAddressByUserId = userId => getPaymentUser(userId)
  .then(user => getCompany(user.related.companies))
  .then(decorateAddress);

export function updateCompany(companyId, company) {
  const options = {
    url: process.env.PP_API_HOSTNAME + '/companies/'+companyId,
    auth: auth,
    method: 'PATCH',
    json: true,
    body: company
  };

  return new Promise((resolve, reject) => {
    request(options, function(error, response, body) {
      if (error) {
        reject(error);
      } else if (response.statusCode != 200) {
        reject(body);
      } else {
        resolve(body.companies);
      }
    });
  }).then(decorateAddress);
}
