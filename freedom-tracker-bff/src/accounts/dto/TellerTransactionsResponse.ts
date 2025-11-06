import { TransactionCategory, TransactionCounterParty } from "./Transaction";

type TellerTransactionDetails = {
    processing_status: 'pending' | 'complete',
    category: TransactionCategory,
    counterparty: TransactionCounterParty
}

type TellerTransactionLinks = {
    self: string,
    account: string
}

type TellerTransactionResponse = {
    account_id: string,
    amount: string,
    date: string,
    description: string,
    details: TellerTransactionDetails,
    status: string,
    id: string,
    links: TellerTransactionLinks,
    running_balance: string | null,
    type: string
}

export default TellerTransactionResponse;
