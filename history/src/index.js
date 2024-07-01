const express = require("express");

if (!process.env.PORT) {
  throw new Error("Environment variable PORT must be supplied.");
}

const PORT = process.env.PORT;

const main = async () => {
  const app = express();

  app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
  });
};

main().catch(err => {
  console.log('service failed to start')
  console.log(err && err.stack || err);
})