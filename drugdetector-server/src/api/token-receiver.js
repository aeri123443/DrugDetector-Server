require('dotenv').config();

var requestTokenAwareApi = async function() {

    try {
        const response = await fetch(process.env.ENDPOINT_OAUTH, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": 'Basic ' + btoa(process.env.APP_ID + ':' + process.env.APP_SECRET)
            },
            body: new URLSearchParams({
                grant_type: 'password',
                username: process.env.USER_NAME,
                password: process.env.USER_PASSWORD
            }),
        });

        const result = await response.json();
 
        if (result.access_token) {
            console.log("Success: get token");
            return result.access_token;
        } else {
            let errMsg = 'Failed to get token\n' + 'result:' + JSON.stringify(result); 
            throw new Error(errMsg);
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

module.exports = {
    requestTokenAwareApi,
  };			
