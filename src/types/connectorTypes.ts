export interface SdotDataFormat {
  BridgeID: number;
  DisplayName: string;
  Latitude: number;
  Longitude: number;
  Name: string;
  Status: 'Open' | 'Closed';
}

export type ConnectorDataFormats = SdotDataFormat; // || wsdotDataFormat || somethingElseFormat...

export interface ConnectorDataWrapper {
  LastUpdate: number,
  data: ConnectorDataFormats[]
}