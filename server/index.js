
// const express = require("express");
// const mempoolJS = require("@mempool/mempool.js");
// const axios = require("axios");
// const cron = require("node-cron"); 
// const { processBlock } = require("./block");
// const { processBlockTx } = require("./txs");

// require("dotenv").config();

// const app = express();

// //middleware to parse json response body
// app.use(express.json());

// const init = async () => {
//   try {
//     const {
//       bitcoin: { websocket },
//     } = mempoolJS({
//       hostname: "mempool.space",
//     });

//     // Function to establish WebSocket connection
//     const connectWebSocket = () => {
//       const ws = websocket.initServer({
//         options: ["blocks"],
//       });

//       ws.on("message", async function incoming(data) {
//         try {
//           const res = JSON.parse(data);

//           // Store only the latest block data in MongoDB
//           if (res.block) {
//             await processBlock(res);
//             //await processBlockTx(res);
//           }
//         } catch (error) {
//           console.error("Error parsing JSON:", error);
//         }
//       });

//       ws.on("close", () => {
//         console.log("WebSocket was closed. Attempting to reconnect...");
//         setTimeout(connectWebSocket, 5000); // Attempt to reconnect after 5 seconds
//       });

//       ws.on("error", (error) => {
//         console.error("WebSocket error:", error);
//         ws.close(); // Ensure the socket is closed before reconnecting
//         setTimeout(connectWebSocket, 5000); // Attempt to reconnect after 5 seconds
//       });
//     };

//     // Initial call to connect the WebSocket
//     connectWebSocket();

//     // Schedule cron job to run processBlockTx every minute
//     cron.schedule("*/10 * * * *", async () => {
//       console.log("Running processBlockTx cron job...");
//       await processBlockTx();
//     });

//     // API endpoint to retrieve all block data
//     app.get("/blocks", async (req, res) => {
//       try {
//         const allBlocks = await Block.find();
//         res.json(allBlocks);
//       } catch (error) {
//         console.error("Error retrieving all block data:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//       }
//     });

//     // Start the Express server
//     const PORT = process.env.PORT || 3000;
//     app.listen(PORT, () => {
//       console.log(`Express server running on port ${PORT}`);
//     });
//   } catch (error) {
//     console.error("Initialization error:", error);
//   }
// };

// init();


/****update***/
const express = require("express");
const mempoolJS = require("@mempool/mempool.js");
const axios = require("axios");
const cron = require("node-cron"); 
const { processBlock } = require("./block");
const { processBlockTx } = require("./txs");
const{inscriptionCheck} = require("./inscription_check");

require("dotenv").config();

const app = express();

//middleware to parse json response body
app.use(express.json());

const init = async () => {
  try {
    const {
      bitcoin: { websocket },
    } = mempoolJS({
      hostname: "mempool.space",
    });

    // Function to establish WebSocket connection
    const connectWebSocket = () => {
      const ws = websocket.initServer({
        options: ["blocks"],
      });

      ws.on("message", async function incoming(data) {
        try {
          const res = JSON.parse(data);

          // Store only the latest block data in MongoDB
          if (res.block) {
            await processBlock(res);
            // await processBlockTx(res);
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      });

      ws.on("close", () => {
        console.log("WebSocket was closed. Attempting to reconnect...");
        setTimeout(connectWebSocket, 5000); // Attempt to reconnect after 5 seconds
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
        ws.close(); // Ensure the socket is closed before reconnecting
        setTimeout(connectWebSocket, 5000); // Attempt to reconnect after 5 seconds
      });
    };

    // Initial call to connect the WebSocket
    connectWebSocket();

    //Schedule cron job to run processBlockTx every 5 minutes
    cron.schedule("*/3 * * * *", async () => {
      console.log("Running processBlockTx cron job...");
      await processBlockTx();
      await inscriptionCheck();
    });

    // API endpoint to retrieve all block data
    app.get("/blocks", async (req, res) => {
      try {
        const allBlocks = await Block.find();
        res.json(allBlocks);
      } catch (error) {
        console.error("Error retrieving all block data:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // Start the Express server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Express server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Initialization error:", error);
  }
};


init();
