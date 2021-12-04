import * as admin from "firebase-admin";

type Timestamp = admin.firestore.Timestamp | admin.firestore.FieldValue

export interface Client {
  info: ClientInfo;
}

export interface ClientInfo {
  name: string | null;
  phone: string | null;
}

export interface Expert extends ExpertUpdate {
  ratingsCount: number;
  ratingsSum: number;
}

export interface ExpertUpdate {
  commentsCount: number;
  profileImage: ExpertProfileImage | null;
  rating: number;
  ratingsCount: number | admin.firestore.FieldValue;
  ratingsSum: number | admin.firestore.FieldValue;
  ready: boolean;
  info: ExpertInfo;
  workingArea: ExpertWorkingArea | null;
  services: Array<string>;
}

export interface ExpertInfo {
  company: string | null;
  description: string | null;
  email: string | null;
  name: string | null;
  phone: string | null;
  website: string | null;
}

export interface ExpertWorkingArea {
  coordinates: admin.firestore.GeoPoint;
  locationId: string;
  locationName: string;
  radius: number;
}

export interface ExpertProfileImage {
  changeTime: Timestamp,
  url: string,
}

export interface Rating {
  clientName: string;
  comment: string | null;
  date: Timestamp;
  expertId: string;
  offerId: string;
  rating: number;
  serviceName: string;
}

export interface Offer {
  archived: boolean;
  clientId: string | null;
  clientName: string;
  clientReadTime: Timestamp;
  creationTime: Timestamp;
  expertId: string | null;
  expertName: string;
  expertReadTime: Timestamp;
  isPreferred: boolean;
  jobId: string;
  ratingId: string | null;
  serviceId: string;
  serviceName: string;
  status: number;
}

export interface Job {
  active: boolean;
  clientId: string | null;
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
  id: string;
  categoryId: string;
  name: string;
}

export interface Match extends MatchUpdate {
  new: Array<string>;
  rejected: Array<string>;
  accepted: Array<string>;
}

export interface MatchUpdate {
  new: Array<string> | admin.firestore.FieldValue;
  rejected: Array<string> | admin.firestore.FieldValue;
  accepted: Array<string> | admin.firestore.FieldValue;
}
