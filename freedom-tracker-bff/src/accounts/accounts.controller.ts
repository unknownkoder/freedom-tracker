import { Controller, All, Next, Req, Res, Get } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { createProxyMiddleware } from 'http-proxy-middleware';
import https from 'https';
import fs from 'fs';

@Controller('api')
export class AccountsController {
    constructor(private readonly accountsService: AccountsService) { }


    createProxy() {
        const { key, certificate } = this.accountsService.getAccountVariables();

        return createProxyMiddleware({
            target: 'https://api.teller.io',
            changeOrigin: true,
            pathRewrite: { '^/api': '' },
            agent:
                key && certificate
                    ? new https.Agent({
                        cert: fs.readFileSync(certificate),
                        key: fs.readFileSync(key),
                    })
                    : undefined,
            on: {
                proxyReq: (proxyReq, req) => {
                    const rawAuth = req.headers['authorization'];
                    if (rawAuth) {
                        const token = rawAuth.trim();
                        const basic = Buffer.from(`${token}:`).toString('base64');
                        proxyReq.setHeader('authorization', `Basic ${basic}`);
                    }
                },
            },
        });
    }

    @Get('accounts')
    forwardAccountRequests(@Req() req, @Res() res, @Next() next) {
        console.log('forward request');
        const proxy = this.createProxy();
        proxy(req, res, next);
    }
}
