import request from 'request';
import {decorateAddress} from './payment_address';
import {auth} from './payment_auth';

export function createPaymentUser(user) {
  let email = user.email;

  if (process.env.HOST_ENV) {
    const userIdStr = user._id.toString();
    const userIdSubStr = userIdStr.substr(userIdStr.length-8);
    email = process.env.HOST_ENV + '-' + userIdSubStr + '_' + user.email;
  }

  const options = {
    url: process.env.PP_API_HOSTNAME + '/users',
    auth: auth,
    method: 'POST',
    json: true,
    body: {
      id: user._id,
      first_name: user.firstName,
      last_name: user.lastName,
      email: email,
      country: 'AUS'
    }
  };

  return new Promise((resolve, reject) => {
    request(options, function(error, response, body) {
      if (error) {
        reject(error);
      } else if (response.statusCode != 200 && response.statusCode != 201) {
        reject(body);
      } else {
        resolve(body.users);
      }
    });
  });
}

export function getPaymentUser(userId) {
  const options = {
    url: process.env.PP_API_HOSTNAME + '/users/'+userId,
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
        resolve(body.users);
      }
    });
  });
}

export const getPaymentUserWithAddress = userId => getPaymentUser(userId).then(decorateAddress);

export function updatePaymentUser(userId, paymentUser) {
  const options = {
    url: process.env.PP_API_HOSTNAME + '/users/'+userId,
    auth: auth,
    method: 'PATCH',
    json: true,
    body: paymentUser
  };

  return new Promise((resolve, reject) => {
    request(options, function(error, response, body) {
      if (error) {
        reject(error);
      } else if (response.statusCode != 200) {
        reject(body);
      } else {
        resolve(body.users);
      }
    });
  }).then(decorateAddress);
}

export function setDisbursement(userId, accountId) {
  const options = {
    url: `${process.env.PP_API_HOSTNAME}/users/${userId}/disbursement_account`,
    auth: auth,
    method: 'PATCH',
    json: true,
    body: {
      id: userId,
      account_id: accountId
    }
  };

  return new Promise((resolve, reject) => {
    request(options, function(error, response, body) {
      if (error) {
        reject(error);
      } else if (response.statusCode != 200) {
        reject(body);
      } else {
        resolve(body.users);
      }
    });
  });
}
