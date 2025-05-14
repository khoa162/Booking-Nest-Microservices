const mongoose = require('mongoose');

// const uri = 'mongodb://concert_user:concert_pass@localhost:27017/auth_db?authSource=admin';
// const uri = 'mongodb://localhost:27017/auth_db?authSource=admin';
const uri = 'mongodb://concert_user:concert_pass@localhost:27017/booking_db?authSource=admin'
console.log(uri)
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ CONNECTED OK');
  process.exit(0);
})
.catch(err => {
  console.error('❌ CONNECT FAILED', err);
  process.exit(1);
});