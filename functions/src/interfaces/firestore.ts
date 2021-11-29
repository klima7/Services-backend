import * as admin from "firebase-admin";

type Timestamp = admin.firestore.Timestamp | admin.firestore.FieldValue

export interface Client {
  info: ClientInfo;
}

export interface ClientInfo {
  name: string | undefined;
  phone: string | undefined;
}

export interface Expert {
  commentsCount: number;
  profileImage: string | undefined;
  rating: number;
  ratingsCount: number;
  ratingsSum: number;
  ready: boolean;
  info: ExpertInfo;
  workingArea: ExpertWorkingArea | undefined;
  services: Array<string>;
}

export interface ExpertInfo {
  company: string | undefined;
  description: string | undefined;
  email: string | undefined;
  name: string | undefined;
  phone: string | undefined;
  website: string | undefined;
}

export interface ExpertWorkingArea {
  coordinates: admin.firestore.GeoPoint;
  locationId: string;
  locationName: string;
  radius: number;
}

export interface Rating {
  clientName: string;
  comment: string | undefined;
  date: Timestamp;
  expertId: string;
  offerId: string;
  rating: number;
  serviceName: string;
}

export interface Offer {
  archived: boolean;
  clientId: string;
  clientName: string;
  clientReadTime: Timestamp;
  creationTime: Timestamp;
  expertId: string;
  expertName: string;
  expertReadTime: Timestamp;
  isPreferred: boolean;
  jobId: string;
  ratingId: string | undefined;
  serviceId: string;
  serviceName: string;
  status: number;
}

export interface Job {
  active: boolean;
  clientId: string | undefined;
  clientName: string;
  creation: Timestamp;
  description: string;
  location: JobLocation;
  realizationTime: string;
  serviceId: string;
  serviceName: string;
}

export interface JobLocation {
  coordinates: admin.firestore.GeoPoint;
  locationId: string;
  locationName: string;
}

export interface Category {
  name: string;
}

export interface Service {
  categoryId: string,
  name: string,
}
