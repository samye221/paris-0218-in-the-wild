const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const FileStore = require('session-file-store')(session)

const secret = 'something unbelievable'

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin) // Clever, not a good practise though..
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Allow-Credentials', 'true') // important
  next()
})

// Setup session handler
app.use(session({
  secret,
  saveUninitialized: true,
  resave: true,
  store: new FileStore({ secret }),
}))

// Users (hard coded here but consider it comes from database)
const users = [
  { login: 'bertrand', password: 'azerty123' },
  { login: 'martine', password: 'rosedamour' }
]

// Logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, { user: req.session.user, cookie: req.headers.cookie })
  next()
})

app.get('/', (req, res) => {
  const user = req.session.user || {}

  res.json(user)
})

app.post('/sign-in', (req, res, next) => {
  // does user exists ?
  const user = users.find(u => req.body.login === u.login)

  // Error handling
  if (!user) {
    return res.json({ error: 'User not found' })
  }

  if (user.password !== req.body.password) {
    return res.json({ error: 'Wrong password' })
  }

  // else, set the user into the session
  req.session.user = user

  res.json(user)
})

app.get('/sign-out', (req, res, next) => {
  req.session.user = {}

  res.json('ok')
})

app.use((err, req, res, next) => {
  if (err) {
    res.json({ message: err.message })
    console.error(err)
  }

  next(err)
})

app.listen(3232, () => console.log('started on port 3232'))
