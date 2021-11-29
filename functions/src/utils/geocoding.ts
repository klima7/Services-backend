import {AddressType, Client} from "@googlemaps/google-maps-services-js";
import {GeocodingResult} from "../interfaces/firestore";
import {secretsRepository, Secret} from "./secrets";

class GeocodingRepository {
  private gmClient = new Client();

  async getLocationByPlaceId(placeId: string): Promise<GeocodingResult> {
    const rawResult = await this.gmClient.geocode({
      params: {
        place_id: placeId,
        key: await secretsRepository.getSecret(Secret.geocodingApiKey),
        language: "PL",
      },
    });

    const results = rawResult.data.results;
    if (results.length != 1) {
      throw Error("Geocoding unable to determine location unambiguously");
    }

    const result = results[0];
    const latLng = result.geometry.location;
    const components = result.address_components;

    let country: string | null = null;
    let name: string | null = null;

    components.forEach((component) => {
      if (component.types.includes(AddressType.country)) {
        country = component.short_name;
      } else if (component.types.includes(AddressType.locality)) {
        name = component.short_name;
      }
    });

    if (country == null || name == null) {
      throw Error("Geocoding unable to determine all necessary information");
    }

    const gcResult = new GeocodingResult(name, country, latLng.lat, latLng.lng);
    return gcResult;
  }
}

export const geocodingRepository = new GeocodingRepository();
