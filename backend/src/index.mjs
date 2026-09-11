import { createServer } from 'node:http';
import { createApp } from './app.mjs';

const port = Number(process.env.PORT || 3000);
const server = createServer(createApp());
server.listen(port, process.env.HOST || '0.0.0.0', () => {
  console.log(`Backend disponible en el puerto ${port}`);
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
  });
}
