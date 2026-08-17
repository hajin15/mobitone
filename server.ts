import express from 'express';
import * as path from 'path';

const server = express();

const PORT = 3000;

const projectRoot = path.join(__dirname, '..');

server.use(express.static(projectRoot));

server.listen(PORT, () => {
  console.log(`🌐 MobiTone 서버 실행: http://localhost:${PORT}`);
});