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
    'utilities'
    null;


type Transaction = {
    transactionId: string,
    amount: number,
    date: Date,
    category: TransactionCategory,
    counterParty: TransactionCounterParty,
    type: string
}

export default Transaction;
