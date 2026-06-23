import { createServer } from './interfaces/http/server.js';
import { env } from './shared/config/env.js';

const app = createServer();

app.listen(env.PORT, () => {
  console.log(`FastKote API ejecutándose en http://localhost:${env.PORT}/api`);
});
