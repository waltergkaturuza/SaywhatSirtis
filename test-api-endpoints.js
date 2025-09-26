const https = require('https');
const http = require('http');

// Test API endpoints
async function testEndpoint(path, port = 3001) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: port,
            path: path,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // We'll need to add authentication headers in a real test
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`\n=== Testing ${path} ===`);
                console.log(`Status: ${res.statusCode}`);
                console.log(`Headers:`, res.headers);
                
                if (res.statusCode === 200) {
                    try {
                        const jsonData = JSON.parse(data);
                        console.log('Response type:', Array.isArray(jsonData) ? 'Array' : 'Object');
                        console.log('Response keys:', Object.keys(jsonData));
                        if (Array.isArray(jsonData)) {
                            console.log('Array length:', jsonData.length);
                            if (jsonData.length > 0) {
                                console.log('First item:', jsonData[0]);
                            }
                        } else {
                            console.log('Response structure:', jsonData);
                        }
                    } catch (e) {
                        console.log('Raw response:', data);
                    }
                } else {
                    console.log('Error response:', data);
                }
                
                resolve({
                    status: res.statusCode,
                    data: data
                });
            });
        });

        req.on('error', (err) => {
            console.error(`Error testing ${path}:`, err);
            reject(err);
        });

        req.end();
    });
}

async function runTests() {
    console.log('Testing API endpoints...');
    
    try {
        await testEndpoint('/api/users');
        await testEndpoint('/api/users?format=simple');
        await testEndpoint('/api/hr/departments');
        await testEndpoint('/api/projects');
    } catch (error) {
        console.error('Test failed:', error);
    }
}

runTests();