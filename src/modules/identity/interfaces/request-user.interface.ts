export interface RequestUser {
  id: number;
  partnerId: number;
  login: string;
  groupCodes: string[];
  mustChangePassword: boolean;
}
