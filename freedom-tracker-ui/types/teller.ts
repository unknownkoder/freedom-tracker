import * as schema from '@/db/schema';

export type TellerConnectUser = {
    id: string
}

export type TellerConnectInstitution = {
    id: string,
    name: string
}

export type TellerConnectEnrollment = {
    id: string,
    institution: TellerConnectInstitution,
}

export type TellerConnectResponse = {
    accessToken: string,
    user: TellerConnectUser,
    enrollment: TellerConnectEnrollment,
    signatures: string[]
}

export type TellerAccountResponseLinks = {
    self: string,
    details: string,
    balances: string,
    transactions: string
}

export type TellerAccountResponseType = 'depository' | 'credit';
export type TellerAccountResponseSubtype = 
    'checking' | 
    'savings' |
    'money_market' |
    'certificate_of_deposit' |
    'treasury' |
    'sweep' |
    'credit_card';
export type TellerAccountResponseStatus = 'open' | 'closed';

export type TellerAccountResponse = {
    currency: string,
    enrollmentId: string,
    id: string,
    institution: TellerConnectInstitution,
    last_four: string,
    links: TellerAccountResponseLinks,
    name: string,
    type: TellerAccountResponseType,
    subtype: TellerAccountResponseSubtype,
    status: TellerAccountResponseStatus
}

export type ConnectAccountCallback = {
    enrollment: TellerConnectResponse,
    account: TellerAccountResponse
}

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
