export interface SetInfoParams {
  name: string | undefined;
  company: string | undefined;
  description: string | undefined;
  email: string | undefined;
  phone: string | undefined;
  website: string | undefined;
}

export interface SetServicesParams {
  services: Array<string>;
}

export interface SetWorkingAreaParams {
  placeId: string;
  radius: number;
}

export class GeocodingResult {
  latitude: number;
  longitude: number;
  name: string;
  country: string;

  constructor(name: string, country: string, latitude: number, longitude: number) {
    this.name = name;
    this.latitude = latitude;
    this.longitude = longitude;
    this.country = country;
  }
}
