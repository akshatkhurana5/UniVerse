if(process.env.NODE_ENV!="production"){
    require("dotenv").config();
}
const express=require('express');
const app=express();
const mongoose=require('mongoose');
const cors = require('cors');

main().then(()=>{
    console.log("Connected Successfully");
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/UniVerse');
}



app.use(express.json());
app.use(cors());


const postRoutes = require("./routes/post");
const clubRoutes = require("./routes/clubs");
const eventRoutes = require("./routes/event");

app.use("/api/posts", postRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/clubs", eventRoutes);




app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
});
