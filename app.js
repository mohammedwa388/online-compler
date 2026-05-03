const fs = require('fs');
const express = require('express');

const app = express();

app.use(express.json()); //برنامج وسيط - madel wear -[برمجيات وسيطه]
// app.get('/', (req, res) => {
//   res.status(200).json({
//     message: 'Hello mohamed waly from the server side',
//     app: `online compuler`,
//   });
// }); // get عنوان url

// app.post('/', (req, res) => {
//   res.status(200).json();
// });
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/user.json`),
);

app.get(`/api/v1/compiler`, (req, res) => {
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

app.get(`/api/v1/compiler/:id`, (req, res) => {
  console.log(req.params);

  const id = req.params.id * 1;
  const login = users.find((el) => el.id === id);

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid Id',
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      login,
    },
  });
});
// console.log(Array.isArray(compiler)); // لازم true
// console.log(compiler);
// console.log(typeof compiler);

app.post(`/api/v1/compiler`, (req, res) => {
  //   console.log(req.body);
  //   console.log(req.body);
  const newId = users[users.length - 1].id + 1;
  const newUser = Object.assign({ id: newId }, req.body); //req.body.id ==newId
  users.push(newUser);
  fs.writeFile(
    `${__dirname}/dev-data/data/user.json`,
    JSON.stringify(users),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          users: newUser,
        },
      });
    },
  );
});

app.patch(`/api/v1/compiler/:id`, (req, res) => {
  if (req.params.id * 1 > users.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid Id',
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      login: '<Updated tour here...>',
    },
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`App running on ${port}...`);
});
