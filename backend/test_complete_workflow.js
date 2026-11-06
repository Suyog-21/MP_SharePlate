const fs = require('fs');
const path = require('path');
const http = require('http');

async function runTests() {
  console.log('=== STARTING END-TO-END WORKFLOW INTEGRATION TEST ===\n');

  const BASE_URL = 'http://localhost:5000/api';
  let adminCookie = '';
  let donorCookie = '';
  let ngoCookie = '';

  // Helper fetch with cookie handling
  const request = async (url, options = {}, cookie = '') => {
    const headers = options.headers || {};
    if (cookie) headers['Cookie'] = cookie;
    const res = await fetch(`${BASE_URL}${url}`, { ...options, headers });
    const setCookie = res.headers.get('set-cookie');
    let data;
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }
    return { status: res.status, data, cookie: setCookie || cookie };
  };

  // 1. Admin Login
  console.log('--- Test 1: Admin Login ---');
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@shareplate.org', password: 'Admin@12345' }),
  });
  console.log(`Status: ${adminLogin.status}, Role: ${adminLogin.data?.role}`);
  if (adminLogin.status !== 200 || adminLogin.data?.role !== 'admin') {
    throw new Error('Admin login failed');
  }
  adminCookie = adminLogin.cookie;
  console.log('✓ Admin login successful\n');

  // 2. Food Donor Registration with OTP
  console.log('--- Test 2: Food Donor OTP & Registration ---');
  const donorEmail = `donor_${Date.now()}@example.com`;
  const otpRes = await request('/auth/send-donor-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: donorEmail }),
  });
  console.log(`OTP Send Status: ${otpRes.status}, Message: ${otpRes.data?.message}`);

  // Fetch OTP directly from MongoDB model for testing
  const OTP = require('./models/OTP');
  const otpDoc = await OTP.findOne({ email: donorEmail, purpose: 'donor_registration' });
  if (!otpDoc) throw new Error('OTP not saved in MongoDB');
  console.log(`Retrieved OTP for testing: ${otpDoc.otp}`);

  const registerDonorRes = await request('/auth/register-donor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Spice Garden Kitchen',
      email: donorEmail,
      otp: otpDoc.otp,
      phone: '+91 9876501234',
      password: 'DonorPassword123',
      address: 'Shop 14, High Street',
      city: 'Pune',
      pincode: '411001',
    }),
  });
  console.log(`Donor Register Status: ${registerDonorRes.status}, User: ${registerDonorRes.data?.name}`);
  if (registerDonorRes.status !== 201) throw new Error('Donor registration failed');
  donorCookie = registerDonorRes.cookie;
  console.log('✓ Food Donor registered & session established\n');

  // 3. NGO Application Submission (Option B)
  console.log('--- Test 3: NGO Application Submission (Option B) ---');
  const ngoEmail = `ngo_${Date.now()}@charity.org`;
  const sampleDocPath = path.join(__dirname, 'sample_test_doc.txt');
  fs.writeFileSync(sampleDocPath, 'Sample legal verification document content');

  // Create multipart boundary manually for test
  const boundary = '----WebKitFormBoundaryTest' + Math.random().toString(36).substring(2);
  const buildMultipart = (fields, files) => {
    let body = '';
    for (const [key, val] of Object.entries(fields)) {
      body += `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${val}\r\n`;
    }
    for (const [key, file] of Object.entries(files)) {
      body += `--${boundary}\r\nContent-Disposition: form-data; name="${key}"; filename="${file.name}"\r\nContent-Type: application/pdf\r\n\r\n${file.content}\r\n`;
    }
    body += `--${boundary}--\r\n`;
    return body;
  };

  const multipartBody = buildMultipart(
    {
      name: 'Asha Food Relief Trust',
      ngoType: 'Trust',
      yearEstablished: '2018',
      registrationNumber: 'TR/PUN/2018/5432',
      panNumber: 'AABTA1234K',
      darpanId: 'MH/2019/0012345',
      website: 'https://asharelieftrust.org',
      officialEmail: ngoEmail,
      contactNumber: '+91 9988776655',
      alternateContactNumber: '+91 9988776650',
      address: '77 Seva Road, Camp',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      repName: 'Anil Kulkarni',
      repDesignation: 'Executive Trustee',
      repContact: '+91 9988776655',
      repEmail: 'anil@asharelieftrust.org',
    },
    {
      registrationCertificate: { name: 'reg_cert.pdf', content: 'PDF Dummy Certificate' },
      panCard: { name: 'pan_card.pdf', content: 'PDF Dummy PAN' },
      addressProof: { name: 'address_proof.pdf', content: 'PDF Dummy Address' },
    }
  );

  const applyRes = await fetch(`${BASE_URL}/ngo/apply`, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
    body: multipartBody,
  });
  const applyData = await applyRes.json();
  console.log(`Apply Status: ${applyRes.status}, Reference ID: ${applyData.applicationReferenceId}`);
  if (applyRes.status !== 201 || !applyData.applicationReferenceId) {
    throw new Error('NGO Application submission failed');
  }
  const appRefId = applyData.applicationReferenceId;
  console.log('✓ NGO verification application submitted with PENDING status\n');

  // 4. Admin inspects NGO applications & verifies application exists
  console.log('--- Test 4: Admin Views NGO Verification Requests ---');
  const adminApps = await request('/admin/ngo/applications?status=ALL', {}, adminCookie);
  const foundApp = adminApps.data?.applications?.find((a) => a.applicationReferenceId === appRefId);
  if (!foundApp) throw new Error('Submitted NGO application not found in Admin dashboard list');
  console.log(`Found application: ${foundApp.name}, Status: ${foundApp.status}`);

  // 5. Admin marks status as UNDER_REVIEW
  console.log('--- Test 5: Admin Marks Application UNDER_REVIEW ---');
  const reviewRes = await request(`/admin/ngo/applications/${foundApp._id}/under-review`, { method: 'PATCH' }, adminCookie);
  console.log(`Status update: ${reviewRes.data?.application?.status}`);
  if (reviewRes.data?.application?.status !== 'UNDER_REVIEW') throw new Error('Status update to UNDER_REVIEW failed');

  // 6. Admin Approves NGO Application
  console.log('--- Test 6: Admin Approves NGO Application ---');
  const approveRes = await request(`/admin/ngo/applications/${foundApp._id}/approve`, { method: 'POST' }, adminCookie);
  console.log(`Approval Status: ${approveRes.status}`);
  const approvedNgo = approveRes.data?.application;
  console.log(`Generated Registration ID: ${approvedNgo?.registrationId}`);
  console.log(`isRegistrationIdUsed: ${approvedNgo?.isRegistrationIdUsed}`);
  if (approvedNgo?.status !== 'VERIFIED' || !approvedNgo?.registrationId || approvedNgo?.isRegistrationIdUsed !== false) {
    throw new Error('NGO Approval or Registration ID generation failed');
  }
  const regId = approvedNgo.registrationId;
  console.log('✓ NGO Application approved & Registration ID generated\n');

  // 7. NGO Requests Activation OTP (Option A)
  console.log('--- Test 7: NGO Requests Activation OTP via Registration ID (Option A) ---');
  const otpReq = await request('/ngo/request-activation-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ registrationId: regId }),
  });
  console.log(`OTP Request Status: ${otpReq.status}, Masked Email: ${otpReq.data?.maskedEmail}`);
  if (otpReq.status !== 200) throw new Error('Activation OTP request failed');

  const actOtpDoc = await OTP.findOne({ email: ngoEmail, purpose: 'ngo_activation' });
  if (!actOtpDoc) throw new Error('Activation OTP not found in DB');
  console.log(`Activation OTP retrieved: ${actOtpDoc.otp}`);

  // 8. NGO Completes Account Activation
  console.log('--- Test 8: NGO Completes Account Activation ---');
  const activateRes = await request('/ngo/activate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      registrationId: regId,
      email: ngoEmail,
      otp: actOtpDoc.otp,
      password: 'NGOPassword123',
      confirmPassword: 'NGOPassword123',
    }),
  });
  console.log(`Activation Status: ${activateRes.status}, User Role: ${activateRes.data?.user?.role}`);
  if (activateRes.status !== 200 || activateRes.data?.user?.role !== 'ngo') {
    throw new Error('NGO Activation failed');
  }
  console.log('✓ NGO account activated successfully & session established\n');

  // 9. Verify Registration ID cannot be reused
  console.log('--- Test 9: Prevention of Registration ID Reuse ---');
  const reuseRes = await request('/ngo/request-activation-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ registrationId: regId }),
  });
  console.log(`Reuse Attempt Status: ${reuseRes.status}, Error: ${reuseRes.data?.error}`);
  if (reuseRes.status !== 400) throw new Error('Expected 400 on reused Registration ID');
  console.log('✓ Registration ID reuse successfully prevented\n');

  // 10. NGO Login with Email and Password
  console.log('--- Test 10: NGO Login with Email and Password ---');
  const ngoLogin = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ngoEmail, password: 'NGOPassword123' }),
  });
  console.log(`NGO Login Status: ${ngoLogin.status}, Name: ${ngoLogin.data?.name}, Role: ${ngoLogin.data?.role}`);
  if (ngoLogin.status !== 200 || ngoLogin.data?.role !== 'ngo') {
    throw new Error('NGO login failed');
  }
  ngoCookie = ngoLogin.cookie;
  console.log('✓ NGO login successful with VERIFIED access\n');

  // Clean up test file
  if (fs.existsSync(sampleDocPath)) fs.unlinkSync(sampleDocPath);

  console.log('====================================================');
  console.log('🎉 ALL 10 END-TO-END WORKFLOW TESTS PASSED 100%!');
  console.log('====================================================\n');
}

module.exports = runTests;

if (require.main === module) {
  const connectMongoDB = require('./db/mongodb');
  connectMongoDB().then(() => {
    runTests()
      .then(() => process.exit(0))
      .catch((err) => {
        console.error('Test Suite Failed:', err);
        process.exit(1);
      });
  });
}
