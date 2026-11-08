import get from 'lodash/get';
import { buildRequestOptions } from './api-request-options';
import { fetchViaBackground } from './background-fetch';
import { getRawStorageValue, getJsonSetting } from './settings-store';
import { buildTinderApiDefaultOptions } from './tinder-api-options';
import { buildMatchMessagesUrl, buildSendMessageUrl } from './tinder-api-urls';

const getDefaultOptions = () =>
  buildTinderApiDefaultOptions({
    apiToken: getRawStorageValue('TinderWeb/APIToken'),
    persistentDeviceId: getRawStorageValue('TinderWeb/uuid')
  });

const fetchResource = async (url, body = false) => {
  const options = buildRequestOptions(getDefaultOptions(), body);
  const response = await fetchViaBackground(url, options);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status} ${response.statusText}`);
  }
  const data = await response.text();
  return data ? JSON.parse(data) : {};
};

const getMatches = async (newOnly, nextPageToken) => {
  return fetchResource(
    `https://api.gotinder.com/v2/matches?count=100&is_tinder_u=true&locale=en&message=${
      newOnly ? 0 : 1
    }${typeof nextPageToken === 'string' ? `&page_token=${nextPageToken}` : ''}`
  );
};

const getMyProfile = () =>
  fetchResource(
    `https://api.gotinder.com/v2/profile?locale=en&include=account%2Cboost%2Ccontact_cards%2Cemail_settings%2Cinstagram%2Clikes%2Cnotifications%2Cplus_control%2Cproducts%2Cpurchase%2Creadreceipts%2Cswipenote%2Cspotify%2Csuper_likes%2Ctinder_u%2Ctravel%2Ctutorials%2Cuser`
  );

const getRawMessagesForMatch = (match) =>
  fetchResource(buildMatchMessagesUrl(match)).then((data) => get(data, 'data.messages', []));

const getMessagesForMatch = (match) =>
  getRawMessagesForMatch(match).then((messages) =>
    // Normalize and immediately filter/release to avoid holding large data in memory
    messages.map((r) =>
      get(r, 'message', '')
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace('thanks', 'thank')
    )
  );

const getProfileData = () => {
  try {
    return getJsonSetting('ProfileData');
  } catch {
    return false;
  }
};

const getSnapchatUsername = () => {
  const profile = getProfileData();
  const snapAccount = get(profile, 'data.contact_cards.populated_cards', []).find(
    (a) => a.contact_type === 'snapchat'
  );
  return snapAccount ? snapAccount.contact_id : false;
};

// To send a snapchat username to a match id
// sendMessageToMatch('1234', { type: 'snapchat' });
const sendMessageToMatch = (matchID, options) => {
  const user = getSnapchatUsername();

  const body = options;
  if (options && options.type) {
    switch (options.type) {
      case 'snapchat':
        if (!user) throw new Error('No snapchat user exists');
        body.message = user;
        body.type = 'contact_card';
        body.contact_type = 'snapchat';
        break;
      default:
        break;
    }
  }
  return fetchResource(buildSendMessageUrl(matchID), body);
};

export {
  fetchResource,
  sendMessageToMatch,
  getRawMessagesForMatch,
  getMessagesForMatch,
  getMatches,
  getMyProfile
};
