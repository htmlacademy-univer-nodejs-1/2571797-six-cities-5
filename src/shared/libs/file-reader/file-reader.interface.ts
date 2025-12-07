import { Offer } from '../../types';

export interface FileReader {
  readOffers(): Promise<Offer[]>;
}
