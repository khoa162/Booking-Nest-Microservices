import { createClient } from 'redis';

async function seed() {
  const client = createClient({ url: 'redis://localhost:6379' });
  await client.connect();

  const baseConcertId = '64fb3cd8d1f4a2e0ab123';
  const baseSeatTypeId = '74ac8e2f6b1c3d09ef123';

  for (let i = 1; i <= 20; i++) {
    const concertId = baseConcertId + (100 + i).toString().slice(1);
    const seatTypeId = baseSeatTypeId + (200 + i).toString().slice(1);
    const seatKey = `concert:${concertId}:seat:${seatTypeId}:stock`;

    await client.set(seatKey, 10);
    console.log(`[SEED] ${seatKey} = 10`);
  }

  await client.quit();
  console.log('[DONE] Seeded 20 seat stock keys');
}

seed();