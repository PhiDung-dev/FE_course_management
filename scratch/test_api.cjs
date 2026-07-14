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
    const loginRes = await request('/authentication/login', 'POST', { username: 'admin@gmail.com', password: 'admin123' });
    console.log('Login status:', loginRes.status);
    const loginData = JSON.parse(loginRes.data);
    const token = loginData.result.token;

    const paymentsRes = await request('/payments', 'GET', null, token);
    console.log('GET /payments status:', paymentsRes.status);
    const paymentsData = JSON.parse(paymentsRes.data);
    const payments = paymentsData.result || [];
    console.log('Payments count:', payments.length);
    console.log('Payments:', JSON.stringify(payments, null, 2));

    if (payments.length > 0) {
      const pid = payments[0].id;
      console.log('Deleting payment:', pid);
      const delRes = await request('/payments/' + pid, 'DELETE', null, token);
      console.log('DELETE status:', delRes.status);
      console.log('DELETE response:', delRes.data);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}
main();
