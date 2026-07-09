export class UserProfileDto {
  id: number;
  login: string;
  active: boolean;
  mustChangePassword: boolean;
  lastLoginAt: Date | null;
  partner: {
    id: number;
    kind: string;
    displayName: string;
    rif: string;
    email: string;
  };
  groups: string[];
}
