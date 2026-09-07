require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Festa Festum backend jalan di http://localhost:${PORT}`);
});
