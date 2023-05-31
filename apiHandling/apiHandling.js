const axios = require("axios");

const apiCall = async (method, url, params) => {
  const body = method === ("get" || "GET") ? "params" : "data";
  const config = {
    method,
    url,
    [body]: params || {},
    headers: {
      "Content-type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  };
  return await axios.request(config);
};

const apiCallwithKey = async (method, url, params) => {
  const body = method === ("get" || "GET") ? "params" : "data";
  const openAiSecretkey = process.env.secretkey;
  const config = {
    method,
    url,
    [body]: params || {},
    headers: {
      "Content-type": "application/json",
      "Access-Control-Allow-Origin": "*",
      Authorization: `Bearer ${openAiSecretkey}`,
    },
  };
  return await axios.request(config);
};

module.exports = { apiCall, apiCallwithKey };
