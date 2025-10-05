import { Offer } from '../../types/index.js';

export interface FileReader {
  readOffers(): Promise<Offer[]>;
}
