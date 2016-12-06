import request from 'request';
import {auth} from './payment_auth';

function translateResponsePayload(payload) {
  return {
    id: payload.id,
    account_name: payload.bank.account_name,
    bank_name: payload.bank.bank_name,
    routing_number: payload.bank.routing_number,
    account_number: payload.bank.account_number
  }
}

export function getBankAccount(userId) {
  const options = {
    url: process.env.PP_API_HOSTNAME + '/users/' + userId + '/bank_accounts',
    auth: auth,
    json: true,
    method: 'GET'
  };

  // These logs are important as PromisePay was being a little unstable and need more details
  return new Promise((resolve, reject) => {
    request(options, function(error, response, body) {
      if (error) {
        reject(error);
      } else if (response.statusCode != 200) {
        reject(body);
      } else {
        resolve(translateResponsePayload(body.bank_accounts));
      }
    });
  });
}

export function createBankAccount(userId, bankAccount) {

  const updates = {
    user_id: userId,
    holder_type : 'business',
    account_type: 'savings',
    country: 'AUS'
  };

  const options = {
    url: process.env.PP_API_HOSTNAME + '/bank_accounts',
    auth: auth,
    json: true,
    method: 'POST',
    body: Object.assign(bankAccount, updates)
  };

  return new Promise((resolve, reject) => {
    request(options, function(error, response, body) {
      if (error) {
        reject(error);
      } else if (response.statusCode != 201) {
        reject(body);
      } else {
        resolve(translateResponsePayload(body.bank_accounts));
      }
    });
  });
}

export function deleteBankAccount(accountId) {
  const options = {
    url: process.env.PP_API_HOSTNAME + '/bank_accounts/' + accountId,
    auth: auth,
    json: true,
    method: 'DELETE'
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else {
        resolve(body);
      }
    });
  });
}

export function getCreditCard(userId) {
  let options = {
    url: process.env.PP_API_HOSTNAME + '/users/' + userId + '/card_accounts',
    auth: auth,
    json: true,
    method: 'GET'
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error || !body) {
        reject(error);
      } else {
        let json_body = body;
        if (json_body && json_body.card_accounts) {
          let cardType;
          switch (json_body.card_accounts.card.type) {
            case 'visa':
              cardType = 'Visa';
              break;
            case 'master':
              cardType = 'MasterCard';
              break;
            case 'american_express':
              cardType = 'American Express';
              break;
            default:
              cardType = json_body.card_accounts.card.type;
          }
          resolve({
            accountId: json_body.card_accounts.id,
            cardHolderName: json_body.card_accounts.card.full_name,
            cardNumber: json_body.card_accounts.card.number,
            expiryMonth: json_body.card_accounts.card.expiry_month,
            expiryYear: json_body.card_accounts.card.expiry_year,
            cardType: cardType,
            securityCode: 'XXXX'
          });
        } else if (json_body.errors && json_body.errors.account == 'no account found') {
          resolve();
        } else {
          reject(json_body);
        }
      }
    });
  });
}

export function deleteCardAccount(accountId) {
  const options = {
    url: process.env.PP_API_HOSTNAME + '/card_accounts/' + accountId,
    auth: auth,
    method: 'DELETE',
    json: true
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else {
        resolve(body);
      }
    });
  });
}
