import { UserType } from './user-type.enum';

export type User = {
  name: string;
  email: string;
  avatar?: string;
  password: string;
  type: UserType;
};
