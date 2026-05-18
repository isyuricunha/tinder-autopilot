const buildTinderApiDefaultOptions = ({ apiToken = '', persistentDeviceId = '' } = {}) => ({
  headers: {
    referrer: 'https://tinder.com/',
    referrerPolicy: 'origin',
    accept: 'application/json; charset=UTF-8',
    'persistent-device-id': persistentDeviceId,
    platform: 'web',
    'X-Auth-Token': apiToken
  },
  method: 'GET'
});

module.exports = { buildTinderApiDefaultOptions };
