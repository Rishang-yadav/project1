const mongoose = require("mongoose");

// Define a schema for transactions
const transactionSchema = new mongoose.Schema({
    txid: String,
    block_height: Number,
    block_hash: String,
    processed: Boolean,
    type:String,
    inscription_count: Number,
    inscription:Array,
    version: Number,
    timestamp: Number,
    vin: Array,
    vout: Array,
    status: Array,
  });
  
  module.exports = mongoose.model('Transaction', transactionSchema);

