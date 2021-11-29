import * as admin from "firebase-admin";

export interface Rating {
  clientName: string;
  comment: string | undefined;
  data: admin.firestore.Timestamp;
  expertId: string;
  offerId: string;
  rating: number;
  serviceName: string;
}

export interface Offer {
  archived: boolean;
  clientId: string;
  clientName: string;
  clientReadTime: admin.firestore.Timestamp;
  creationTime: admin.firestore.Timestamp;
  expertId: string;
  expertName: string;
  expertReadTime: admin.firestore.Timestamp;
  isPreferred: boolean;
  jobId: string;
  ratingId: string | undefined;
  serviceId: string;
  serviceName: string;
  status: number;
}
