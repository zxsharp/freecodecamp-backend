const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const usersRouter = require('./routes/usersRouter')
const connectToDb = require('./db/connectToDb')


app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


connectToDb();

app.use('/api/users', usersRouter);





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
