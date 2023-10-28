const mongoose = require("mongoose");
class database{
    constructor() {
        this.db_connect()
    }
    async db_connect() {
        try {
            this.database = await mongoose.connect("mongodb://127.0.0.1:27017/UsersKailash", {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log("database connect seccuessfully");
        } catch (error) {
            console.log("error connect database");
        }
    }
}
module.exports = new database();