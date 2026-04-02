export interface IUserAuth {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  business?: string;
  role: "owner" | "employee";
  isVerified: boolean;
  purpose: "verify_email" | "reset_password" | "login";
}
