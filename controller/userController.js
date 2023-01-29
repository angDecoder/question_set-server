const pool = require('../db/index');
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');
const jwt = require('jsonwebtoken');
const { CLIENT_RENEG_LIMIT } = require('tls');

const registerUser = async (req, res) => {
    const { email, password, username } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            `INSERT INTO USERS(
                EMAIL,
                PASSWORD,
                USERNAME
            )
            VALUES($1,$2,$3)`,
            [email,hashedPassword,username]
        );

        res.status(201).json({ message : "New User Created" });
        return;
    } catch (error) {
        if( error.code==='23505' )
            res.status(403).json({ message : error.detail });
        else 
            res.status(500).json({ message : "some error occured" });
    }

}

const loginUser = async (req,res)=>{
    const { email, password } = req.body;
    
    try {
        if( !email || !password )
            throw { code : 403, message : 'email and password are required' };

        let result = await pool.query(
            `SELECT PASSWORD,USERNAME
            FROM USERS
            WHERE EMAIL = $1;`,
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
            { expiresIn : '2000000' }
        );
        
        const a = await pool.query(
            `UPDATE USERS
            SET REFRESH_TOKEN = $1
            WHERE EMAIL = $2`,
            [refreshToken,email]
        );
        // console.log(a.rows[0].refresh_token);

        res.status(200).json({ 
            message : 'User Logged In', 
            user : {
                username : result.rows[0].username,
                refreshToken,
                accessToken
            }
        });
        
    } catch (error) {
        if( error.code )
            res.status(error.code).json({ message : error.message });
        else 
            res.status(500).json({ message : "some error occured" });
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

const autoLoginUser = async( req,res )=>{
    const { refreshToken } = req.body;

    if( !refreshToken )
        res.status(403).json({ message : "refresh token not available" });

    
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async( err,decoded )=>{
            if( err ){
                res.status(400).json({ err,message : "refresh token expired : login again" });
                return;
            }
            const result = await pool.query(
                `SELECT USERNAME,REFRESH_TOKEN
                FROM USERS 
                WHERE EMAIL = $1`,
                [decoded.email]
            );
            const accessToken = jwt.sign(
                {email : decoded.email},
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn : '2h' }
            );
            if( result?.rows[0]?.refresh_token===refreshToken ){
                res.status(200).json({ 
                    message : "user logged in",
                    user : {
                        username : result.rows[0].username,
                        email : decoded.email,
                        accessToken
                    }
                });
            }
            else{
                res.status(400).json({ message : "refresh token not valid" });
            }
            
        }
    )
}

const logoutUser = async( req,res )=>{
    const { email } = req.body;

    try {
        await pool.query(
            // `update users set refresh_token = '${randomUUID()}' where email = '${email}'`,
            `UPDATE USERS
            SET REFRESH_TOKEN = $1
            WHERE EMAIL = $2`
            [randomUUID(),email]
        )

        res.status(200).json({ message : "user logged out" });
    } catch (error) {
        res.status(500).json({ message : "someting went wrong" });
    }
}


module.exports = {
    registerUser,
    loginUser,
    refreshToken,
    autoLoginUser,
    logoutUser
}