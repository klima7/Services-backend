import * as admin from "firebase-admin";

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

export class NamedLocation {
  coordinates: admin.firestore.GeoPoint;
  name: string;

  constructor(coordinates: admin.firestore.GeoPoint, name: string) {
    this.coordinates = coordinates;
    this.name = name;
  }
}
