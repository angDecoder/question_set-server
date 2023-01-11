const pool = require('../db/index');

const checkOwner = async (req,res,next)=>{
    const { email,challenge_id } = req?.headers;

    try {
        const result = await pool.query(
            `select owner from challenges where id = '${challenge_id}'`,
            []
        );

        if( result?.rows[0]?.owner!==email )
            throw { code : 403, message : "only owner can access " }

        next();
    } catch (error) {
        res.status(error.code||500).json({ message : error.message || error });
    }


}

module.exports = checkOwner;