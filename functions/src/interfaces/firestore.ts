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

export interface Offer extends OfferUpdate {
  creationTime: admin.firestore.Timestamp;
  clientReadTime: admin.firestore.Timestamp | null;
  expertReadTime: admin.firestore.Timestamp | null;
}

export interface OfferUpdate {
  jobId: string;
  ratingId: string | null;
  creationTime: admin.firestore.Timestamp | admin.firestore.FieldValue;
  status: number;
  archived: boolean;
  serviceId: string;
  serviceName: string;
  clientId: string | null;
  expertId: string | null;
  clientName: string;
  expertName: string;
  clientReadTime: admin.firestore.Timestamp | admin.firestore.FieldValue | null;
  expertReadTime: admin.firestore.Timestamp | admin.firestore.FieldValue | null;
  lastMessage: Message | null;
}

export interface Job extends JobUpdate {
  finishDate: admin.firestore.Timestamp;
  creation: admin.firestore.Timestamp;
}

export interface JobUpdate {
  active: boolean;
  finishDate: admin.firestore.Timestamp | admin.firestore.FieldValue;
  clientId: string | null;
  clientName: string;
  creation: admin.firestore.Timestamp | admin.firestore.FieldValue;
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
  creationDate: admin.firestore.Timestamp;
}

export interface MatchUpdate {
  new: Array<string> | admin.firestore.FieldValue;
  rejected: Array<string> | admin.firestore.FieldValue;
  creationDate: admin.firestore.Timestamp | admin.firestore.FieldValue;
}

export interface Message extends MessageUpdate {
  time: admin.firestore.Timestamp;
}

export interface MessageUpdate {
  author: string;
  type: number;
  time: admin.firestore.Timestamp | admin.firestore.FieldValue;
  message?: string;
  imageUrl?: string;
}
