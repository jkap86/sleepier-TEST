const https = require('https');
const axios = require('axios');

const axiosInstance = axios.create({
    headers: {
        'content-type': 'application/json'
    },
    httpsAgent: new https.Agent({ keepAlive: true }),
    timeout: 4000
});

const axiosRetry = require('axios-retry');

axiosRetry(axiosInstance, {
    retries: 3,
    retryCondition: () => true,
    retryDelay: (retryNumber) => {
        return 500 + (retryNumber * 500)
    }
})

module.exports = axiosInstance;