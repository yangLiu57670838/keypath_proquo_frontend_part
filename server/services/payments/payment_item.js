import request from 'request';
import {auth} from './payment_auth';

/**
 * Create an item for a project deposit with the given users
 */
export function createItem(project, payment, feeId) {
  const item = {
    id: payment._id.toString(),
    name: project.brief.workTitle + " (" + payment.paymentType + ")",
    amount: payment.paymentAmount * 100, // The cost in cents
    payment_type: payment.paymentType === 'deposit' ? 1 : 2, // 1 = Escrow, 2 = Express, 3 = Escrow Partial Release, 4 = Approve
    buyer_id: payment.payerId,
    seller_id: payment.payeeId,
    fee_ids: feeId // Feed ids is a comma separate string
  };

  const options = {
    url: process.env.PP_API_HOSTNAME + '/items',
    auth: auth,
    method: 'POST',
    json: true,
    body: item
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      // We are expecting 201 (Created) here, but as these things go they may change their API and return 200 instead
      if (error) {
        reject(error);
      } else if (response.statusCode != 200 && response.statusCode != 201 && response.statusCode != 422) {
        reject(body);
      } else if (response.statusCode == 422) {
        resolve(updateItem(project, payment));
      } else {
        resolve(body.items);
      }
    });
  });
}

export function updateItem(project, payment) {
  const item = {
    id: payment._id.toString(),
    name: project.brief.workTitle + " (" + payment.paymentType + ")",
    amount: payment.paymentAmount * 100 // The cost in cents
  };

  const options = {
    url: process.env.PP_API_HOSTNAME + '/items/' + item.id,
    auth: auth,
    method: 'PATCH',
    json: true,
    body: item
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) {
        reject(error)
      } else if (response.statusCode != 200) {
        reject(`Could not update payment item: ${JSON.stringify(body.errors)}`);
      } else {
        resolve(body.items);
      }
    });
  });
}

export function getItem(itemId) {
  const options = {
    url: process.env.PP_API_HOSTNAME + '/items/' + itemId,
    auth: auth,
    method: 'GET',
    json: true
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else if (response.statusCode != 200) {
        reject(body);
      } else {
        resolve(body.items);
      }
    });
  });
}

export function getItemStatus(itemId) {
  const options = {
    url: process.env.PP_API_HOSTNAME + '/items/' + itemId + '/status',
    auth: auth,
    method: 'GET',
    json: true
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error || response.statusCode != 200) {
        reject(error);
      } else {
        resolve(body.items);
      }
    });
  });
}

export function cancelItem(itemId) {
  const options = {
    url: process.env.PP_API_HOSTNAME + '/items/' + itemId,
    auth: auth,
    method: 'DELETE',
    json: true
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error || response.statusCode != 200) {
        reject(error);
      } else {
        resolve(body);
      }
    });
  });
}

export function invokeAction(itemId, action) {
  const options = {
    url: process.env.PP_API_HOSTNAME + '/items/' + itemId + '/' + action,
    auth: auth,
    method: 'PATCH',
    json: true
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else if (response.statusCode != 200) {
        reject(body);
      } else {
        resolve(body.items);
      }
    });
  });
}

export const releasePayment = itemId => invokeAction(itemId, 'release_payment');
