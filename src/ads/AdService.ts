import { Platform } from 'react-native';
import mobileAds, {
  AdEventType,
  InterstitialAd,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const USE_TEST_ADS = true;

const PROD_INTERSTITIAL = Platform.select({
  ios: 'ca-app-pub-0000000000000000/0000000000',
  android: 'ca-app-pub-0000000000000000/0000000000',
  default: '',
});

const PROD_REWARDED = Platform.select({
  ios: 'ca-app-pub-0000000000000000/0000000000',
  android: 'ca-app-pub-0000000000000000/0000000000',
  default: '',
});

const INTERSTITIAL_UNIT = USE_TEST_ADS ? TestIds.INTERSTITIAL : PROD_INTERSTITIAL;
const REWARDED_UNIT = USE_TEST_ADS ? TestIds.REWARDED : PROD_REWARDED;

const INTERSTITIAL_MIN_INTERVAL_MS = 60_000;
const INTERSTITIAL_EVERY_N_PLAYS = 2;

let initialized = false;
let playCount = 0;
let lastInterstitialAt = 0;

let interstitial: InterstitialAd | null = null;
let interstitialLoaded = false;
let rewarded: RewardedAd | null = null;
let rewardedLoaded = false;

function setupInterstitial() {
  const ad = InterstitialAd.createForAdRequest(INTERSTITIAL_UNIT, {
    requestNonPersonalizedAdsOnly: true,
  });
  interstitial = ad;
  interstitialLoaded = false;
  ad.addAdEventListener(AdEventType.LOADED, () => {
    interstitialLoaded = true;
  });
  ad.addAdEventListener(AdEventType.CLOSED, () => {
    interstitialLoaded = false;
    ad.load();
  });
  ad.addAdEventListener(AdEventType.ERROR, () => {
    interstitialLoaded = false;
  });
  ad.load();
}

function setupRewarded() {
  const ad = RewardedAd.createForAdRequest(REWARDED_UNIT, {
    requestNonPersonalizedAdsOnly: true,
  });
  rewarded = ad;
  rewardedLoaded = false;
  ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
    rewardedLoaded = true;
  });
  ad.addAdEventListener(AdEventType.CLOSED, () => {
    rewardedLoaded = false;
    ad.load();
  });
  ad.addAdEventListener(AdEventType.ERROR, () => {
    rewardedLoaded = false;
  });
  ad.load();
}

export async function initAds(): Promise<void> {
  if (initialized) {
    return;
  }
  initialized = true;
  try {
    await mobileAds().initialize();
    setupInterstitial();
    setupRewarded();
  } catch {
    initialized = false;
  }
}

export function isRewardedReady(): boolean {
  return rewardedLoaded;
}

export async function maybeShowInterstitial(): Promise<void> {
  playCount += 1;
  const now = Date.now();
  const capReached = playCount % INTERSTITIAL_EVERY_N_PLAYS === 0;
  const cooledDown = now - lastInterstitialAt >= INTERSTITIAL_MIN_INTERVAL_MS;
  if (!capReached || !cooledDown || !interstitial || !interstitialLoaded) {
    return;
  }
  const ad = interstitial;
  lastInterstitialAt = now;
  await new Promise<void>(resolve => {
    const subs: Array<() => void> = [];
    const cleanup = () => subs.forEach(u => u());
    subs.push(
      ad.addAdEventListener(AdEventType.CLOSED, () => {
        cleanup();
        resolve();
      }),
    );
    subs.push(
      ad.addAdEventListener(AdEventType.ERROR, () => {
        cleanup();
        resolve();
      }),
    );
    try {
      ad.show();
    } catch {
      cleanup();
      resolve();
    }
  });
}

export async function showRewarded(): Promise<boolean> {
  if (!rewarded || !rewardedLoaded) {
    return false;
  }
  const ad = rewarded;
  return new Promise<boolean>(resolve => {
    let earned = false;
    const subs: Array<() => void> = [];
    const cleanup = () => subs.forEach(u => u());
    subs.push(
      ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        earned = true;
      }),
    );
    subs.push(
      ad.addAdEventListener(AdEventType.CLOSED, () => {
        cleanup();
        resolve(earned);
      }),
    );
    subs.push(
      ad.addAdEventListener(AdEventType.ERROR, () => {
        cleanup();
        resolve(false);
      }),
    );
    try {
      ad.show();
    } catch {
      cleanup();
      resolve(false);
    }
  });
}
