const express = require ('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(express())

app.get('/', (req, res) => {
    res.send('Hello World!')
  })

app.listen(port,()=>{
    console.log('Server is running ', port);
})