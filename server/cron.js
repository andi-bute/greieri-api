GreiereCronJobs = {};
Meteor.startup(function(){
  if(Meteor.isServer) {
    Recurring.find().forEach(function(rec){
      addRecurring(rec);
    });
  }
});

//recurring
//["name":"Salary","categoryId":"1","sum":"50","type":"Income","day":"15", date: "3 01 2016"},{"id":1,"name":"Electricity","category":"House spends","sum":"100","type":"Expenses","date":"23 01 2016"}]"

//transactions
//["name":"Legume & Fructe","categoryId":0,"sum":50,"type": expense,"date":"3 01 2016"},{"id":1,"name":"Intretinere","categoryId":"3","sum":600,"type":income,"date":"3 11 2015"}]}

addRecurring = function(rec) {
  GreiereCronJobs[rec._id] = new Cron(function() {
    doRecurring(rec);
  }, {
    minute: 0,
    hour: 4,
    day: rec.day
  });
};
doRecurring = function (rec) {
  var currentDate = moment();
  var transaction = {categoryId: rec.categoryId, name: rec.name, sum: rec.sum, date: currentDate.format("DD MM YYYY")};
  var budget = Budgets.findOne();
  if(rec.type === "expense") {
    budget.total -= parseFloat(rec.sum);
  } else {
    budget.total += parseFloat(rec.sum);
  }
  Budgets.update({_id: budget._id}, {$set: {total: budget.total}});
  Transactions.insert(transaction);
};