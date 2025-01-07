import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import {google} from 'googleapis';
import {readFileSync} from 'fs';
import {config} from "../config/config.mjs";

const OAuth2 = google.auth.OAuth2;
const baseTemplateSource = readFileSync('handlebars/baseTemplate.hbs', 'utf8');

const baseTemplate = handlebars.compile(baseTemplateSource);

const createTransporter = async () => {
    const oauth2Client = new OAuth2(
        config.email_client_id,
        config.email_client_secret,
        "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
        refresh_token: config.email_refresh_token
    });

    const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
            if (err) {
                reject();
            }
            resolve(token);
        });
    });

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: config.user,
            accessToken,
            clientId: config.email_client_id,
            clientSecret: config.email_client_secret,
            refreshToken: config.email_refresh_token
        }
    });

    return transporter;
};
// Define the sendEmail function
export const sendEmail = async (template, subject, data) => {
    try {
        // Read the specific template file
        const templateSource = readFileSync(template, 'utf8');
        // Compile the specific template
        const compiledTemplate = handlebars.compile(templateSource);
        // Generate the HTML for the email body
        const body = compiledTemplate(data);
        // Setup email data
        const mailOptions = {
            from: config.user,
            to: config.user,
            subject: subject,
            html: baseTemplate({subject: subject, body: body})
        };
        let emailTransporter = await createTransporter();
        const result = await emailTransporter.sendMail(mailOptions);
        // Send mail with the existing transport object
        console.log('Message sent: %s', result.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

