import {
    RawAPIResponse,
    CleanedCostOfLivingData,
    PriceRange,
    HousingData,
    FoodData,
    TransportationData,
    UtilitiesData,
    RestaurantsData,
    ClothingData,
    ChildcareData,
    SportsData,
    SalaryData,
} from './types/cost-of-living.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CostOfLivingCleanerService {
    cleanData(rawData: RawAPIResponse): CleanedCostOfLivingData {
        return {
            city: this.extractCityInfo(rawData),
            currency: this.extractCurrencyInfo(rawData),
            categories: {
                housing: this.extractHousingData(rawData.prices),
                food: this.extractFoodData(rawData.prices),
                transportation: this.extractTransportationData(rawData.prices),
                utilities: this.extractUtilitiesData(rawData.prices),
                restaurants: this.extractRestaurantsData(rawData.prices),
                clothing: this.extractClothingData(rawData.prices),
                childcare: this.extractChildcareData(rawData.prices),
                sports: this.extractSportsData(rawData.prices),
                salary: this.extractSalaryData(rawData.prices),
            },
            summary: this.calculateSummary(rawData),
        };
    }

    private extractCityInfo(data: RawAPIResponse) {
        return {
            id: data.city_id,
            name: data.city_name,
            country: data.country_name,
            state: data.state_code || undefined,
        };
    }

    private extractCurrencyInfo(data: RawAPIResponse) {
        return {
            code: data.prices[0]?.currency_code || 'EUR',
            exchangeRates: data.exchange_rate,
            lastUpdated: data.exchange_rates_updated.date,
        };
    }

    private extractHousingData(prices: any[]): HousingData {
        return {
            rent: {
                oneBedroom: {
                    cityCenter: this.findPrice(prices, 'One bedroom apartment in city centre'),
                    outsideCenter: this.findPrice(
                        prices,
                        'One bedroom apartment outside of city centre',
                    ),
                },
                threeBedroom: {
                    cityCenter: this.findPrice(
                        prices,
                        'Three bedroom apartment in city centre',
                    ),
                    outsideCenter: this.findPrice(
                        prices,
                        'Three bedroom apartment outside of city centre',
                    ),
                },
            },
            buy: {
                pricePerSqm: {
                    cityCenter: this.findPrice(
                        prices,
                        'Price per square meter to Buy Apartment in City Center',
                    ),
                    outsideCenter: this.findPrice(
                        prices,
                        'Price per square meter to Buy Apartment Outside of City Center',
                    ),
                },
            },
        };
    }

    private extractFoodData(prices: any[]): FoodData {
        return {
            markets: {
                milk1L: this.findPrice(prices, 'Milk, Regular,1 liter'),
                bread500g: this.findPrice(prices, 'Loaf of Fresh White Bread, 0.5 kg'),
                eggs12: this.findPrice(prices, 'Eggs, 12 pack'),
                chicken1kg: this.findPrice(
                    prices,
                    'Chicken Breasts, Boneless and Skinless, 1 kg',
                ),
                beef1kg: this.findPrice(
                    prices,
                    'Beef Round or Equivalent Back Leg Red Meat, 1 kg',
                ),
                cheese1kg: this.findPrice(prices, 'Local Cheese, 1 kg'),
                rice1kg: this.findPrice(prices, 'White Rice, 1 kg'),
                potato1kg: this.findPrice(prices, 'Potato, 1 kg'),
                tomato1kg: this.findPrice(prices, 'Tomato, 1 kg'),
                onion1kg: this.findPrice(prices, 'Onion, 1 kg'),
                apple1kg: this.findPrice(prices, 'Apples, 1 kg'),
                banana1kg: this.findPrice(prices, 'Banana, 1 kg'),
                orange1kg: this.findPrice(prices, 'Oranges, 1 kg'),
                lettuce: this.findPrice(prices, 'Lettuce, 1 head'),
                water15L: this.findPrice(prices, 'Water, 1.5 liter Bottle'),
                wine: this.findPrice(prices, 'Bottle of Wine, Mid-Range Price'),
                domesticBeer: this.findPrice(
                    prices,
                    'Domestic Beer, 0.5 liter Bottle',
                ),
                importedBeer: this.findPrice(
                    prices,
                    'Imported Beer, 0.33 liter Bottle',
                ),
                cigarettes: this.findPrice(prices, 'Pack of Cigarettes'),
            },
        };
    }

    private extractTransportationData(prices: any[]): TransportationData {
        return {
            publicTransport: {
                oneWayTicket: this.findPrice(
                    prices,
                    'One-way Ticket, Local Transport',
                ),
                monthlyPass: this.findPrice(prices, 'Monthly Pass, Regular Price'),
            },
            taxi: {
                start: this.findPrice(prices, 'Taxi Start, Normal Tariff'),
                per1km: this.findPrice(prices, 'Taxi, price for 1 km, Normal Tariff'),
                waitingHour: this.findPrice(
                    prices,
                    'Taxi, price for 1 hour Waiting, Normal Tariff',
                ),
            },
            personal: {
                gasoline1L: this.findPrice(prices, 'Gasoline, 1 liter'),
                newCar: this.findPrice(
                    prices,
                    'Volkswagen Golf 1.4 90 KW Trendline (Or Equivalent New Car)',
                ),
            },
        };
    }

    private extractUtilitiesData(prices: any[]): UtilitiesData {
        return {
            basic85m2: this.findPrice(
                prices,
                'Basic utilities for 85 square meter Apartment including Electricity, Heating or Cooling, Water and Garbage',
            ),
            internet: this.findPrice(
                prices,
                'Internet, 60 Mbps or More, Unlimited Data, Cable/ADSL',
            ),
            mobileMinute: this.findPrice(
                prices,
                'Prepaid Mobile Tariff Local, price per 1 min, No Discounts or Plans',
            ),
        };
    }

    private extractRestaurantsData(prices: any[]): RestaurantsData {
        return {
            inexpensiveMeal: this.findPrice(
                prices,
                'Meal in Inexpensive Restaurant',
            ),
            midRangeMeal2People: this.findPrice(
                prices,
                'Meal for 2 People, Mid-range Restaurant, Three-course',
            ),
            mcMeal: this.findPrice(
                prices,
                'McMeal at McDonalds or Alternative Combo Meal',
            ),
            cappuccino: this.findPrice(prices, 'Cappuccino'),
            cocaCola: this.findPrice(prices, 'Coca-Cola, 0.33 liter Bottle'),
            domesticBeer: this.findPrice(prices, 'Domestic Beer, 0.5 liter Draught'),
            importedBeer: this.findPrice(prices, 'Imported Beer, 0.33 liter Bottle'),
        };
    }

    private extractClothingData(prices: any[]): ClothingData {
        return {
            jeans: this.findPrice(
                prices,
                'Pair of Jeans in a Chain Store Like George, H&M, Zara, etc.',
            ),
            summerDress: this.findPrice(
                prices,
                'Summer Dress in a Chain Store Like George, H&M, Zara, etc.',
            ),
            runningShoes: this.findPrice(
                prices,
                'Pair of Running Shoes, Mid-Range Price',
            ),
            leatherShoes: this.findPrice(prices, 'Pair of Leather Business Shoes'),
        };
    }

    private extractChildcareData(prices: any[]): ChildcareData {
        return {
            preschool: this.findPrice(
                prices,
                'Private Preschool or Kindergarten, Monthly for 1 Child',
            ),
            primarySchool: this.findPrice(
                prices,
                'International Primary School, Yearly for 1 Child',
            ),
        };
    }

    private extractSportsData(prices: any[]): SportsData {
        return {
            cinema: this.findPrice(prices, 'Cinema ticket, 1 Seat'),
            gym: this.findPrice(prices, 'Fitness Club, Monthly Fee for 1 Adult'),
            tennis: this.findPrice(prices, 'Tennis Court Rent, 1 Hour on Weekend'),
        };
    }

    private extractSalaryData(prices: any[]): SalaryData {
        const salary = this.findPrice(
            prices,
            'Average Monthly Net Salary, After Tax',
        );
        const mortgageItem = prices.find((p) =>
            p.item_name.includes('Mortgage Interest Rate'),
        );

        return {
            averageMonthly: salary,
            mortgageRate: mortgageItem
                ? {
                    min: mortgageItem.min,
                    avg: mortgageItem.avg,
                    max: mortgageItem.max,
                }
                : { min: 0, avg: 0, max: 0 },
        };
    }

    private calculateSummary(data: RawAPIResponse) {
        const rent = data.prices.find((p) =>
            p.item_name.includes('One bedroom apartment in city centre'),
        );
        const utilities = data.prices.find((p) =>
            p.item_name.includes('Basic utilities'),
        );
        const transport = data.prices.find((p) =>
            p.item_name.includes('Monthly Pass'),
        );
        const food = 400;
        const salary = data.prices.find((p) =>
            p.item_name.includes('Average Monthly Net Salary'),
        );

        const monthlyBudget = {
            min:
                (rent?.min || 0) +
                (utilities?.min || 0) +
                (transport?.min || 0) +
                food,
            avg:
                (rent?.avg || 0) +
                (utilities?.avg || 0) +
                (transport?.avg || 0) +
                food,
            max:
                (rent?.max || 0) +
                (utilities?.max || 0) +
                (transport?.max || 0) +
                food,
        };

        return {
            monthlyBudget,
            averageSalary: salary?.avg || 0,
        };
    }

    private findPrice(prices: any[], itemName: string): PriceRange {
        const item = prices.find((p) => p.item_name === itemName);

        if (!item) {
            return {
                min: 0,
                avg: 0,
                max: 0,
                currency: 'EUR',
            };
        }

        return {
            min: item.min || 0,
            avg: item.avg || 0,
            max: item.max || 0,
            currency: item.currency_code,
        };
    }
}
