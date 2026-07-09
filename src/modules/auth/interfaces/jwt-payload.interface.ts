export interface AccessTokenPayload {
  sub: number;
  partnerId: number;
  login: string;
  groups: string[];
  mustChangePassword: boolean;
}
