const pool = require('../db');
const { randomUUID } = require('crypto');

const getAllChallenges = async (req,res)=>{
    const { email } = req.headers;
    try {
        const result = await pool.query(
            `select * from challenges where owner = $1`,
            [email]
        )
        res.status(200).json({ challenges : result.rows });
    } catch (error) {
        res.status(500).json({ message : 'some error occured' });
    }   
}

const addNewChallenge = async (req,res)=>{
    const { email } = req.headers;
    let keys = 'id,owner';
    let values = `'${randomUUID()}','${email}'`;
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
            `insert into challenges(${keys}) 
            values(${values})
            returning id,total,solved,title,description,tags
            `,
            []
        );
        res.status(201).json({ 
            message : "new challenge created", 
            challenge : result.rows[0]
        });
    } catch (error) {
        res.status(500).json(error);
    }

    // res.status(200).json({ msg : "done" });
}

const updateChallenge = async (req,res)=>{
    const id = `'${req?.params?.id}'`;
    const email = `'${req.headers.email}'`;

    if( !id )
        res.status(201).json({ message : "challenge id not provided" });

    let col_value = '';

    Object.entries(req.body)
    .forEach(([key,value])=>{
        if( Array.isArray(value) ){
            col_value += "," + key + `= array [${value.map(elem=>`'${elem}'`)}]`;
        }
        else
            col_value += ","+ key +  `= '${value}'`;
    })
    
    try {
        col_value = col_value.substring(1);
        const result = await pool.query(
            `update challenges set ${col_value} 
            where id = ${id} and owner=${email}
            returning id,total,solved,title,description,tags
            `,
            []
        );

        res.status(200).json({ 
            message : 'challenge updated successfully',
            challenge : result.rows[0]
        });
    } catch (error) {
        res.status(500).json(error);
    }
}

const deleteChallenge = async (req,res)=>{
    const id = `'${req?.params?.id}'`;
    const email = `'${req.headers.email}'`;

    try {
        const result = await pool.query(
        `delete from challenges 
        where id = ${id} and owner = ${email}
        returning title
        `
        ,[]
        )

        res.status(200).json({ 
            message : `"${result?.rows[0]?.title}" was deleted successfully` });
    } catch (error) {
        res.status(500).json( error );
    }
}

module.exports = {
    getAllChallenges,
    addNewChallenge,
    updateChallenge,
    deleteChallenge
}