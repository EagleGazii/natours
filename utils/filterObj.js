module.exports = (obj, ...allowedFields) => {
  const newObj = {};
  allowedFields.forEach((key) => {
    newObj[key] = obj[key];
  });

  /* Object.keys(obj).forEach((el) => {
      if(allowedFields.inculdes(el)){
        newObj[el] = obj[el];
      }
    }); */
  return newObj;
};
