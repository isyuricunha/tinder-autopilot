import get from 'lodash/get';
import { buildRequestOptions } from './api-request-options';
import { getRawStorageValue, getJsonSetting } from './settings-store';
import { buildTinderApiDefaultOptions } from './tinder-api-options';

const getDefaultOptions = () =>
  buildTinderApiDefaultOptions({
    apiToken: getRawStorageValue('TinderWeb/APIToken'),
    persistentDeviceId: getRawStorageValue('TinderWeb/uuid')
  });

const fetchResource = (url, body = false) => {
  return new Promise((resolve, reject) => {
    const options = buildRequestOptions(getDefaultOptions(), body);
    chrome.runtime.sendMessage({ url, options }, (messageResponse) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (!messageResponse) {
        reject(new Error('Empty response from background request'));
        return;
      }
      const [response, error] = messageResponse;
      if (response === null) {
        reject(error instanceof Error ? error : new Error(String(error)));
      } else {
        // Use undefined on a 204 - No Content
        const body = response.body ? new Blob([response.body]) : undefined;
        resolve(
          new Response(body, {
            status: response.status,
            statusText: response.statusText
          })
        );
      }
    });
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status} ${response.statusText}`);
      }
      const textPromise = response.text();
      // Help GC by nullifying the response reference after extracting data
      return textPromise;
    })
    .then((data) => {
      return data ? JSON.parse(data) : {};
    });
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

const getMessagesForMatch = ({ id }) =>
  fetchResource(`https://api.gotinder.com/v2/matches/${id}/messages?count=100`).then((data) => {
    const messages = get(data, 'data.messages', []);
    // Normalize and immediately filter/release to avoid holding large data in memory
    return messages.map((r) =>
      get(r, 'message', '')
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace('thanks', 'thank')
    );
  });

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
  return fetchResource(`https://api.gotinder.com/user/matches/${matchID}?locale=en`, body);
};

export { fetchResource, sendMessageToMatch, getMessagesForMatch, getMatches, getMyProfile };
