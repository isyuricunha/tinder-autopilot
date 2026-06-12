import get from 'lodash/get';
import { logger } from './misc/helper';
import Sidebar from './views/Sidebar';
import { getMyProfile } from './misc/api';
import Instagram from './automations/Instagram';
import { setJsonSetting } from './misc/settings-store';

class TinderAssistant {
  boostRemaining = false;

  isBoosting = false;

  constructor() {
    this.sidebar = new Sidebar();
    this.instagram = new Instagram();
    logger('Welcome to Tinder Autopilot');
    this.loadProfile();
  }

  loadProfile = () => {
    getMyProfile()
      .then((profileData) => {
        const d = new Date();
        const n = d.getTime();

        const expires = get(profileData, 'data.boost.expires_at');
        this.boostRemaining = get(profileData, 'data.boost.allotment_remaining');
        const boostMinutesLeft = Math.round(expires - n) / 1000 / 60;
        if (boostMinutesLeft > 0) {
          this.isBoosting = true;
        }

        setJsonSetting('ProfileData', profileData);
      })
      .catch((error) => {
        logger(`⚠️ Failed to load Tinder profile: ${error.message}`);
      });
  }
}

setTimeout(() => {
  const Tinder = new TinderAssistant();
}, 500);
