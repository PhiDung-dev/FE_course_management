const http = require('http');

async function testDelete() {
  // First login to get a token
  const loginData = JSON.stringify({ username: "admin@gmail.com", password: "admin123" });
  
  const loginOptions = {
    hostname: 'localhost',
    port: 8080,
    path: '/authentication/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  };
  
  const req = http.request(loginOptions, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      let token = null;
      try {
          const resp = JSON.parse(data);
          token = resp.result.token;
      } catch (e) {
          console.log("Login failed", data);
          return;
      }
      
      // Get ratings
      const getOptions = {
        hostname: 'localhost',
        port: 8080,
        path: '/ratings',
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
      };
      
      http.request(getOptions, getRes => {
        let getData = '';
        getRes.on('data', chunk => getData += chunk);
        getRes.on('end', () => {
          const ratings = JSON.parse(getData).result;
          if (ratings.length === 0) {
            console.log("No ratings found.");
            return;
          }
          const ratingId = ratings[0].id;
          console.log("Found rating to delete:", ratingId);
          
          // Delete rating
          const delOptions = {
            hostname: 'localhost',
            port: 8080,
            path: '/ratings/' + ratingId,
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
          };
          
          http.request(delOptions, delRes => {
            let delData = '';
            delRes.on('data', chunk => delData += chunk);
            delRes.on('end', () => {
              console.log("Delete response:", delRes.statusCode, delData);
            });
          }).end();
        });
      }).end();
    });
  });
  
  req.write(loginData);
  req.end();
}

testDelete();
