# Freedom Tracker

## Completely Free Personal Finance Tracker

### Local Setup

The Freedom tracker application requires configuration before its ready to build onto your device, please follow these steps for the smoothest experience in the application

To link you bank account, you are required to setup a teller account, navigate to https://teller.io/ and sign up, its completely free and does not require a credit card.

After signing up for teller, you should receive a cert and private key, create a new directory in the root project directory of the freedom-tracker-bff application called private, copy and paste the key and certificate into the private directory.
- The private directory is git ignored, the key and cert are required to make requests for users bank account information through teller

Next, after retrieving, and inserting your key and certificate into the bff, navigate to https://teller.io/settings/application and copy your application id, you will also need this to link your bank account with the application

Now we are ready to setup the required environment variables for the bff, in the root project directory of the freedom-trackker-bff application create your .env file

Inside the .env file you currently need 5 environment variables set
- PORT={PORT_NUMBER} you can set this port yo whatever you want your server to run on, just remember what you set it at for later on in the application
- TELLER_ENV={ENVIRONMENT} for local testing this should be set to sandbox, or development when you are ready to connect your actual bank account
- TELLER_APP_ID={APPLICATION_ID+ this is the application id you copied early from teller
- TELLER_CERT="/path/to/cert/file/certifacte.pem" this should be in the git ignored private folder in the root of your application
- TELLER_KEY="/path/to/key/file/private_key.pem" this should be in the git ignored private folder in the root of your application

After setting the above environment variables, you are now able to run the command `npm run start:dev` and the bff server will startup in dev mode

To setup the freedom tracker ui project you will once again need to create a .env or .env.local file in the root directory of the project

Inside the .env file there is currently only one environment variable needed to run the application
- EXPO_PUBLIC_SERVER_URI={URI} this is going to be where ever your bff server is running, you may need to set this to your actual local ip address for expo go to properly route the request, but you can also try localhost

Once you have setup the single environment variable for the freedom tracker ui application, you can start up the application locally, I have the best luck running the command `npm run start -- -port=8080` but feel free to try running the other start commands as well
