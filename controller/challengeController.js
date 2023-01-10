const pool = require('../db');
const { randomUUID } = require('crypto');

const getAllChallenges = async (req,res)=>{
    const { email } = req.headers;
    try {
        const result = await pool.query(
            `select * from challenges 
            where owner_id = (
                select id from users
                where email = $1
            )`,
            [email]
        )
        res.status(200).json({ challenges : result.rows });
    } catch (error) {
        
    }
}

const addNewChallenge = async (req,res)=>{
    const { email } = req.headers;
    let keys = 'id';
    let values = `'${randomUUID()}'`;
    Object.entries(req.body)
    .forEach(([key,value])=>{
        keys += ',' + `${key}`;
        if( Array.isArray(value) ){
            value = value.map(elem=>`'${elem}'`);
            value = `array [${value}]`;
            values += ',' + value;
        }   
        else
            values += ',' + `'${value}'`;
    });

    try {
        const result = await pool.query(
            `insert into challenges(${keys}) values(${values})`,
            []
        );

        // console.log(result);
        res.status(201).json({ message : "new challenge created" });
    } catch (error) {
        res.status(500).json(error);
    }

    // res.status(200).json({ msg : "done" });
}

const updateChallenge = async (req,res)=>{
    const id = req;
    let col_value;

    const result = await pool.query(
        `update challenges set ${col_value}
        where id = ${id};
        `
    )
}

module.exports = {
    getAllChallenges,
    addNewChallenge,
    updateChallenge
}