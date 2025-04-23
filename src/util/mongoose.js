module.exports = {
    mutipleMongooseToObject: function (docs) {
      return docs.map(doc => doc.toObject());
    },
    mongooseToObject: function (doc) {
      return doc ? doc.toObject() : doc;
    }
  };
  