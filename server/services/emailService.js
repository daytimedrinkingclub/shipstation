const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Template loading function
function loadTemplate(templateName) {
  try {
    const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
    return fs.readFileSync(templatePath, 'utf8');
  } catch (error) {
    console.error(`Error loading template ${templateName}:`, error);
    return null;
  }
}

// Replace placeholders in template with actual values
function processTemplate(template, variables = {}) {
  let processedTemplate = template;

  const allVariables = {
    year: new Date().getFullYear(),
    platformName: 'ShipStation.ai',
    platformUrl: 'https://app.shipstation.ai/',
    supportEmail: 'support@shipstation.ai',
    githubUrl: 'https://github.com/daytimedrinkingclub/shipstation',
    discordUrl: 'https://discord.gg/wMNmcmq3SX',
    ...variables
  }

  Object.keys(allVariables).forEach(key => {
    const placeholder = `{{${key}}}`;
    processedTemplate = processedTemplate.replace(new RegExp(placeholder, 'g'), allVariables[key]);
  });

  return processedTemplate;
}

// Send email function
async function sendEmail({ to, subject, template, variables = {}, from = 'ShipStation.AI <hello@shipstation.ai>' }) {
  try {
    let htmlContent = '';

    if (template) {
      const templateContent = loadTemplate(template);
      if (!templateContent) {
        throw new Error(`Template ${template} not found`);
      }
      htmlContent = processTemplate(templateContent, variables);
    } else if (variables.html) {
      htmlContent = variables.html;
    } else {
      throw new Error('Either template or html content must be provided');
    }

    const emailData = {
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html: htmlContent,
    };

    // Add text version if provided
    if (variables.text) {
      emailData.text = variables.text;
    }

    const response = await resend.emails.send(emailData);

    console.log('Email sent successfully:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

// Welcome email
async function sendWelcomeEmail(userEmail, userName) {
  return await sendEmail({
    to: userEmail,
    subject: 'Welcome to ShipStation AI! 🚀',
    template: 'welcome',
    variables: {
      userName: userName || 'there',
    }
  });
}

// Project deployed notification
async function sendProjectDeployedEmail(userEmail, projectUrl, userName, screenshotUrl = null) {
  return await sendEmail({
    to: userEmail,
    subject: `🎉 Your website is live on ShipStation.AI!`,
    template: 'project-deployed',
    variables: {
      userName: userName || 'there',
      projectUrl,
      screenshotUrl: screenshotUrl || '',
    }
  });
}

// Generic notification email
async function sendNotificationEmail(userEmail, subject, message, userName) {
  return await sendEmail({
    to: userEmail,
    subject,
    template: 'notification',
    variables: {
      userName: userName || 'there',
      message,
    }
  });
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendProjectDeployedEmail,
  sendNotificationEmail,
  loadTemplate,
  processTemplate
}; 