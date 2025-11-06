import { Injectable } from '@nestjs/common';
import AccountRequestVariables from './dto/AccountRequestVariables';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';
import * as fs from 'fs';
import axios, { Axios } from 'axios';

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

    async getAccountBalance(accountId: string, accessToken:string){
        const client = this.getMtlsClient(accessToken);
        try{
            const res = await client.get(`/${accountId}/balances`);
            return res.data;
        } catch(e){
            console.log(e);
            return {message: 'Unable to complete request', error: e}
        }
    }

    async getAccountTransactions(accountId: string, accessToken:string){
        const client = this.getMtlsClient(accessToken);
        try{
            const res = await client.get(`/${accountId}/transactions`);
            return res.data;
        } catch(e){
            console.log(e);
            return {message: 'Unable to complete request', error: e}
        }
    }
}
