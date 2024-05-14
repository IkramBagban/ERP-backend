require("dotenv").config();
const app       = require("./app/config/app");

const base_url  = process.env.BASE_URL || 'http://127.0.0.1';
const port      = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Server is Running at ${base_url}:${port}`);
});