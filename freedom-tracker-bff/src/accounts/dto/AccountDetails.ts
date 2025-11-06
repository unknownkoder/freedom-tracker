import Transaction from "./Transaction";

type AccountDetails = {
    accountId: string,
    balance: number,
    transactions: Transaction[]
}

export default AccountDetails;
