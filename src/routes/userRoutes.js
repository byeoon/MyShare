const express = require("express")
const AppDataSource = require('../database')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const nodemailer = require('nodemailer')
const { securityLogMessage } = require("../utils/Logger")

const router = express.Router();

var transporter = nodemailer.createTransport({
    host: "smtp.mailgun.org",
    port: 587,
    auth: {
        user: process.env.EMAIL_NAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

// **
// Contrary to what the API says, this is actually the registration endpoint.
// When you make an account, the information gets passed here.
// The site administrator can disable registration by configuring the .env file. (ALLOW_REGISTERING)
// **
router.post("/users", async (req, res) => {
    let { username, email, password } = req.body;
    try {
        const userRepo = AppDataSource.getRepository("User");
        if (process.env.ALLOW_REGISTERING == "false") {
            return res.status(400).json({ message: "Registering is not allowed. Please contact the site administrator for more information." });
        }

        const existing = await userRepo.findOneBy({ email });
        if (existing) {
            return res.status(400).json({ message: "User already exists!" })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        password = hashedPassword; // This feels insecure.

        const user = userRepo.create({ username, email, password });
        const newuser = await userRepo.save(user);
        const secret = process.env.JWT_SECRET || 'secret';
        const userToken = jwt.sign({ email: user.email }, secret);

        res.cookie('token', userToken, { httpOnly: false, secure: false, maxAge: 3600000 * 24 * 7 }); // 7 days
        res.status(201).json({ message: "User created.", user: newuser, token: userToken })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal error" })
    }
})


// **
// Starts the account recovery process.
// Creates the recovery token and sends an email, if the email doesn't exist it gets output to the console.
// **
router.post('/users/accountrecovery', async (req, res) => {
    const { email } = req.body;
    const userRepo = AppDataSource.getRepository("User");
    const user = await userRepo.findOneBy({ email: email });

    if (!user) {
        return res.status(401).json({ error: 'This email has not been registered.' });
    }

    const secret = process.env.JWT_SECRET || 'secret';
    const token = jwt.sign({ email: user.email }, secret, { expiresIn: '15m' });
    const recoveryLink = `${process.env.BASE_URL}/recovery.html?token=${token}`;

    if (!process.env.EMAIL_NAME || !process.env.EMAIL_PASSWORD) {
        console.log(`Link: ${recoveryLink}`);
        return res.status(200).json({ message: "Recovery link generated in console." });
    }

    var mail = {
        from: process.env.EMAIL_NAME,
        to: email,
        subject: 'MyShare - Account Recovery',
        text: `You have requested to recover your password. Click on the link to reset your password: ${recoveryLink}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #170279ff; border-radius: 8px;">
                <h2 style="color: #333; text-align: center;">MyShare Account Recovery</h2>
                <p style="color: #555; font-size: 16px;">Hello user,</p>
                <p style="color: #555; font-size: 16px;">We received a request to reset your password. You can securely reset it by clicking the button below:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${recoveryLink}" style="background-color: #3936dfff; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
                </div>
                <p style="color: #414141ff; font-size: 14px;">If you did not request a password reset, you can safely ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #aaa; font-size: 12px; text-align: center;">If the button doesn't work, copy and paste this link into your browser:<br><a href="${recoveryLink}" style="color: #007bff;">${recoveryLink}</a></p>
            </div>
        `
    }

    transporter.sendMail(mail, function (error, info) {
        if (error) {
            console.log(error);
            return res.status(500).json({ error: "Failed to send recovery email." });
        } else {
            securityLogMessage('Email sent: ' + info.response);
            return res.status(200).json({ message: "Recovery email sent." });
        }
    })
})

// **
// Resets the user's password.
// **
router.post('/users/resetpassword', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ error: "Token and new password are required." });
    }

    const secret = process.env.JWT_SECRET || 'secret';
    try {
        const decoded = jwt.verify(token, secret);
        const userRepo = AppDataSource.getRepository("User");
        const user = await userRepo.findOneBy({ email: decoded.email });

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await userRepo.save(user);

        securityLogMessage(`Password reset for user ${user.email}`);
        res.status(200).json({ message: "Password has been successfully reset." });
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "Invalid or expired token." });
    }
})

// **
// This logs the user in by checking the email and if the hashed password matches.
// If all conditions are met, the user gets a token and logs in.
// **
router.post('/users/login', async (req, res) => {
    const { email, password } = req.body;
    const userRepo = AppDataSource.getRepository("User");
    const user = await userRepo.findOneBy({ email: email });

    // Could add better handling but not now
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        securityLogMessage("User typed the wrong password.");
        return res.status(401).json({ error: 'Invalid password!' });
    }

    const secret = process.env.JWT_SECRET || 'secret';
    const token = jwt.sign({ email: user.email }, secret);
    res.cookie('token', token, { httpOnly: false, secure: false, maxAge: 3600000 * 24 * 7 }); // 7 days
    res.json({ token });
    securityLogMessage("New user signed in");
})

// **
// Gets the current host registration status.
// **
router.get("/getregistrationstatus", async (req, res) => {
    try {
        if (process.env.ALLOW_REGISTERING == "false") {
            return res.status(400).json({ message: "Registering is not allowed. Please contact the site administrator for more information." });
        }
        res.status(200).json({ message: "Registration is allowed." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal error" })
    }
})

module.exports = router;

