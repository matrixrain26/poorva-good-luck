// Script to create a new JSONBin for storing messages
// Run this script with: node scripts/createJsonBin.js

// Node.js doesn't have fetch by default, so we need to use https module
const https = require('https');

const API_KEY = '$2a$10$Yd0Ql9Ot4Nh3Oc9Tn.Ij4.Oe9Yx6Oi7JE9D7KPmqkZXQVLm5ZDPu'; // Your JSONBin API key

function createJsonBin() {
  const data = JSON.stringify({
    messages: []
  });

  const options = {
    hostname: 'api.jsonbin.io',
    port: 443,
    path: '/v3/b',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'X-Master-Key': API_KEY,
      'X-Bin-Private': 'false',
      'X-Bin-Name': 'poorva-farewell-messages'
    }
  };

  const req = https.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const parsedData = JSON.parse(responseData);
        console.log('JSONBin created successfully!');
        console.log('Bin ID:', parsedData.metadata.id);
        console.log('');
        console.log('IMPORTANT: Update the BIN_ID in src/utils/jsonBinApi.ts with this value:');
        console.log(parsedData.metadata.id);
      } else {
        console.error(`Failed to create JSONBin: ${res.statusCode}`);
        console.error(responseData);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error creating JSONBin:', error);
  });

  req.write(data);
  req.end();
}

createJsonBin();
