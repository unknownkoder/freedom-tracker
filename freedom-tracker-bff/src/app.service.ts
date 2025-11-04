import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type ConnectionVariables = {
        environment: string;
        applicationId: string;
    }

@Injectable()
export class AppService {
    constructor(private configService: ConfigService) { }
 

    getConnectVariables():ConnectionVariables {
        const env = this.configService.get<string>('TELLER_ENV') || '';
        const appId = this.configService.get<string>('TELLER_APP_ID') || '';
        return {
            environment: env,
            applicationId: appId
        }
    }
}


