const express = require("express");
const mongodb = require("mongodb");

if (!process.env.PORT) {
  throw new Error("Environment variable PORT must be supplied.");
}

if (!process.env.DBNAME) {
  throw new Error("Environment variable DBNAME must be supplied.");
}

if (!process.env.DBHOST) {
  throw new Error("Environment variable DBHOST must be supplied.");
}

const PORT = process.env.PORT;
const DBNAME = process.env.DBNAME;
const DBHOST = process.env.DBHOST;

const main = async () => {
  const app = express();
  app.use(express.json());

  const client = await mongodb.MongoClient.connect(DBHOST);
  const db = client.db(DBNAME);
  const historyCollection = db.collection("history");

  app.post("/viewed", async (req, res) => {
    const videoPath = req.body.videoPath;
    await historyCollection.insertOne({
      videoPath: videoPath,
    });

    res.sendStatus(200);
  });

  app.get("/history", async (req, res) => {
    const skip = parseInt(req.query.skip);
    const limit = parseInt(req.query.limit);
    const history = await historyCollection
      .find()
      .skip(skip)
      .limit(limit)
      .toArray();
    res.json({ history });
  });

  app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
  });
};

main().catch((err) => {
  console.log("service failed to start");
  console.log((err && err.stack) || err);
});
