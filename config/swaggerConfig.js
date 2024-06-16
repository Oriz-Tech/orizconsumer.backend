const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Oriz Consumer backend API',
    description: 'Description'
  },
  host: 'localhost:3000',
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local server'
    },
    {
      url: 'https://oriz-consumer-backend.onrender.com',
      description: 'Production server'
    }
  ],
  consumes: ['application/json'],
  produces: ['application/json'],
  components:{
    schemas:{
      profileSchema:{
        $firstname:'',
        $lastname:'',
        $email:'',
        $password:'',
        $phonenumber:''
      },
      responseSchema:{
        data: {},
        $status: '', 
        $code: '', 
        $message:''
      }
    }
  }
};

const outputFile = './docs/swagger.json';
const routes = ['../routes/*.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);
