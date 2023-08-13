const mongoose = require('mongoose')

const dbConnection = ()=> {
    mongoose
    .connect(process.env.DB_URI).then((conn)=> {
    console.log(`Database connected Successfully: ${conn.connection.host}`)
})
// .catch((err)=> {
//     console.log(`Error in Database ${err}`)
//     process.exit(1) ; 
// });
};
module.exports = dbConnection ;