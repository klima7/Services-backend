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
