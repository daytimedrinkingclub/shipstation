const { loadTemplate, processTemplate, sendWelcomeEmail, sendProjectDeployedEmail, sendNotificationEmail } = require('./server/services/emailService');
require('dotenv').config();

// Change this to your test email
const testEmail = process.env.TEST_EMAIL;

async function testEmailService() {
  console.log('Testing Email Service...\n');

  if (!testEmail) {
    console.log('❌ TEST_EMAIL not found in .env file');
    return;
  }

  // Test 1: Load welcome template
  console.log('1. Testing template loading...');
  const welcomeTemplate = loadTemplate('welcome');
  if (welcomeTemplate) {
    console.log('✅ Welcome template loaded successfully');
  } else {
    console.log('❌ Failed to load welcome template');
  }

  // Test 2: Process template with variables
  console.log('\n2. Testing template processing...');
  const processedTemplate = processTemplate(welcomeTemplate, {
    userName: 'Test User',
    year: new Date().getFullYear()
  });

  if (processedTemplate.includes('Test User')) {
    console.log('✅ Template processing working correctly');
  } else {
    console.log('❌ Template processing failed');
  }

  // Test 3: Load project deployed template
  console.log('\n3. Testing project deployed template...');
  const deployedTemplate = loadTemplate('project-deployed');
  if (deployedTemplate) {
    console.log('✅ Project deployed template loaded successfully');
  } else {
    console.log('❌ Failed to load project deployed template');
  }

  // Test 4: Process project deployed template with screenshot
  console.log('\n4. Testing project deployed template with screenshot...');
  const projectUrl = 'https://shipstation.ai/site/-caro-SEv2MhEQ';
  const screenshotUrl = 'https://supabasekong-shipstation.badalhibadal.com/storage/v1/object/public/shipstation-websites/websites/-caro-SEv2MhEQ/screenshot.png';
  const processedDeployedTemplate = processTemplate(deployedTemplate, {
    userName: 'Test User',
    projectName: 'Test Project',
    projectUrl,
    screenshotUrl,
    year: new Date().getFullYear()
  });

  if (processedDeployedTemplate.includes(projectUrl) &&
    processedDeployedTemplate.includes(screenshotUrl)) {
    console.log('✅ Project deployed template processing working correctly');
  } else {
    console.log('❌ Project deployed template processing failed');
  }

  console.log('\n🎉 Email service test completed!');
  console.log('\nNote: To test actual email sending, ensure RESEND_API_KEY is set in your .env file');
}

// Run tests
testEmailService().then(async () => {
  // Test actual email sending if RESEND_API_KEY is available
  if (process.env.RESEND_API_KEY) {
    console.log('\n5. Testing actual email sending...');

    // Test welcome email
    console.log('\n   Testing welcome email...');
    try {
      const welcomeResult = await sendWelcomeEmail(testEmail);
      if (welcomeResult.success) {
        console.log('✅ Welcome email sent successfully');
      } else {
        console.log('❌ Welcome email failed:', welcomeResult.error);
      }
    } catch (error) {
      console.log('❌ Welcome email error:', error.message);
    }

    // Wait for 2 seconds before next test
    console.log('   Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test project deployed email
    console.log('\n   Testing project deployed email...');
    try {
      const projectUrl = 'https://shipstation.ai/site/-caro-SEv2MhEQ';
      const screenshotUrl = 'https://supabasekong-shipstation.badalhibadal.com/storage/v1/object/public/shipstation-websites/websites/-caro-SEv2MhEQ/screenshot.png';

      const deployedResult = await sendProjectDeployedEmail(
        testEmail,
        projectUrl,
        'Test User',
        screenshotUrl
      );

      if (deployedResult.success) {
        console.log('✅ Project deployed email sent successfully');
      } else {
        console.log('❌ Project deployed email failed:', deployedResult.error);
      }
    } catch (error) {
      console.log('❌ Project deployed email error:', error.message);
    }

    // Wait for 2 seconds before next test
    console.log('   Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test notification email
    console.log('\n   Testing notification email...');
    try {
      const notificationResult = await sendNotificationEmail(
        testEmail,
        'Test Notification',
        'This is a test notification message to verify the email service is working correctly.',
        'Test User'
      );

      if (notificationResult.success) {
        console.log('✅ Notification email sent successfully');
      } else {
        console.log('❌ Notification email failed:', notificationResult.error);
      }
    } catch (error) {
      console.log('❌ Notification email error:', error.message);
    }

    console.log('\n📧 Email sending tests completed!');
  } else {
    console.log('\n⚠️  RESEND_API_KEY not found - skipping actual email sending tests');
  }
}).catch(console.error);