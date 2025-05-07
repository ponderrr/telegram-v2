const mongoose = require("mongoose");
require("dotenv").config();

//Database connection class
class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }

    this.mongoURI =
      process.env.MONGO_URI || "mongodb://localhost:27017/message-exchange";
    this.connection = null;
    Database.instance = this;
  }

  /**
   * Connect to MongoDB
   * @returns {Promise} Mongoose connection
   */
  async connect() {
    if (this.connection) {
      return this.connection;
    }

    try {
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      };

      this.connection = await mongoose.connect(this.mongoURI, options);
      console.log("MongoDB connected successfully");
      return this.connection;
    } catch (err) {
      console.error("MongoDB connection error:", err);
      process.exit(1);
    }
  }

  /**
   * Get the database connection
   * @returns {Object} Mongoose connection
   */
  getConnection() {
    return this.connection;
  }

  async close() {
    if (this.connection) {
      await mongoose.connection.close();
      this.connection = null;
      console.log("MongoDB connection closed");
    }
  }
}

// Export singleton instance
const dbInstance = new Database();
module.exports = dbInstance;
