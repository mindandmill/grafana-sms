const express = require('express');
const morgan = require('morgan');
const Brevo = require('@getbrevo/brevo');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => res.send('It\'s working!'));
app.post('/send-sms', async (req, res) => {
    try {
        Brevo.ApiClient.instance.authentications['api-key'].apiKey = req.query.apiKey;
        
        const sendTransacSms = new Brevo.SendTransacSms();
        sendTransacSms.sender = 'PinnacleSMS';
        sendTransacSms.recipient = req.query.number;
        sendTransacSms.content = JSON.parse(req.body.message).content;
    
        await new Brevo.TransactionalSMSApi().sendTransacSms(sendTransacSms);
    
        res.status(201).send();
    } catch (e) {
        res.status(500).json(e);

        const errorPath = path.resolve(__dirname, 'error.log');

        if (!fs.existsSync(errorPath)) fs.writeFileSync(errorPath, '');

        fs.appendFileSync(errorPath, `Message: ${e?.message}` + '\n');
        fs.appendFileSync(errorPath, `Error: ${JSON.stringify(e)}` + '\n');
    }
});

const port = process.env.PORT || 32012;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});