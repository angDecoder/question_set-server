const pool = require('../db');
const { randomUUID } = require('crypto');

const getAllQuestions = async(req,res)=>{
    const id = req.headers.challenge_id;
    if( !id )
        res.json(403).json({ message : 'challenge id not provided' });

    try {
        const result = await pool.query(
            `select * from questions where challenge_id = '${id}'`,
            []
        );

        res.status(200).json({ questions : result.rows });

    } catch (error) {
        res.status(500).json(error);
    }

}

const addNewQuestion = async(req,res)=>{
    const challenge_id = `'${req?.headers?.challenge_id}'`;

    let keys = 'id,challenge_id';
    let values = `'${randomUUID()}',${challenge_id}`;

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
    // console.log(keys,values);

    try {
        const result = await pool.query(
            `insert into questions (${keys}) values(${values})`,
            []
        )

        res.status(201).json({ message : "new question added" });
    } catch (error) {
        res.status(500).json(error)
    }

}

const updateQuestion = async(req,res)=>{
    const id = req?.params?.id;
    let col_value = '';

    Object.entries(req.body)
    .forEach(([key,value])=>{
        if( Array.isArray(value) )
            col_value += "," + key + `= array[${value.map(elem=>`'${elem}'`)}]`;
        else 
            col_value += "," + key + `= '${value}'`;
    })
    col_value = col_value.substring(1);

    try {
        const result = await pool.query(
            `update questions set ${col_value} where id = '${id}'`,
            []
        );

        res.status(200).json({ message : "question updated" });
    } catch (error) {
        res.status(500).json({ message : "question was not updated" });
    }

}

const deleteQuestion = async(req,res)=>{
    const id = req?.params?.id;
    try {
        const result = await pool.query(
            `delete from questions where id = '${id}'`,
            []
        )

        res.status(200).json({ message : "question was deleted" });
    } catch (error) {
        res.status(500).json({ message : "question was not deleted",error });
    }
}

module.exports = {
    getAllQuestions,
    updateQuestion,
    deleteQuestion,
    addNewQuestion
}