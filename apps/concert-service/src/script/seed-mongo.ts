import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const ObjectId = mongoose.Types.ObjectId;

const MONGO_URL = 'mongodb://concert_user:concert_pass@localhost:27017/concert_db?authSource=admin';

const concert1Id = new ObjectId();
const concert2Id = new ObjectId();

const seatTypes = [
  { _id: new ObjectId(), name: 'VIP', price: 200 },
  { _id: new ObjectId(), name: 'Regular', price: 100 },
  { _id: new ObjectId(), name: 'Economy', price: 50 },
];

const concerts = [
  {
    _id: concert1Id,
    name: 'Rock Festival 2025',
    description: 'Biggest rock concert of the year',
    start_time: '19:00',
    end_time: '22:00',
    seat_types: seatTypes,
  },
  {
    _id: concert2Id,
    name: 'Jazz Night 2025',
    description: 'Smooth jazz evening',
    start_time: '18:00',
    end_time: '21:00',
    seat_types: seatTypes,
  },
];

// generate 24 seats (12 per concert, 4 seats per type)
function generateSeats(concertId: mongoose.Types.ObjectId) {
  const seats = [];
  for (const type of seatTypes) {
    for (let i = 1; i <= 4; i++) {
      seats.push({
        _id: new ObjectId(),
        concert_id: concertId,
        seat_type_id: type._id,
        seat_number: `${type.name[0]}${i}`, // e.g., V1, R2, E3
        is_booked: false
      });
    }
  }
  return seats;
}

async function seed() {
  await mongoose.connect(MONGO_URL);
  console.log('✅ Connected to MongoDB');

  const db = mongoose.connection.db;

  const Concert = db.collection('concerts');
  const Seat = db.collection('seats');

  await Concert.deleteMany({});
  await Seat.deleteMany({});

  await Concert.insertMany(concerts);

  const seats = [
    ...generateSeats(concert1Id),
    ...generateSeats(concert2Id),
  ];

  await Seat.insertMany(seats);

  console.log('✅ Seeded concerts, seat types, and seats');
  await mongoose.disconnect();
}

seed();