import type { ExpoConfig, ConfigContext } from "@expo/config";

import * as dotenv from "dotenv";
import { resolve } from "path";

const envName = process.env.APP_ENV || "development";
const envFile = envName === 'mock' ?
    ".env.mocks"
    : envName === 'test' ?
        ".env.test"
        : ".env.dev";

dotenv.config({
    path: resolve(__dirname, envFile),
    override: true, // ensure this overwrites any previously loaded envs
});

export default ({ config }: ConfigContext): ExpoConfig => {
    return {
        ...config,
        name: "freedom-tracker",
        slug: "freedom-tracker",
        extra: {
            ...config.extra,
            ENABLE_MOCKS: envName === 'mock'
        },
    }
}
