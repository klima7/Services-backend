import {Role} from "../interfaces/domain";
import {Offer} from "../interfaces/firestore";

export function getRole(uid: string, offer: Offer): Role | null {
  if (offer.expertId == uid) {
    return "expert";
  } else if (offer.clientId == uid) {
    return "client";
  } else {
    return null;
  }
}
