const express = require('express');
const path = require('path'); // Модуль для корректной работы с путями.
const {v4} = require('uuid'); // Импортируем функцию генерации уникальных идентификаторов.

const app = express();  // Создание объекта приложения.

// Заглушка. Примитивная замена базы данных.
let CONTACTS = [
  {id: v4(), name: 'Владимир', value: '+7-912-145-20-30', marked: false}
];

// Добавляем middleware. 
// По умолчанию, объект request не умеет работать с json-строкой.
// В POST-методе потребуется работать с телом запроса в json-формате.
app.use(express.json());


// Создадим первый url/endpoint, по которому будем получать данные.
// Первый параметр route: '/api/contacts'.
app.get('/api/contacts', (req, res) => {
  // Искусственно выставил задержку, для тестирования компонента <loader />
  // В продакшен-версии убрать обёртку из setTimeout().
  setTimeout( res.status(200).json(CONTACTS), 1000);
});

app.post('/api/contacts', (req, res) => {
  // На реальных проектах, нужно реализовывать валидацию на стороне сервера.
  const contact = {...req.body, id: v4(), marked: false};
  CONTACTS.push(contact);
  res.status(201).json(contact);  // Код статуса 201 сообщает о создании экземпляра сущности.
});

// ':id' - динамический параметр.
app.delete('/api/contacts/:id', (req, res) => {
  CONTACTS = CONTACTS.filter( contact => contact.id !== req.params.id);
  res.status(200).json({message: 'Контакт был удалён.'});
});

// PUT-метод целиком обновляет экземпляр сущности.
app.put('/api/contacts/:id', (req, res) => {
  const idx = CONTACTS.findIndex( contact => contact.id === req.params.id);
  CONTACTS[idx] = req.body;
  // По умолчанию, в ответе на сетевой запрос для Express-сервера 
  // код статуса = 200, поэтому можно опускать вызов res.status(200).
  res.json(CONTACTS[idx]);
});

// OPTIONS-метод возвращает список доступных методов на сервере.
// HEAD-метод делает то же самое, что GET-метод, только без body.

// ВАЖНО: НИЖЕСЛЕДУЮЩИЙ БЛОК КОДА ДОЛЖЕН ИСПОЛНЯТЬСЯ ПОСЛЕДНИМ.

// Добавляем middleware для работы со статическими файлами.
// Учим наш Express сервер отдавать статические файлы из клиента.
// Обозначим папку client статической для того, чтобы корректно обрабатывались 
// относительные ссылки подключяемых ресурсов в файле index.html.
// Например, подключение скрипта из внешнего файла: src="frontend.js"
app.use(express.static(path.resolve(__dirname, 'client')));

// Обработчик GET-запросов по любым роутам.
// В callback - функции прописываем ответ, который будем отправлять.
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'index.html'));
});

// Запуск Express сервера.
app.listen(3000, () => console.log('Server has been started on port 3000...'));
