#!/usr/bin/env node

/**
 * 결제 에러 처리 테스트 스크립트
 * 
 * 사용법:
 * 1. node test-payment-error.js
 * 2. 브라우저에서 http://localhost:3000/order?error=payment_failed&reason=테스트오류&status=400 접속
 */

const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/order') {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const error = url.searchParams.get('error');
    const reason = url.searchParams.get('reason');
    const status = url.searchParams.get('status');
    
    console.log('Payment error test:', { error, reason, status });
    
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>결제 에러 테스트</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1>결제 에러 테스트</h1>
        <p>에러: ${error}</p>
        <p>사유: ${reason}</p>
        <p>상태: ${status}</p>
        <script>
          console.log('Payment failed:', { error: '${error}', reason: '${reason}' });
        </script>
      </body>
      </html>
    `);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`결제 에러 테스트 서버가 http://localhost:${PORT}에서 실행 중입니다.`);
  console.log(`테스트 URL: http://localhost:${PORT}/order?error=payment_failed&reason=테스트오류&status=400`);
});

