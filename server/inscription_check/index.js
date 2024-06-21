//  const dbConnect = require('../lib/dbConnect');
//  const Transaction = require('../models/Tx');
//  const axios = require("axios");

//  exports.inscriptionCheck = async () =>{
//     await dbConnect();
//     const txsProcess = await Transaction.findOne({ processed: false });
//     console.log("Transaction to process:", txsProcess);
//     if (!txsProcess) {
//         console.log("All Transaction one block have been processed");
//         return;
//     }
    

//     const url = `https://ord.ordinalnovus.com/api/tx/${txsProcess.txid}`;

//     try{
//         const response = await axios.get(url);
//         console.log("Response:", response.data);
//         txsProcess.inscription_count = response.data.inscription_count;
//         txsProcess.inscription = response.data.outputs_info;
//         txsProcess.processed = true;
//         await txsProcess.save();
//         console.log("inscription marked as processed");
//     }
//     catch (err) {
//         console.log("Error:", err);
//         return;
//     }
//  }


const dbConnect = require('../lib/dbConnect');
const Transaction = require('../models/Tx');
const axios = require("axios");

exports.inscriptionCheck = async () => {
    await dbConnect();
    const txsProcess = await Transaction.findOne({ processed: false });
    console.log("Transaction to process:", txsProcess);
    if (!txsProcess) {
        console.log("All transactions have been processed");
        return;
    }

    const url = `https://ord.ordinalnovus.com/api/tx/${txsProcess.txid}`;

    try {
        const response = await axios.get(url);
        console.log("Response:", response.data);

       
        let type;
        if (response.data.inscription_count != 0) {
            type = "inscribe";
        } else if (response.data.outputs_info.length >= 0) {
            type = "transfer";
        } else {
            type = "sale";
        }

        txsProcess.inscription_count = response.data.inscription_count;
        txsProcess.inscription = response.data.outputs_info;
        txsProcess.type = type;
        txsProcess.processed = true;
        await txsProcess.save();
        console.log("Inscription marked as processed with type:", type);
    } catch (err) {
        console.log("Error:", err);
        return;
    }
};
