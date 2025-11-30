export interface Category {
    id: string,
    name: string,
    type: string,
    amount: number,
    icon: string,
    totalAmount: number,
    refUserID: string,
    refAccountsID: string,
};

export interface CreateCategory {
    name: string,
    type: string
};

export interface EditCategory {
    name: string,
    type: string,
    icon: string
};