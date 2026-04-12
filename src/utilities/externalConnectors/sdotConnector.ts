import axios from 'axios';
import https from 'https';
import NodeCache from 'node-cache';
//import { getSdotMock as sdotService } from './mock/sdotMock';
import { BridgeDetails, BridgeDetailsApiResponse, BridgeDetailsDbResponse, BridgeStatusType } from '@/types/bridgeResponseTypes';
import { SdotDataFormat, ConnectorDataWrapper } from '@/types/connectorTypes';

const CONFIG = {
  baseURL: 'https://web.seattle.gov/Travelers/api/Map/GetBridgeData',
  timeDelaySeconds: 45,
  expireCheckIntervalSeconds: 23
};

// Allows the API to return data from a cache instead of pinging the external API for every request
const bridgeCache = new NodeCache(
  {
    stdTTL: CONFIG.timeDelaySeconds,
    checkperiod: CONFIG.expireCheckIntervalSeconds,
    deleteOnExpire: false
  });
const cacheKey = 'bridgeData';
// Determines whether new API calls can be made and written to cache
// If false, requests will use data from cache and not make unnecessary calls to the external API
let writeFlag = true;

// allow writing/new requests when the data expires
bridgeCache.on('expired', function(key, value) {
  writeFlag = true;
});

// insert empty, already expired value
const noData: ConnectorDataWrapper = {
  LastUpdate: Date.now(),
  data: []
};
bridgeCache.set(cacheKey, noData, 1); // 1 seconds ttl - expires almost immediately

/* Ignore SSL problems */

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

/* Axios instance */

const sdotService = axios.create({
  baseURL: CONFIG.baseURL,
  httpsAgent: httpsAgent
});

const getBridgeData = async (): Promise<ConnectorDataWrapper> => {
  if (writeFlag) {
    // temporarily delay ttl for existing value to prevent calls while refreshing data
    // when a key expires, the expires event will fire with every request, hence this fix
    bridgeCache.ttl(cacheKey, 15);
    writeFlag = false;

    try {
      const responseData = await sdotService.get('/');
      console.log('Successfully fetched data from SDOT');
      const parsedData = JSON.parse(responseData.data);
      const bridgeDataWrapped: ConnectorDataWrapper = {
        LastUpdate: Date.now(),
        data: parsedData as SdotDataFormat[]
      };

      bridgeCache.set(cacheKey, bridgeDataWrapped);
      return bridgeDataWrapped;
    } catch (error) {
      console.error('An error occured when trying to connect to API: ' + error);
      return noData;
    }
  } else {
    // If bridge data is ALREADY cached within the specified interval
    console.log('Fetching cached data...');
    const cacheValue: ConnectorDataWrapper | undefined = bridgeCache.get(cacheKey);
    if (cacheValue !== undefined && cacheValue !== null) {
      return cacheValue;
    } else {
      writeFlag = true;
      return noData;
    }
  }
};

/**
 * Takes in an array of bridge metadata objects from the database,
 * finds the live data for each, and returns a formatted API
 * response. This essentially helps standardize the data.
 */
export async function fillBridgeStatus(bridgeMetadata: BridgeDetailsDbResponse[], timetags: boolean): Promise<BridgeDetailsApiResponse> {
  const bridgeDetailsCleaned: BridgeDetails[] = [];
  let lastUpdate = -1;

  await getBridgeData().then((externalData) => {
    lastUpdate = externalData.LastUpdate;
    bridgeMetadata.forEach((bridge) => {
      let bridgeStatus: BridgeStatusType = 'Unknown';
      const externalBridge = externalData.data.filter((b) => b.BridgeID === parseInt(bridge.externalapi_id));
      if (externalBridge.length >= 1 && externalBridge[0] !== undefined) {
        switch (externalBridge[0].Status) {
          case 'Closed': bridgeStatus = 'Down'; break;
          case 'Open': bridgeStatus = 'Up'; break;
          default: bridgeStatus = 'Unknown';
        }
      }

      let timetagAppend = ''; // empty by default, assuming timetags is false
      if (timetags) {
        timetagAppend = '?' +  (externalData.LastUpdate % 10000).toString();
      }

      bridgeDetailsCleaned.push({
        id: parseInt(bridge.id),
        name: bridge.name,
        region: bridge.region,
        latitude: bridge.latitude,
        longitude: bridge.longitude,
        staticimg: bridge.staticimg,
        liveimg: bridge.liveimg + timetagAppend,
        bridge_type: bridge.bridge_type,
        short_name: bridge.short_name,
        status: bridgeStatus
      });

    });
  });

  return {
    LastUpdate: lastUpdate,
    count: bridgeDetailsCleaned.length,
    bridges: bridgeDetailsCleaned
  };
}
