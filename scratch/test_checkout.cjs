const http = require('http');

function request(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: method,
      headers: headers
    }, res => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: resData }));
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function main() {
  try {
    // 1. Register a new account
    const accRes = await request('/accounts', 'POST', { username: 'teststudent@gmail.com', password: '123' });
    const accData = JSON.parse(accRes.data);
    console.log('Account Registration:', accData);

    let accountId;
    if (accData.code === 1000) {
      accountId = accData.result.id;
    } else {
      // maybe already exists, let's login
    }

    if (accountId) {
      const userRes = await request('/users', 'POST', {
        fullName: 'Test Student',
        email: 'teststudent@gmail.com',
        accountId: accountId
      });
      console.log('User Registration:', JSON.parse(userRes.data));
    }

    // 2. Login
    const loginRes = await request('/authentication/login', 'POST', { username: 'teststudent@gmail.com', password: '123' });
    const loginData = JSON.parse(loginRes.data);
    if (loginData.code !== 1000) {
      console.error('Login failed:', loginData);
      return;
    }
    const token = loginData.result.token;
    console.log('Login successful');

    // 3. Fetch active schedules
    const schedRes = await request('/schedules', 'GET', null, token);
    const schedules = JSON.parse(schedRes.data).result || [];
    if (schedules.length === 0) {
      console.log('No active schedules found');
      return;
    }
    const scheduleId = schedules[0].id;
    
    // Get user id
    const usersRes = await request('/users', 'GET', null, token);
    const users = JSON.parse(usersRes.data).result;
    const user = users.find(u => u.email === 'teststudent@gmail.com');

    // 4. Create Booking
    console.log('Creating booking for userId:', user.id);
    const bookRes = await request('/bookings', 'POST', {
      description: 'Test booking',
      scheduleId: scheduleId,
      userId: user.id
    }, token);
    const bookData = JSON.parse(bookRes.data);
    console.log('Booking response:', bookData);
    
    if (bookData.code !== 1000) return;
    const bookingId = bookData.result.id;

    // 5. Create Payment
    console.log('Creating payment for bookingId:', bookingId);
    const payRes = await request('/payments', 'POST', {
      bookingId: bookingId
    }, token);
    const payData = JSON.parse(payRes.data);
    console.log('Payment response:', payData);

    if (payData.code !== 1000) return;
    const paymentId = payData.result.id;

    // 6. Update Payment Status
    console.log('Updating payment status for paymentId:', paymentId);
    const updateRes = await request('/payments/' + paymentId, 'PUT', {
      status: 'SUCCESS'
    }, token);
    const updateData = JSON.parse(updateRes.data);
    console.log('Update payment response:', updateData);

  } catch (err) {
    console.error('Error:', err);
  }
}
main();
