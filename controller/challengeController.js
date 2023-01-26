const pool = require('../db');
const { randomUUID } = require('crypto');

const getAllChallenges = async (req,res)=>{
    const { email } = req.headers;
    try {
        const result = await pool.query(
            // `select * from challenges where owner = $1`,
            `SELECT ID,TITLE,DESCRIPTION,TOTAL,SOLVED,TAGS
            FROM CHALLENGES
            WHERE OWNER = $1`,
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
            `INSERT INTO CHALLENGES(${keys})
            VALUES (${values})
            RETURNING ID`,
            []
        );
        res.status(201).json({ 
            message : "new challenge created", 
            challenge_id : result.rows[0].id
        });
    } catch (error) {
        res.status(500).json(error);
    }

}

const updateChallenge = async (req,res)=>{
    const id = `'${req?.params?.id}'`;
    const email = `'${req.headers.email}'`;

    if( !id )
        res.status(201).json({ message : "challenge id not provided" });

    let col_value = '';
    let returningValue = ''

    Object.entries(req.body)
    .forEach(([key,value])=>{
        returningValue += "," + key;
        if( Array.isArray(value) ){
            col_value += "," + key + `= array [${value.map(elem=>`'${elem}'`)}]`;
        }
        else
            col_value += ","+ key +  `= '${value}'`;
    })
    
    try {
        col_value = col_value.substring(1);
        returningValue = returningValue.substring(1);
        const result = await pool.query(
            `UPDATE CHALLENGES
            SET ${col_value}
            WHERE ID = ${id} AND OWNER = ${email}
            RETURNING ${returningValue}`,
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
        `DELETE FROM CHALLENGES
        WHERE ID = ${id} AND OWNER = ${email}
        RETURNING TITLE`
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