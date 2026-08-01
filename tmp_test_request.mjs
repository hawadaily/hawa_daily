import http from 'http';

const req = http.request({ host: 'localhost', port: 3001, path: '/api/jobs', method: 'GET' }, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('STATUS', res.statusCode);
    console.log(data.slice(0, 2000));
  });
});
req.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
req.end();
