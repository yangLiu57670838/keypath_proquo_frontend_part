'use strict';

angular.module('digitalVillageApp')
  .factory('Category', function ($resource, $q) {
    let cat = $resource('/api/categories/:id',
      {
        _id:'@id'
      },
      {
        'update': { method:'PUT' }
      });

    cat.pageSize = 1000;

    // Walks the pages and returns ALL data. This type of function should
    // only be used when we know there is a limited data set, such as categories
    cat.getAll = function(filter) {
      let deferred = $q.defer();
      let queryObj = {
        pageSize:cat.pageSize,
        pageNum: 1,
        fields: {
          description: 0,
          active: 0
        },
        sort: 'name:asc'
      };
      if(filter){
        queryObj.filter = filter;
      }
      cat.query(queryObj, function( data, headers ) {
        cat.headers = headers();
        //console.log(JSON.stringify(headers(), null, 2));
        if(cat.headers.page == cat.headers['page-count']) {
          deferred.resolve(data);
        } else {
          // More pages of data to get
          let pagePromises = [];
          let pageCount = parseInt(cat.headers['page-count']);

          for(let pageNum = 2 ; pageNum<=pageCount ; pageNum++) {
            pagePromises.push(cat.query({
              pageSize: cat.pageSize,
              pageNum: pageNum,
              fields: {
                description: 0,
                active: 0
              },
              sort: 'name:asc'
            }).$promise);
          }

          $q.all(pagePromises).then(function(values) {
            var result = data.concat([].concat.apply([], values));
            deferred.resolve(result);
          });
        }
      });

      return deferred.promise;
    };


    // Like getTree, but returns the nodes in a flat order also to assist with autosearch
    cat.getSearchableTree = function(filter) {
      var deferred = $q.defer();
      cat.getAll(filter).then((all) => {
        cat.buildTree(all).then((tree) => {
          let flat = all.map((node) => {
            return {
              _id: node._id,
              name: node.name,
              breadCrumbs: node.breadCrumbs
            }
          });

          let res = {
            flat: flat,
            tree: tree
          };
          deferred.resolve(res);
        })
      });

      return deferred.promise;
    };

    // Gets all the categories then builds a tree model with it
    cat.getTree = function() {
      return cat.getAll()
        .then(cat.buildTree);
    };

    // Implement with promises as this will later support lazy tree building with depth etc
    cat.buildTree = function(categories) {
      let deferred = $q.defer();

      let topAndTail = _.partition(categories, (category) => {return category.parentCategory == undefined});
      topAndTail[0].forEach((n) => {n.root = true; n.breadCrumbs = [n.name]});
      cat.addChildren(topAndTail[0], topAndTail[1]);

      deferred.resolve(topAndTail[0]);
      return deferred.promise;
    };

    cat.addChildren = function(layer, nodes) {
      layer.forEach((node) => {
        node.selected = false;
        let topAndTail = _.partition(nodes, (potentialChild) => {return node._id == potentialChild.parentCategory});
        let children = topAndTail[0];
        let remainingNodes = topAndTail[1];

        if(children && children.length > 0) {
          node.collapsed = true;
          node.children = children;

          // Add breadcrumbs
          children.forEach((c) => {
            c.breadCrumbs = node.breadCrumbs.slice(0);
            c.breadCrumbs.push(c.name);
          });

          // If there are more unallocated nodes see if they might be children
          if(remainingNodes && remainingNodes.length > 0) {
            cat.addChildren(children, remainingNodes);
          }
        } else {
          node.leaf = true;
        }
      });
    };

    return cat;
  });
