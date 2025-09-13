export interface Account {
    id: number,
    uuid: string,
    name: string,
    type: string,
    description: string
};

export interface CreateAccount {
    name: string,
    type: string,
    description: string
};

export interface EditAccount {
    name: string,
    type: string,
    description: string
};