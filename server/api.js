import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import client from './connection.js';
import cors from 'cors';
import fileUpload from 'express-fileupload'
import { v4 as uuidv4 } from 'uuid';
import path from 'path'

const __dirname = import.meta.dirname;

const app = express();
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Sever is now listening at port ${port}`);
})

client.connect();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(fileUpload({}))


app.post('/register', async (req, res) => {

  try {
    const { email, password, name } = req.body;
    console.log(email, password, name);

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await client.query(
      'INSERT INTO "usersDB" (email, password, name) VALUES ($1, $2, $3) RETURNING *',
      [email, hashedPassword, name]
    );

    console.log(result);

    if (result.rows.length > 0) {
      res.status(201).json(result.rows[0]);
    } else {
      res.status(400).send('No data returned from the database');
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error')
  }
})

app.post('/login', async (req, res) => {

  try {
    const { email, password } = req.body;
    const result = await client.query('SELECT * FROM "usersDB" WHERE email = $1', [email])

    const user = result.rows[0]

    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" })
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)

    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid Credentials" })
    }

    const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, {
      expiresIn: '1m'
    })
    res.json({ token })
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error')
  }
})


app.get('/users', (req, res) => {
  client.query(`Select * from users`, (err, result) => {
    if (!err) {
      res.send(result.rows);
    }
  });
  client.end;
})


app.get('/users/:id', (req, res) => {
  client.query(`Select * from users where id=${req.params.id}`, (err, result) => {
    if (!err) {
      res.send(result.rows);
    }
  });
  client.end;
})


app.post('/users', (req, res) => {
  const user = req.body;

  let insertQuery = `insert into users(id, first_name, last_name, location)
                    values(${user.id}, '${user['first_name']}', '${user['last_name']}', '${user.location}')`

  client.query(insertQuery, (err, result) => {
    if (!err) {
      res.send('Insertion was successful')
    }
    else { console.log(err.message) }
  })
  client.end;
})


app.put('/users', (req, res) => {
  let user = req.body;
  console.log(user.id);

  let updateQuery = `update users
                    set first_name = '${user['first_name']}',
                    last_name = '${user['last_name']}',
                    location = '${user.location}'
                    where id = ${user.id}`

  client.query(updateQuery, (err, result) => {
    if (!err) {
      res.send('Update was successful')
    }
    else { console.log(err.message) }
  })
  client.end;
})

app.delete('/users/:id', (req, res) => {
  let insertQuery = `delete from users where id=${req.params.id}`

  client.query(insertQuery, (err, result) => {
    if (!err) {
      res.send('Deletion was successful')
    }
    else { console.log(err.message) }
  })
  client.end;
})


app.post('/posts', (req, res) => {
  const { title, description } = req.body;
  const { img } = req.files
  let fileName = uuidv4() + '.jpg'

  img.mv(path.resolve(__dirname, '..', 'server/static', fileName))

  let insertQuery = `INSERT INTO posts(title, img, description) VALUES($1, $2, $3)`;
  client.query(insertQuery, [title, fileName, description], (err, result) => {
    if (err) {
      console.error('Error on add to bd :', err);
      return res.status(500).send('Error on add to bd');
    }
  })
  res.send('Post was successfully created!');

  client.end;
})
