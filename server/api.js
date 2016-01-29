if (Meteor.isServer) {
  // Global API configuration
  var Api = new Restivus({
    useDefaultAuth: true,
    prettyJson: true,
    defaultHeaders: {
      'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    },
    defaultOptionsEndpoint: function() {
      this.response.writeHead(201, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      });
      return;
    },
    enableCors: true
  });
  Api.addRoute('budget', {}, {
    get: function () {
      var budget = Budgets.findOne();
      if(!budget) {
        Budgets.insert({total: 0});
      }
      return Budgets.findOne();
    },
    patch: function() {
      Budgets.update({}, {$set: this.bodyParams});
      return Budgets.findOne();
    },
    options:function() {
      return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'X-Auth-Token, X-User-Id'
      }
    }
  });
  Api.addRoute('categories/:id',{},{
    get: function() {
      if(!this.urlParams.id) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Category not set'}
        };
      }
      var category = Categories.findOne(this.urlParams.id);
      if(!category) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Category not found'}
        };
      }
      return category;
    },
    delete: function() {
      if(!this.urlParams.id) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Category not set'}
        };
      }
      var category = Categories.findOne(this.urlParams.id);
      if(!category) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Category not found'}
        };
      }
      Categories.remove({_id: this.urlParams.id});
      return {
        statusCode: 200,
        body: {status: 'success', message: 'Category removed'}
      };
    },
    patch: function() {
      if(!this.urlParams.id) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Category id missing'}
        };
      }
      var category = Categories.findOne(this.urlParams.id);
      if(!category) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Category not found'}
        };
      }
      Categories.update({_id: this.urlParams.id}, {$set: this.bodyParams});
      return Categories.findOne(this.urlParams.id);
    },
    options:function() {
      return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'X-Auth-Token, X-User-Id'
      }
    }
  });
  Api.addRoute('categories', {}, {
    get: function () {
      var categories = Categories.find().fetch();
      if (!categories.length) {
        Categories.insert({"name": "Food", type: "expense", "limit": 300});
      }
      return Categories.find().fetch();
    },
    put: function () {
      var id = Categories.insert(this.bodyParams);
      return Categories.findOne(id);
    },
    options:function() {
      return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'X-Auth-Token, X-User-Id'
      }
    }
  });



  Api.addRoute('transactions', {}, {
    get: function() {
      var selector = {};
      if(this.queryParams.type && type!=="all") {
        selector.type = this.queryParams.type;
      }
      if(this.queryParams.pastMonths !== undefined || this.queryParams.pastMonths !== null) {
        var compareDate = moment();
        compareDate.date(1);
        compareDate.subtract(parseInt(this.queryParams.pastMonths), 'month');
        selector.date = {'$gte': compareDate.format("DD MM YYYY")};
      }
      if(this.queryParams.category) {
        selector.catId = this.queryParams.category;
      }
      var limiter = {};
      if(this.queryParams.page) {
        limiter.skip = this.queryParams.page;
      }
      if(this.queryParams.perPage) {
        limiter.limit = this.queryParams.perPage;
      }
      if(this.queryParams.sortField) {
        limiter.sort = {};
        limiter.sort[this.queryParams.sortField] = 1;
        if(this.queryParams.sortDir === 'desc') {
          limiter.sort[this.queryParams.sortField] = -1;
        }
      }
      return Transactions.find(selector, limiter).fetch();
    },
    put: function() {
      var id = Transactions.insert(this.bodyParams);
      return Transactions.findOne(id);
    },
    options:function() {
      return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'X-Auth-Token, X-User-Id'
      }
    }
  });
  Api.addRoute('transactions/:id', {}, {
    get: function() {
      if(!this.urlParams.id) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Category not set'}
        };
      }
      var transaction = Transactions.findOne(this.urlParams.id);
      if(!transaction) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Transaction not found'}
        };
      }
      return transaction;
    },
    patch: function() {
      if(!this.urlParams.id) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Category not set'}
        };
      }
      var transaction = Transactions.findOne(this.urlParams.id);
      if(!transaction) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Transaction not found'}
        };
      }
      Transactions.update({_id: transaction._id}, {$set: this.bodyParams});
      return Transactions.findOne(transaction._id);
    },
    delete: function() {
      if(!this.urlParams.id) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Category not set'}
        };
      }
      var transaction = Transactions.findOne(this.urlParams.id);
      if(!transaction) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Transaction not found'}
        };
      }
      Transactions.remove({_id: this.urlParams.id});
      return {
        statusCode: 200,
        body: {status: 'success', message: 'Transaction removed'}
      };
    },
    options:function() {
      return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'X-Auth-Token, X-User-Id'
      }
    }
  });

  Api.addRoute('recurring/:id',{},{
    delete: function() {
      if(!this.urlParams.id) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Recurring id not set'}
        };
      }
      var recurring = Recurring.findOne(this.urlParams.id);
      if(!recurring) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Recurring not found'}
        };
      }
      Recurring.remove({_id: this.urlParams.id});
      delete GreiereCronJobs[this.urlParams.id];
      return {
        statusCode: 200,
        body: {status: 'success', message: 'Recurring removed'}
      };
    },
    patch: function() {
      if(!this.urlParams.id) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Recurring id missing'}
        };
      }
      var recurring = Recurring.findOne(this.urlParams.id);
      if(!recurring) {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Recurring not found'}
        };
      }
      Recurring.update({_id: this.urlParams.id}, {$set: this.bodyParams});
      delete GreiereCronJobs[this.urlParams.id];
      var rec = Recurring.findOne(this.urlParams.id);
      addRecurring(rec);
      return rec;
    },
    options:function() {
      return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'X-Auth-Token, X-User-Id'
      }
    }
  });
  Api.addRoute('recurring', {}, {
    get: function () {
      var selector = {};
      if(this.queryParams.type && this.queryParams.type != "all") {
        selector.type = this.queryParams.type;
      }
      var recurring = Recurring.find(selector).fetch();
      if(recurring.length) {
        return recurring;
      } else {
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'Recurring not found'}
        };
      }
    },
    put: function() {
      var id = Recurring.insert(this.bodyParams);
      var rec = Recurring.findOne(id);
      addRecurring(rec);
      return rec;
    },
    options:function() {
      return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'X-Auth-Token, X-User-Id'
      }
    }
  });
}