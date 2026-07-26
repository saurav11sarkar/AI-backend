import { Resend } from 'resend';
import config from '../config';

const resend = new Resend(config.resend.apiKey);

const sendResendMailer = async (email: string, subject?: string, html?: string) => {
  const { data, error } = await resend.emails.send({
    from: config.resend.email_from || '',
    to: email,
    subject: subject || '',
    html: html || '',
  });

  if (error) {
    throw new Error(error.message);
  }

  console.log(data);
};

export default sendResendMailer;
