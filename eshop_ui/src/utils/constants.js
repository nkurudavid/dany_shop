export const API_BASE_URL = import.meta.env.BACKEND_API_BASE_URL || 'http://localhost:8000/api';

export const USER_ROLES = {
    CUSTOMER: "customer",
    SELLER: "seller",
    STORE_MANAGER: "store_manager",
};

export const GENDERS = {
    MALE: "male",
    FEMALE: "female",
    OTHER: "other",
    PREFER_NOT_TO_SAY: "prefer_not_to_say",
};

export const ORDER_STATUS = {
    PENDING: "Pending",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    SUCCESS: "Success",
    CANCELED: "Canceled",
};

export const MOVEMENT_TYPES = {
    STOCK_IN: "Stock In",
    STOCK_OUT: "Stock Out",
};

export const PRODUCT_UNITS = {
    GRAM: "g",
    KILOGRAM: "kg",
    PIECE: "pc",
    BOX: "box",
};

export const PAYMENT_METHODS = {
    COD: 'COD',
    ONLINE: 'Online',
};