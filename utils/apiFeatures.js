class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1A) Build a query
    // copy req.query elements to queryObj
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    // delete one of the excludedFields from queryObj
    excludedFields.forEach((el) => delete queryObj[el]);

    //  const query =  Tour.find()
    //  .where('duration')
    //  .equals('5')
    //  .where('difficulty')
    //  .equals('easy');

    // 1B) Advance Filtering
    // $gte - greater than equals
    // url must be tours?duration=5[gte]&difficulty=easy&sort=1&limit=10...
    //filter obj => {difficult: easy, duration:{$gte: 5}}

    // regular expresion b - match that word only like gte or gtlet queryStr = JSON.stringify(queryObj);
    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    this.query.find(JSON.parse(queryStr));
    return this;
    // let query = Tour.find(JSON.parse(queryStr));
  }

  sort() {
    if (this.queryString.sort) {
      //sort('price ratingsAverage') if we have 2 or more object with same price, in that case we sort by second field, or more.
      // const sortedBy = req.query.sort.split(',').join(' ');
      const sortedBy = this.queryString.sort.replace(',', ' ');

      this.query = this.query.sort(sortedBy);
    } else {
      //default sort, createdAt
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');

      this.query = this.query.select(fields);
    } else {
      // - means do not include
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paggination() {
    // page=2&limit=10  , 1-10 page 1, 11-20 page 2, 21-30 page 3 ...
    // if we dont define page or limit we have default values as 1 and 100
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  /*   populate(array) {
    return this.populate(array);
  } */
}
module.exports = APIFeatures;
