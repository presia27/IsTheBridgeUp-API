import { Request, Response } from 'express';
import { getPool } from '@/utilities/pgDatabase';
import { QueryResult } from 'pg';
import { BridgeDetailsApiResponse, BridgeDetailsDbResponse, BridgeListItem } from '@/types/bridgeResponseTypes';
import { fillBridgeStatus } from '@/utilities/externalConnectors/sdotConnector';
import { bridgeMetadata } from '@/data/bridges';
import { isDatabaseEnabled } from '@/utilities/envConfig';

export async function getBridgeList(req: Request, res: Response) {
  let bridgeListCleaned: BridgeListItem[];
  if (isDatabaseEnabled()) {
    // query strings to use
    const queryString = 'SELECT id, name, region FROM bridges';
    const pool = getPool();

    const bridgeListResult: QueryResult<any> = await pool.query(queryString);
    
    bridgeListCleaned = bridgeListResult.rows.map(row => ({
      id: parseInt(row.id),
      name: row.name,
      region: row.region
    }));
  } else {
    bridgeListCleaned = bridgeMetadata.map(bridge => ({
      id: parseInt(bridge.id),
      name: bridge.name,
      region: bridge.region
    }));
  }

  res.json({
    count: bridgeListCleaned.length,
    bridges: bridgeListCleaned
  });
}

export async function getBridgeById(req: Request, res: Response) {
  const requestedId: number = parseInt(req.params.id as string);
  const timetags = req.query.timetags as string;

  let bridgeInfo: BridgeDetailsDbResponse[];

  if (isDatabaseEnabled()) {
    const queryString: string = 'SELECT * FROM bridges WHERE id=$1';
    bridgeInfo = await fetchFromDb(queryString, requestedId);
  } else {
    bridgeInfo = bridgeMetadata.filter(bridge => (parseInt(bridge.id) === requestedId));
  }
  
  const apiResponseData = await bridgeDataProvider(bridgeInfo, timetags);

  // Combine, sort, and send back to user agent
  res.send(apiResponseData);
}

export async function getAllBridgeData(req: Request, res: Response) {
  const timetags = req.query.timetags as string;

  let bridgeInfo: BridgeDetailsDbResponse[];

  if (isDatabaseEnabled()) {
    const queryString: string = 'SELECT * FROM bridges';
    bridgeInfo = await fetchFromDb(queryString);
  } else {
    bridgeInfo = bridgeMetadata.sort((a, b) => parseInt(a.id) - parseInt(b.id));
  }

  const apiResponseData = await bridgeDataProvider(bridgeInfo, timetags);
  
  res.send(apiResponseData);
}

async function fetchFromDb(queryString: string, id?: number): Promise<BridgeDetailsDbResponse[]> {
  const pool = getPool();

  const sqlparams = [];
  if (id) {
    sqlparams.push(id);
  }

  // Get metadata
  const bridgeDbResult: QueryResult<BridgeDetailsDbResponse> = await pool.query(queryString, sqlparams);

  return bridgeDbResult.rows;
}

async function bridgeDataProvider(bridgeMetadata: BridgeDetailsDbResponse[], timetagsParam: string): Promise<BridgeDetailsApiResponse> {
  // Sort all responses by API
  const sdotBridges = bridgeMetadata.filter((b) => b.apiprovider === 'sdot');

  // Call APIs
  const sdotFilledData = await fillBridgeStatus(sdotBridges, timetagsParam === 'true' ? true : false);

  return sdotFilledData;
}
