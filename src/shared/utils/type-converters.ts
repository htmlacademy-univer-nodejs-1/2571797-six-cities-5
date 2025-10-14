import { City } from '../types/city.enum.js';
import { HousingType } from '../types/housing-type.enum.js';
import { ComfortType } from '../types/comfort-type.enum.js';
import { UserType } from '../types/user-type.enum.js';

export function stringToCity(value: string): City {
  const normalizedValue = value.toLowerCase();

  switch (normalizedValue) {
    case 'paris':
      return City.Paris;
    case 'cologne':
      return City.Cologne;
    case 'brussels':
      return City.Brussels;
    case 'amsterdam':
      return City.Amsterdam;
    case 'hamburg':
      return City.Hamburg;
    case 'dusseldorf':
      return City.Dusseldorf;
    default:
      throw new Error(`Invalid city value: ${value}`);
  }
}

export function stringToHousingType(value: string): HousingType {
  const normalizedValue = value.toLowerCase();

  switch (normalizedValue) {
    case 'apartment':
      return HousingType.Apartment;
    case 'house':
      return HousingType.House;
    case 'room':
      return HousingType.Room;
    case 'hotel':
      return HousingType.Hotel;
    default:
      throw new Error(`Invalid housing type value: ${value}`);
  }
}

export function stringsToComfortTypes(values: string[]): ComfortType[] {
  return values.map((value) => {
    const normalizedValue = value.trim();

    switch (normalizedValue) {
      case 'Breakfast':
        return ComfortType.Breakfast;
      case 'Air conditioning':
        return ComfortType.AirConditioning;
      case 'Laptop friendly workspace':
        return ComfortType.LaptopFriendlyWorkspace;
      case 'Baby seat':
        return ComfortType.BabySeat;
      case 'Washer':
        return ComfortType.Washer;
      case 'Towels':
        return ComfortType.Towels;
      case 'Fridge':
        return ComfortType.Fridge;
      default:
        throw new Error(`Invalid comfort type value: ${value}`);
    }
  });
}

export function stringToComfortTypes(value: string): ComfortType[] {
  const comfortStrings = value.split(',').map((s) => s.trim());
  return stringsToComfortTypes(comfortStrings);
}

/**
 * Безопасно преобразует строку в UserType enum
 */
export function stringToUserType(value: string): UserType {
  const normalizedValue = value.toLowerCase();

  switch (normalizedValue) {
    case 'normal':
      return UserType.Normal;
    case 'pro':
      return UserType.Pro;
    default:
      throw new Error(`Invalid user type value: ${value}`);
  }
}
