const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db/index');

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use('/user',require('./routes/User'));
app.use('/question',require('./routes/Question'));
app.use('/challenges',require('./routes/Challenges'));
app.use('/solution',require('./routes/Solution'));

const connectTodb = async ()=>{
    const res = await pool.query('select 1+1 as sum');
    if( res?.rows[0]?.sum===2 ){
        console.log(`connected to db`);
        app.listen(PORT,()=>{
            console.log(`listening to port : ${PORT}`);
        })
    }
    else{
        console.error(`error occured connecting to db`);
    }
}
connectTodb();


// rnd_JbFz7S6g2xOC2wDqbeHz5xYxS8ye

