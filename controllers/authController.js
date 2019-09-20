const util = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');

exports.login = async (req, res, next) => {
    try {
        newUser = false;
        const { username, password } = req.body;
        // 1) Check if username and password exist
        if (!username || !password) {
            return res.status(401).json({
                status: 'fail',
                message: 'Please provide username and password.'
            });
        }
        // 2) Check if user exist and password is correct
        let user = await User.findOne({username: username}).select('+password'); // include password in output(it was previously excluded)
        if (!user) { // if doesn't exist => create new username
            user = await User.create({
                username: req.body.username,
                password: req.body.password
            });
            newUser = true;
        } else if (!(await user.correctPassword(password, user.password))) {
            return res.status(401).json({
                status: 'fail',
                message: 'Incorrect password'
            })
        }
        // 3) Create JWT token for user and send token to cookie
        const token = signToken(user._id);
        const cookieOptions = {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 1000 * 60 * 60 * 24)
            // httpOnly: true
            // secure: true
        };
        res.cookie('jwt', token, cookieOptions);
        // 4) If all is good, send token to client
        user.password = undefined; // hides password from output
        res.status(200).json({
            status: 'success',
            token,
            data: {
                user: user,
                newUser: newUser
            }
        });
    } catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.protect = async (req, res, next) => {
    try {
        let token;
        // 1) Get token and check if exist
        if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }
        if (!token) {
            return res.status(401).json({
                status: 'fail',
                message: 'You are not logged in! Please login to gain access!'
            });
        }
        // 2) Verify token(if manipulated or expired)
        const decoded = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET);

        // 3) If verification successfull, check if user exist
        ///// User may have been removed from database, whilst the token that made using
        ///// the user id is still valid.
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({
                status: 'fail',
                message: 'The user belonging to this token no longer exists.'
            });
        }
        // 4) Grants access(next middleware)
        req.user = currentUser;
        next();
    } catch(err) {
        res.status(401).json({
            status: 'fail',
            message: err            
        });
    }
};

// Helper functions
const signToken = (id) => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};