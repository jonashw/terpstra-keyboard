const distinctBy = (values, keyFn) => {
  var flags = {};
  return values.filter((v) => {
    let k = keyFn(v);
    if (flags[k]) {
      return false;
    }
    flags[k] = true;
    return true;
  });
};

export default distinctBy;
