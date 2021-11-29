import {SecretManagerServiceClient} from "@google-cloud/secret-manager";

class SecretsRepository {
  private client = new SecretManagerServiceClient();
  private cache: { [name: string]: string } = {};

  async getSecret(secret: Secret): Promise<string> {
    if (Object.keys(this.cache).includes(secret)) {
      return this.cache[secret];
    } else {
      const value = await this.fetchSecretValue(secret);
      this.cache[secret] = value;
      return value;
    }
  }

  private async fetchSecretValue(secret: Secret): Promise<string> {
    const [version] = await this.client.accessSecretVersion({
      name: `projects/518080781538/secrets/${secret}/versions/latest`,
    });

    const value = version.payload?.data?.toString();
    if (value == undefined) {
      throw Error(`Unable to get value of ${secret} secret`);
    }

    return value;
  }
}

export enum Secret {
  geocodingApiKey = "Google-geocoding-key",
}

export const secretsRepository = new SecretsRepository();
