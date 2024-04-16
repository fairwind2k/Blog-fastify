import build from '../src/index.js';

const app = await build();
app.listen({ port: 3000, host: '0.0.0.0' });