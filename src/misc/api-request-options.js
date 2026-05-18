const buildRequestOptions = (defaultOptions, body = false) => {
  const options = {
    ...defaultOptions,
    headers: {
      ...defaultOptions.headers
    }
  };

  if (body) {
    options.headers['content-type'] = 'application/json';
    options.body = JSON.stringify(body);
    options.method = 'POST';
  }

  return options;
};

module.exports = { buildRequestOptions };
