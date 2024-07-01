const express = require("express");
const http = require("http");
const mongodb = require("mongodb");

if (!process.env.PORT) {
  throw new Error("Environment variable PORT must be supplied.");
}

if (!process.env.VIDEO_STORAGE_HOST) {
  throw new Error(
    "Please specify the host name for the video storage microservice in variable VIDEO_STORAGE_HOST."
  );
}

if (!process.env.VIDEO_STORAGE_PORT) {
  throw new Error(
    "Please specify the port number for the video storage microservice in variable VIDEO_STORAGE_PORT."
  );
}

if (!process.env.DB_HOST) {
  throw new Error(
    "Please specify the database host using environment variable DB_HOST."
  );
}

if (!process.env.DB_NAME) {
  throw new Error(
    "Please specify the name of the database using environment variable DB_NAME"
  );
}

const PORT = process.env.PORT;
const DB_NAME = process.env.DB_NAME;
const DB_HOST = process.env.DB_HOST;
const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST;
const VIDEO_STORAGE_PORT = parseInt(process.env.VIDEO_STORAGE_PORT);

const main = async () => {
  const client = await mongodb.MongoClient.connect(DB_HOST);
  const db = client.db(DB_NAME);
  const videosCollection = db.collection("videos");

  const app = express();

  app.get("/video", async (req, res) => {
    const videoId = new mongodb.ObjectId(req.query.id);
    const videoRecord = await videosCollection.findOne({ _id: videoId });
    if (!videoRecord) {
      res.sendStatus(404);
      return;
    }

    const forwardRequest = http.request(
      {
        host: VIDEO_STORAGE_HOST,
        port: VIDEO_STORAGE_PORT,
        path: `/video?path=${videoRecord.videoPath}`,
        method: "GET",
        headers: req.headers,
      },
      (forwardResponse) => {
        res.writeHeader(forwardResponse.statusCode, forwardResponse.headers);
        forwardResponse.pipe(res);
      }
    );

    req.pipe(forwardRequest);
  });

  app.listen(PORT, () => {
    console.log(`Service listening on port ${PORT}`);
  });
};

main().catch((err) => {
  console.error("Failed to start service.");
  console.error((err && err.stack) || err);
});
