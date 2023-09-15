const express = require('express');
const app = express();
const {Web3} = require('web3');
const ABI = require('./ABI.json');
const cors = require('cors');

app.use(express.json());
app.use(cors());

const web3 = new Web3("HTTP://127.0.0.1:7545");
      const contractAddress = "0xa3Aa40cEAa9AEBA0c6FB2A688ab205c057E91beb";
      //to create contract instance - abi and contract address
      const contract = new web3.eth.Contract(ABI, contractAddress);

const genderVerifiaction = (gender)=>{
    const genderValue = gender.toLowerCase();
    if(genderValue === "male" || genderValue === "female" || genderValue === "others"){
        return true;
    }
    return false;
}

const partyClash = async(party) =>{
    const candidateList = await contract.methods.candidateList().call();
    const exists = candidateList.some((candidate) => candidate.party.toLowerCase() === party.toLowerCase());
    return exists;
}

app.post('/api/candidate-verify', async(req, res)=>{
    const {party, gender} = req.body;
    const genderStatus = genderVerifiaction(gender);
    const partyClashStatus = await partyClash(party);
    if(genderStatus === true){
        if(partyClashStatus === false){
            res.status(200).json({message: "Registration successful"})
        }else{
            res.status(403).json({message: "Party clashes"})
        }
    }else{
        res.status(403).json({message: "Invalid gender"})
    }
})

app.post("/api/voter-verify", async(req, res)=>{
    const {gender} = req.body;
    const genderStatus = genderVerifiaction(gender);
    if(genderStatus === true){
        res.status(200).json({message: "Registration Successful"})
    }else{
        res.status(403).json({message: "invalid gender"})
    }
})

app.post("/api/time-verify", async(req, res)=>{
    const {startInSeconds,endInSeconds} = req.body;
    if(endInSeconds - startInSeconds < 86400){
        res.status(200).json({message: "Good to go"})
    }else{
        res.status(403).json({message: "Invalid time limit"})
    }
})

app.listen(3000, ()=>{
    console.log("server is running at port 3000");
})