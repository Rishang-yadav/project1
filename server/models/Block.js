const mongoose = require("mongoose");
//const { Schema } = mongoose;

const blockSchema = new  mongoose.Schema({
  height: Number,
  timestamp: Number,
  tx_count: Number,
  id: String,
  processed: Boolean,
});


module.exports = mongoose.model("Block", blockSchema);