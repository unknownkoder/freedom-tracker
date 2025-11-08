import * as schema from '@/db/schema';

export type AccountDetailsRequest = {
    accountId: string;
    accessToken: string;
    transactionId?: string;
}

export type TransactionCounterParty = {
    name: string | null,
    type: 'organization' | 'person' | null
}

export type TransactionCategory =
    'accommodation' | 
    'advertising' |
    'bar' |
    'charity' |
    'clothing' |
    'dining' |
    'education' |
    'electronics' |
    'entertainment' |
    'fuel' |
    'general' |
    'groceries' |
    'health' |
    'home' |
    'income' |
    'insurance' |
    'investment' |
    'loan' |
    'office' |
    'phone' |
    'service' |
    'shopping' |
    'software' |
    'sport' |
    'tax' |
    'transport' |
    'transportation' |
    'utilities' |
    null;

export type TellerTransaction = {
    transactionId: string,
    amount: number,
    date: string,
    category: TransactionCategory,
    counterParty: TransactionCounterParty,
    type: string
}

export type AccountDetails = {
    accountId: string,
    balance: number,
    transactions: TellerTransaction[]
}

export type FetchAndPersistAccountInfoResponse = {
    accounts: schema.Account[],
    transactions: schema.Transaction[]
}
