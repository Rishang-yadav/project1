const axios = require("axios");
const dbConnect = require("../lib/dbConnect");
const Block = require("../models/Block");

const fetchBlockData = async (height) => {
  try {
    const response = await axios.get(`https://mempool.space/api/block-height/${height}`);
    console.log("jayant babulal", response.data);
    if (response.data) {
      const blockHeight = response.data;
      const output = await axios.get(`https://mempool.space/api/block/${blockHeight}`);
      console.log("jayant babulal 2", output.data);
      

      if (output.data) {
        const blockData = output.data;
        return {
          height: blockData.height,
          timestamp: blockData.timestamp,
          tx_count: blockData.tx_count,
          id: blockData.id,
          processed: false
        };
      } else {
        console.error("Failed to fetch block data:", output);
        return null;
      }
    } else {
      console.error("Failed to fetch block data:", response);
      return null;
    }
  } catch (error) {
    console.error("Error fetching block data:", error);
    return null;
  }
};

exports.processBlock = async (res) => {
  try {
    await dbConnect();

    const latestBlock = res.block;
    const blockData = {
      height: latestBlock.height,
      timestamp: latestBlock.timestamp,
      tx_count: latestBlock.tx_count,
      id: latestBlock.id,
      processed: false
    };

    // Fetch last stored block height from MongoDB
    const lastStoredBlock = await Block.findOne({}, {}, { sort: { height: -1 } });
    let lastStoredHeight = lastStoredBlock ? lastStoredBlock.height : 0;
    console.log("Last Stored Height:", lastStoredHeight);

    // Find the difference between the last stored height and the latest height
    const heightDifference = latestBlock.height - lastStoredHeight;
    console.log("Difference:", heightDifference);

    if (lastStoredHeight && heightDifference) {
      for (let i = 1; i < heightDifference; i++) {
        const blockHeight = lastStoredHeight + i;
        const blockData = await fetchBlockData(blockHeight);
        if (blockData) {
          await Block.create(blockData);
          console.log("Block data stored in MongoDB:", blockData);
        } else {
          throw Error("Block data missing for: " + blockHeight);
        }
      }
      await Block.create(blockData);
      console.log("Latest block data stored in MongoDB:", blockData);
    } else {
      await Block.create(blockData);
      console.log("Latest block data stored in MongoDB:", blockData);
    }
  } catch (error) {
    console.error("Error parsing JSON:", error);
  }
};
