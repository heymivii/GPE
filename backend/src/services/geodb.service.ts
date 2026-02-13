import axios from 'axios';

interface CityData {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  population: number;
  timezone: string;
}

class GeoDBService {
  private readonly apiKey = process.env.RAPIDAPI_KEY || '';
  private readonly baseURL = 'https://wft-geo-db.p.rapidapi.com/v1/geo';

  async searchCity(
    cityName: string,
    countryCode: string,
  ): Promise<CityData | null> {
    try {
      const response = await axios.get(`${this.baseURL}/cities`, {
        params: {
          namePrefix: cityName,
          countryIds: countryCode,
          types: 'CITY',
          limit: 1,
          sort: '-population',
        },
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': 'wft-geo-db.p.rapidapi.com',
        },
      });

      const data = response.data;

      if (data.data && data.data.length > 0) {
        return data.data[0];
      }

      return null;
    } catch (error: any) {
      console.error(`Error fetching city ${cityName}:`, error.message);
      return null;
    }
  }

  async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default new GeoDBService();
