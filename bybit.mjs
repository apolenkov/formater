import dotenv from 'dotenv';

import { execute } from './scripts/bybit/execute.mjs';

dotenv.config();

execute('2024-11-01', '2025-05-01').then().catch(console.error);
