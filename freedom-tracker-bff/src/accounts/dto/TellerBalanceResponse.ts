type BalanceLinks = {
    self: string,
    account: string
}

type TellerBalanceResponse = {
    account_id: string,
    ledger: string | null,
    available: string | null,
    links: BalanceLinks 
}

export default TellerBalanceResponse;
