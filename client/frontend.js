import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.6.11/dist/vue.esm.browser.js';

// Компонент индикатора загрузки. На основе вёрстки из Bootstrap.
//<div style="display: flex; justify-content: center; align-items: center;">
Vue.component('loader', {
  template: `    
    <div class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>    
  `
});

new Vue({
  el: '#app',
  data() {
    // Возращаем объект с моделями(сущностями) нашего приложения
    return {
      loading: false,
      form: {
        name: '',
        value: ''
      },
      contacts: [
        // Для тестирования клиента без сервера. Заглушка вместо данных из БД.
        // {id: 1, name: 'Владимир', value: '+7-912-145-20-30', marked: false}
      ]
    }
  },
  // Вычисляемые свойства на основе данных модели и значений пробрасываемых props
  computed: {
    // Испльзуем для валидации полей формы
    canCreate() {
      return this.form.value.trim() && this.form.name.trim()
    }
  },
  methods: {

    // // Начало. Временная заглушка, при работе с сервером закомментировать
    // createContact() {
    //   // Используем rest-оператор в деструктуризующем присваивании
    //   const {...contact} = this.form;
      
    //   this.contacts.push({...contact, id: Date.now(), marked: false});

    //   this.form.name = this.form.value = '';
    // },
    // markContact(id) {
    //   const contact = this.contacts.find( contact => contact.id === id );
    //   contact.marked = true;
    // },
    // removeContact(id) {
    //   this.contacts = this.contacts.filter( contact => contact.id !== id );
    // }
    // // Конец. Временная заглушка, при работе с сервером закомментировать

    async createContact() {
      const {...contact} = this.form;

      const newContact = await request('/api/contacts', 'POST', contact);

      this.contacts.push(newContact);

      this.form.name = this.form.value = '';
    },
    async removeContact(id) {
      // Сначала получаем подтверждение от сервера.
      await request(`/api/contacts/${id}`, 'DELETE');
      this.contacts = this.contacts.filter( contact => contact.id !== id );
    },
    async markContact(id) {
      const contact = this.contacts.find( contact => contact.id === id );
      const updated = await request(`/api/contacts/${id}`, 'PUT', {
        ...contact,
        marked: true  // Переписываем значение в поле marked
      });
      // Синхронизуем frontend с backend
      contact.marked = updated.marked;
    },
  },
  
  // Метод жизненного цикла Vue-компонента
  async mounted() {
    // Часть url: 'http://localhost:3000/' можно опустить потому, 
    // что сервер и клиент итак на одном порте и хосте.
    // Поэтому используем символ '/' вместо 'http://localhost:3000/'.
    // По соглашению в REST API: 
    // первый сегмент url = 'api', этот префикс указывает на работу с api;
    // второй сегмент url = 'contacts' - указывает на модель/сущность.

    // Для отладки
    // const data = await request('/api/contacts');
    // console.log(data);

    this.loading = true;
    this.contacts = await request('/api/contacts');
    this.loading = false;
  }
});

async function request(url, method = 'GET', data = null) {
  try {
    // Заголовки - это часть http-запросов. 
    // В частности используются в POST-запросах.
    // Метаданные, говорящие о том, что с этим запросом происходит.
    const headers = {};
    let body;

    if (data) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(data); // Сериализуем js-объект в json-строку
    }

    const response = await fetch(url, {
      method,
      headers,
      body
    });
    return await response.json(); // Вслед за заголовками(и статус кодами), получаем тело ответа
  } catch (e) {
    console.warn('Error:', e.message);
  }
}