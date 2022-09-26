import mongoose from "mongoose";

mongoose.Promise = global.Promise;

const connection = mongoose.connect(
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5zoi47p.mongodb.net/?retryWrites=true&w=majority`
);

export { connection };
