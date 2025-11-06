import { Injectable } from '@nestjs/common';
import AccountRequestVariables from './dto/AccountRequestVariables';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';
import * as fs from 'fs';
import axios, { Axios } from 'axios';
import AccountDetails from './dto/AccountDetails';
import TellerBalanceResponse from './dto/TellerBalanceResponse';
import DefaultErrorDTO from './dto/DefaultErrorDTO';
import TellerTransactionResponse from './dto/TellerTransactionsResponse';
import AccountDetailsRequest from './dto/AccountDetailsRequest';

@Injectable()
export class AccountsService {
    constructor(private configService: ConfigService) { }

    getAccountVariables():AccountRequestVariables {
        const cert = this.configService.get<string>('TELLER_CERT') || '';
        const key = this.configService.get<string>('TELLER_KEY') || '';
        return {
            certificate: cert,
            key
        }
    }

    getMtlsClient(accessToken:string) {
        const {certificate, key} = this.getAccountVariables();
        const httpsAgent = new https.Agent({
            cert: fs.readFileSync(certificate),
            key: fs.readFileSync(key),
            rejectUnauthorized: true
        })

        const token = accessToken.trim();
        const basic = Buffer.from(`${token}:`).toString('base64');

        const mtlsClient = axios.create({
            baseURL: 'https://api.teller.io/accounts/',
            httpsAgent,
            headers: {
                'Authorization': `Basic ${basic}` 
            }
        });

        return mtlsClient;
    }

    async getAccountBalance(accountId: string, accessToken:string): Promise<TellerBalanceResponse>{
        const client = this.getMtlsClient(accessToken);
        try{
            const res = await client.get(`/${accountId}/balances`);
            return res.data;
        } catch(e){
            console.log(e);
            throw new Error(e);
        }
    }

    async getAccountTransactions(accountId: string, accessToken:string, transactionId?: string): Promise<TellerTransactionResponse[]>{
        const client = this.getMtlsClient(accessToken);
        try{
            const res = await client.get(`/${accountId}/transactions${transactionId ? `?from_id=${transactionId}` : ''}`);
            return res.data;
        } catch(e){
            console.log(e);
            throw new Error(e);
        }
    }

    async getAccountDetails(accountId: string, accessToken:string, transactionId?: string): Promise<AccountDetails>{
        try{
            const [balance, transactions] = await Promise.all([
                this.getAccountBalance(accountId, accessToken),
                this.getAccountTransactions(accountId, accessToken, transactionId)
            ]);

            //Get the available balance if not null, otherwise ledger if not null, otherwise 0.00
            const balanceString = balance.available ? balance.available :
                balance.ledger ? balance.ledger : '0.00'; 

            const mappedTransactions = transactions.map((transaction:TellerTransactionResponse) => {
                const transactionDate = new Date(transaction.date);
                const transactionAmount = Number(transaction.amount);
                return {
                    transactionId: transaction.id,
                    amount: transactionAmount,
                    date: transactionDate,
                    category: transaction.details.category,
                    counterParty: transaction.details.counterparty,
                    type: transaction.type
                }
            })

            const accountDetails: AccountDetails = {
                accountId,
                balance: Number(balanceString),
                transactions: mappedTransactions
            }

            return accountDetails;

        } catch(e){
            console.log(e);
            throw new Error(e);
        }

    }

    async getAllAccountDetails(accounts:AccountDetailsRequest[]):Promise<AccountDetails[]> {
        const requests =
            accounts.map((accountInfo) => 
                         this.getAccountDetails(
                             accountInfo.accountId,
                             accountInfo.accessToken,
                             accountInfo.transactionId
                         )
            );

        const accountDetails = await Promise.all(requests);
        return accountDetails;
    } 
}
