import { Injectable } from '@nestjs/common';
import AccountRequestVariables from './dto/AccountRequestVariables';
import { ConfigService } from '@nestjs/config';

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
}
