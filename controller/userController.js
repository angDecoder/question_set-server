const pool = require('../db/index');
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    const { email, password, username } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `insert into users 
                values('${email}','${username}','${hashedPassword}')`,
            []
        );

        res.status(201).json({ msg: 'new user created' });
    } catch (error) {
        res.status(500).json(error);
    }

}


const loginUser = async (req,res)=>{
    const { email, password } = req.body;
    
    try {
        if( !email || !password )
            throw { code : 403, message : 'email and password are required' };

        let result = await pool.query(
            `select password,username from users where email=$1`,
            [email]
        );
        if( result.rowCount===0 )
            throw { code : 401, message : 'email not registered' };

        let hash = result.rows[0].password;
        const compare = await bcrypt.compare(password,hash);

        if( !compare ) 
            throw { code : 401, message : 'password did not match' };

        const refreshToken = jwt.sign(
            {email},
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn : '30 days' }
        );

        const accessToken = jwt.sign(
            {email},
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn : '2h' }
        );           

        res.status(200).json({ 
            message : 'user logged in', 
            user : {
                username : result.rows[0].username,
                accessToken,
                email,
                refreshToken
            }
        });
        
    } catch (error) {
        res.status(error.code).json({error : error.message});
    }
}

const refreshToken = async (req,res)=>{
    const { refreshToken } = req.body;

    try {
        const { email }= jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const accessToken = jwt.sign(
            { email },
            process.env.ACCESS_TOKEN_SECRET
        );

        res.status(200).json({accessToken});
    } catch (error) {
        res.status(401).json({ message : 'refresh token expired : login again' });
    }
}


module.exports = {
    registerUser,
    loginUser,
    refreshToken
}