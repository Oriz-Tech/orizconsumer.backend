const express = require('express'); 
require('dotenv/config'); 
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger-output.json')
const bodyParser = require('body-parser')
const initDatabasePool = require('./db/indexDb.js')
  
const onboardingRoutes = require('./routes/onboardingRoute.js'); 
  
const app = express(); 
const PORT = process.env.PORT;
  

//middlewares
app.use(bodyParser.json())
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile))


app.use('/', onboardingRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});


app.listen(PORT, (error) =>{ 
    if(!error) 
        console.log(`Server is running on http://localhost:${PORT}`) 
    else 
        console.log("Error occurred, server can't start", error); 
    } 
);  
