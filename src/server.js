const express = require('express');
const app = express();

app.use(express.json()); // För att hantera JSON-begäran

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const PORT = 5000; // Hårdkoda porten till 5000
app.listen(PORT, () => {
  console.log(`Server körs på port ${PORT}`);
});
