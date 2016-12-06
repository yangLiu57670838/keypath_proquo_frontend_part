/**
 * Created by cmckinnon on 25/02/16.
 */
import q from 'q';
import request from 'request';
const parseString = require('xml2js').parseString;

function validateDigits(abn) {
  if (!abn || abn.length != 11) {
    return false;
  } else {
    let weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    let checkValue = 0;

    for (let i = 0; i < 11; i++) {
      let thisDigit = parseInt(abn[i]);
      if (i == 0) {
        checkValue = (thisDigit - 1) * weights[i];
      }
      else {
        checkValue += (thisDigit * weights[i])
      }
    }
    return checkValue % 89 == 0;
  }
}

// Extract a minimal subset of org info of interest to us from the abr data
function extractOrgInfo(abrNode) {
  const orgInfo = {};

  orgInfo.abnVerified = true;
  if (abrNode.goodsAndServicesTax) {
    orgInfo.gstRegistered = true;
  } else {
    orgInfo.gstRegistered = false;
  }
  orgInfo.organisationNames = abrNode.mainName;
  orgInfo.organisationTradingNames = abrNode.mainTradingName;
  orgInfo.organisationLegalNames = abrNode.legalName;
  orgInfo.addresses = abrNode.mainBusinessPhysicalAddress;

  return orgInfo;
}

function validateABN(abn) {
  const deferred = q.defer();
  if (!validateDigits(abn)) {
    const errorMsg = {
      name: 'ValidationError',
      errors: {
        abn: {
          message: 'Invalid ABN - please check if you have typed it correctly.'
        }
      }
    };
    deferred.reject(errorMsg);
  } else {
    const url = 'http://abr.business.gov.au/abrxmlsearch/ABRXMLSearch.asmx/SearchByABNv201408?searchString='
      + abn
      + '&includeHistoricalDetails=N&authenticationGuid=' + process.env.ABR_GUID;

    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        parseString(body, function (err, res) {


          let reply = res.ABRPayloadSearchResults.response;

          if (reply[0] && reply[0].exception && reply[0].exception.length > 0) {
            deferred.reject({
              name: 'LookupError',
              errors: {
                abn: {
                  message: reply[0].exception[0].exceptionDescription[0],
                  error: reply[0].exception
                }
              }
            })
          } else {
            let orgInfo = {};
            if (reply instanceof Array && reply.length > 0) {
              orgInfo = extractOrgInfo(reply[0].businessEntity201408[0]);
            }

            deferred.resolve(orgInfo);
          }
        });
      } else {
        // Show the error returned
        parseString(error, function (err, result) {
          let errorMsg = {
            name: 'InternalError',
            errors: {
              abn: {
                message: 'Error looking up ABN service',
                error: result
              }
            }
          };
          deferred.reject(errorMsg);
        });
      }
    });
  }

  return deferred.promise;
}

function searchByName(name) {
  const deferred = q.defer();
  const url = 'http://abr.business.gov.au/abrxmlsearch/ABRXMLSearch.asmx/ABRSearchByNameAdvancedSimpleProtocol2006?name='
    + name
    + '&maxSearchResults=10&postcode=&legalName=&tradingName=&NSW=&SA=&ACT=&VIC=&WA=&NT=&QLD=&TAS=&searchWidth=&minimumScore='
    + '&authenticationGuid=' + process.env.ABR_GUID;

  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      parseString(body, function (err, res) {
        const reply = res.ABRPayloadSearchResults.response;
        if (reply[0].exception) {
          deferred.reject(reply[0].exception);
        } else if (!reply[0].searchResultsList || reply[0].searchResultsList.length < 1) {
          deferred.reject({message: 'No organisations found.'});
        } else {
          const orgInfoArray = reply[0].searchResultsList[0].searchResultsRecord.map((rec) => {
            return extractOrgInfo(rec);
          });
          deferred.resolve(orgInfoArray);
        }
      });
    } else {
      // Show the error returned
      parseString(error, function (err, result) {
        const errorMsg = {
          name: 'InternalError',
          errors: {
            abn: {
              message: 'Error looking up ABN service',
              error: result
            }
          }
        };
        deferred.reject(errorMsg);
      });
    }
  });

  return deferred.promise;
}

module.exports = {
  validateABN: validateABN,
  searchByName: searchByName
};
