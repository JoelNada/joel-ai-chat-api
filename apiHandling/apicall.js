const { apiCall, apiCallwithKey } = require("./apiHandling");
require("dotenv").config();

const url1 = process.env.url2;
const ai = process.env.url;

const login = async () => {
  return await apiCall("GET", url1, null);
};

const openApi = async (data) => {
  return await apiCallwithKey("POST", ai, data);
};

module.exports = { login, openApi };
