export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  role: "owner" | "employee";
  isVerified: boolean;
  permission: {
    _id: string;
    user: string;
    dashboard: boolean;
    expense: boolean;
    returnable: boolean;
    payment: boolean;
    expenseCategory: boolean;
    product: boolean;
    customer: boolean;
    supplier: boolean;
    purchase: boolean;
    sale: boolean;
    collaborator: boolean;
    report: boolean;
    store: boolean;
    quotation: boolean;
    setting: boolean;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type Business = {
  _id: string;
  businessName: string;
  owner: string;
  TINNumber?: string;
  about?: string;
  address: string;
  currency: string;
  productKey: string;
  createdAt: Date;
  updatedAt: Date;
};
