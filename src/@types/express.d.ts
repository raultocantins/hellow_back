declare namespace Express {
  export interface Request {
    user: {
      id: string;
      profile: string;
      isSuper: boolean;
      companyId: number;
      permissions: string[];
    };
    companyId: number | undefined;
    tokenData:
      | {
          permissions: string[];
          isActive: boolean;
          accessWeekdays: string[];
          accessWeekend: string[];
          id: string;
          username: string;
          profile: string;
          super: boolean;
          companyId: number;
          iat: number;
          exp: number;
        }
      | undefined;
  }
}
