// getting-started.js
const mongoose = require('mongoose');


const connectdb = async () => {
  await mongoose.connect('mongodb+srv://19adityanayak:UKojh9Bpq7WLg0uJ@cluster0.mqssec2.mongodb.net/FileForge');
} 

module.exports = {
  connectdb
};