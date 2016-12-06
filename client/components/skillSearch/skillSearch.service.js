/**
 * Created by jzhang on 22/07/2016.
 */

class SkillSearchService {
  constructor(Business) {
    this._Business = Business;
  }


  buildFilter(searchOptions) {
    const filter = {
      primaryContactEmailValidated: true
    };

    switch (searchOptions.searchType) {
      case "only":
        filter.keywords = {$regex: ".*" + (searchOptions.searchText ? searchOptions.searchText : ""), $options: "i"};
        break;
      case "skillsOffered":
        if (searchOptions.offeredCategoryIds && searchOptions.offeredCategoryIds.length > 0) {
          filter['offers.refId'] = {'$in': searchOptions.offeredCategoryIds};
        }
        break;
      case "skillsRequired":
        if (searchOptions.requiredCategoryIds && searchOptions.requiredCategoryIds.length > 0) {
          filter['needs.refId'] = {'$in': searchOptions.requiredCategoryIds};
        }
        break;
      case "skillsOfferedAndRequired":
        if (searchOptions.offeredCategoryIds && searchOptions.offeredCategoryIds.length > 0) {
          filter['offers.refId'] = {'$in': searchOptions.offeredCategoryIds};
        }

        if (searchOptions.requiredCategoryIds && searchOptions.requiredCategoryIds.length > 0) {
          filter['needs.refId'] = {'$in': searchOptions.requiredCategoryIds};
        }
    }

    if (searchOptions.searchOrder && searchOptions.searchOrder == "closest" && searchOptions.searchLoc) {
      filter.loc = {
        $near: {
          $geometry: searchOptions.searchLoc
        }
      };
    }

    //Filter out current user's business
    if (searchOptions.excludeUserId) {
      filter.userId = {'$ne': searchOptions.excludeUserId};
    }

    return filter;
  }

  buildFields(searchType) {
    const commonFields = ["userId", "name", "description", "businessEstablished", "experienceYear", "businessLogoUrl",
      "primaryContactFirstName", "primaryContactLastName", "primaryContactAvatarUrl", "numberOfReviews", "totalReviewPoints",
      "averageReviewRating", "suburb", "postCode", "loc", "distance", "createdAt", "primaryContactEmailValidated"];

    switch (searchType) {
      case "only":
      case "skillsOfferedAndRequired":
        commonFields.push("offers", "needs");
        break;
      case "skillsOffered":
        commonFields.push("offers");
        break;
      case "skillsRequired":
        commonFields.push("needs");
        break;
    }
    return `"${commonFields.join(' ')}"`;
  }

  buildSort(searchOptions) {
    let sort = "";
    const shouldSortOnOffers = ["skillsOffered", "only"].includes(searchOptions.searchType);
    switch (searchOptions.searchOrder) {
      // default search order on page loading
      case "skills":
        if (shouldSortOnOffers) {
          sort = "hasOffers:desc";
        } else if (searchOptions.searchType == "skillsRequired") {
          sort = "hasNeeds:desc";
        } else if (searchOptions.searchType == "skillsOfferedAndRequired") {
          sort = "hasOffersAndNeeds:desc"
        }
        break;
      case "newest":
        if (shouldSortOnOffers) {
          sort = "hasOffers:desc|createdAt:desc";
        } else if (searchOptions.searchType == "skillsRequired") {
          sort = "hasNeeds:desc|createdAt:desc";
        }
        break;
      case "rating":
        sort = "averageReviewRating:desc|createdAt:desc";
        break;
      case "closest":
        if (searchOptions.searchLoc) {
          sort = "distance:asc|averageReviewRating:desc|createdAt:desc";
        }
        break;
    }
    return sort;
  }

  buildDistanceFrom(searchOptions) {
    if (searchOptions.searchOrder && searchOptions.searchOrder == "closest" && searchOptions.searchLoc) {
      return searchOptions.searchLoc.coordinates[0] + "|" + searchOptions.searchLoc.coordinates[1];
    }
  }

  /**
   * Search business by provided searchOptions, the search option should follow following model:
   * searchOptions {
   *   searchOrder : 'skills', 'newest', 'rating', 'closest',
   *   searchType :  'skillsOffered', 'skillsRequired', 'skillsOfferedAndRequired', 'only',
   *   searchLoc: loc,
   *   requiredCategoryIds: [id],
   *   offeredCategoryIds: [id],
   *   searchText: searchText (for 'only'),
   *   pageLimitPerSection: this.pageLimitPerSection,
   *   pageSize: this.pageSize,
   *   pageNum: this.pageNum,
   *   totalRecord: this.recordCount
   *  }
   * @param searchOptions
   * @param totalRecordCb callback to read total record.
   * @returns found business resources promise.
   */
  searchBusiness(searchOptions, totalRecordCb) {
    const query = {
      pageSize: searchOptions.pageSize,
      pageNum: searchOptions.pageNum,
      fields: this.buildFields(searchOptions.searchType),
      sort: this.buildSort(searchOptions),
      filter: JSON.stringify(this.buildFilter(searchOptions)),
      distanceFrom: this.buildDistanceFrom(searchOptions)
    };

    return this._Business.query(query, (value, responseHeaders) => {
      totalRecordCb(responseHeaders('record-count'));
    }).$promise.then((results) => {
        let filteredResults = results;
        if (query.distanceFrom) {
          filteredResults = results.map((result) => {
            if (result.distance) {
              result.distance = Number((result.distance).toFixed(1));
              result.showNoDistanceTxt = true;
            }
            return result;
          });
        }

        filteredResults.forEach(function (business) {
          if (business.businessEstablished) {
            business.professionalExp = moment(business.businessEstablished).fromNow(true);
          }
        });

        return filteredResults;
      })
      .catch(err => {
        this.errors = err.message;
      });
  }
}

angular.module('digitalVillageApp')
  .service('SkillSearchService', SkillSearchService);
