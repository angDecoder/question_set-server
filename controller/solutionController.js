const pool = require('../db/index');


const getSolution = async(req,res)=>{
    const id = req.params.id;
    try {
        const result = await pool.query(
            `SELECT LANGUAGE,CODE 
            FROM QUESTIONS
            WHERE ID = $1`,
            [id]
        );

        res.status(200).json({...result.rows[0]});
    } catch (error) {
        res.status(500).json(error);
    }

}

const updateSolution = async(req,res)=>{
    const { language,code } = req.body;
    const id = req.params.id;
    // console.log(id);

    // res.json({ language,code,id });
    // return;
    try {
        await pool.query(
            `UPDATE QUESTIONS
            SET LANGUAGE = '${language}',CODE = '${code}'
            WHERE ID = '${id}'`,
            []
        );

        res.status(200).json({ message : 'question updated' });
    } catch (error) {
        res.status(500).json(error);
    }
}

module.exports = {
    getSolution,
    updateSolution,
}