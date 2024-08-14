enum Roles {
  SUPER_ADMIN = "super_admin", // has access all routes
  DILLER = "diller",
  COMPANY_ADMIN = "company_admin", // has access all routes that are related to stores
  COMPANY_MANAGER = "company_manager", //
  MERCHANDISER = "merchandiser", // has access only actions on products
  CASHIER = "cashier", // has access only action on purchase
}

enum PaymentType {
  CASH = "cash",
  CARD = "card",
  DEBT = 'debt'
}

enum Gender {
  MALE = "male",
  FEMALE = "female",
}

enum StoreStatus {
  DEMO = "demo",
  ACTIVE = "active",
  IN_ACTIVE = "in_active",
}

enum ProductType {
  // KG = "kg",
  L = "l",
  M = "m",
  PCS = "pcs",
  DISCOUNT = "discount",
}

enum ProductCodeType {
  BAR_CODE = "bar_code",
  PLU = "plu",
  TWO_PU = "two_pu",
}

export { Roles, PaymentType, Gender, StoreStatus, ProductType, ProductCodeType };
