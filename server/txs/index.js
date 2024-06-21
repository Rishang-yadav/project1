
/***working***** */
// const dbConnect = require("../lib/dbConnect");
// const Transaction = require("../models/Tx");
// const Block = require("../models/Block");
// const axios = require("axios");

// exports.processBlockTx = async () => {
//   await dbConnect();
//   const blockToProcess = await Block.findOne({ processed: false });
//   console.log("Block to process:", blockToProcess);
//   if (!blockToProcess) {
//     console.log("All blocks have been processed");
//     return;
//   }

//   const txsOfThisBlock = await Transaction.find({ height: blockToProcess.height });
//   console.log("Number of transactions in this block:", txsOfThisBlock.length);
//   console.log("Expected number of transactions in this block:", blockToProcess.tx_count);
//   if (blockToProcess.tx_count === txsOfThisBlock.length) {
//     console.log("All transactions of this block have been added to the database");
//     blockToProcess.processed = true;
//     await blockToProcess.save();
//     console.log("Block marked as processed");
//     return;
//   }

//   try {
//     console.log("Fetching and storing transactions...");
//     let totalTransactions = [];
//     const requests = [];
//     let start_index = 0;
//     const hash = blockToProcess.id; // Get the hash of the block to fetch its transactions
//     const TotalTxCount = blockToProcess.tx_count;

//     while (start_index < TotalTxCount) {
//       const request = axios.get(`https://mempool.space/api/block/${hash}/txs/${start_index}`)
//         .then(response => response.data.map(tx => ({
//           txid: tx.txid,
//           block_height: tx.status.block_height,
//           block_hash: tx.status.block_hash,
//           timestamp: tx.time,
//           vin: tx.vin,
//           vout: tx.vout,
//           status: tx.status

//         })))
//         .catch(error => {
//           console.error("Error fetching transactions:", error.message);
//           throw error;
//         });
//       requests.push(request);
//       start_index += 25;
//     }
//     const transactionsArrays = await Promise.all(requests);
//     totalTransactions = transactionsArrays.flat(); // Flatten the array of arrays
//     await Transaction.insertMany(totalTransactions);
//     console.log("Transactions stored in the database successfully.");

//     blockToProcess.processed = true;
//     await blockToProcess.save();
//     console.log("Block marked as processed");
//   } catch (error) {
//     console.error("Error fetching or storing transactions:", error);
//   }
// };

/****update***/
const dbConnect = require("../lib/dbConnect");
const Transaction = require("../models/Tx");
const Block = require("../models/Block");
const axios = require("axios");
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

exports.processBlockTx = async () => {
  await dbConnect();
  const blockToProcess = await Block.findOne({ processed: false });
  console.log("Block to process:", blockToProcess);
  if (!blockToProcess) {
    console.log("All blocks have been processed");
    return;
  }

  const txsOfThisBlock = await Transaction.find({ block_height: blockToProcess.height });
  console.log("Number of transactions in this block:", txsOfThisBlock.length);
  console.log("Expected number of transactions in this block:", blockToProcess.tx_count);

  if (blockToProcess.tx_count === txsOfThisBlock.length) {
    console.log("All transactions of this block have been added to the database");
    blockToProcess.processed = true;
    await blockToProcess.save();
    console.log("Block marked as processed");
    return;
  }

  try {
    console.log("Fetching and storing transactions...");
    let totalTransactions = [];
    const requests = [];
    let start_index = 0;
    const hash = blockToProcess.id; 
    const TotalTxCount = blockToProcess.tx_count;

    while (start_index < TotalTxCount) {
      const request = axios.get(`https://mempool.space/api/block/${hash}/txs/${start_index}`)
        .then(response => response.data.map(tx => ({
          txid: tx.txid,
          block_height: tx.status.block_height,
          block_hash: tx.status.block_hash,
          processed:false,
          timestamp: tx.time,
          vin: tx.vin,
          vout: tx.vout,
          status: tx.status

        })))
        .catch(error => {
          console.error("Error fetching transactions:", error.message);
          throw error;
        });
      requests.push(request);
      start_index += 25;
      await delay(1000); // 1 second delay between each request
    }
    const transactionsArrays = await Promise.all(requests);
    totalTransactions = transactionsArrays.flat(); // Flatten the array of arrays
    await Transaction.insertMany(totalTransactions);
    console.log("Transactions stored in the database successfully.");

    blockToProcess.processed = true;
    await blockToProcess.save();
    console.log("Block marked as processed");
  } catch (error) {
    console.error("Error fetching or storing transactions:", error);
  }
};
