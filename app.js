const express = require("express");
const app = express();
const file = require("fs");
const MongoClient = require("mongodb").MongoClient;
const mongoClient = new MongoClient("mongodb://127.0.0.1:27017/");
const db = mongoClient.db("test");
const users = db.collection("users");
const doctors = db.collection("doctors");
const appointments=db.collection("appointments");
const urlencodedParser = express.urlencoded({extended: false});
const intervalID = setInterval(Notification, 1000);

let user;
let doctor;
let appointment;

app.get("/", function(request, response){
    response.sendfile(__dirname+ "/login.html" );
});
app.post("/", urlencodedParser, async function (request, response) {
    if(!request.body) return response.sendStatus(400);
    user = await users.findOne({id:`${request.body.id}`});
    if(user)response.redirect("/appointment");
    else {response.redirect("/");console.log("Такого пользователя не существует");}
});
app.get("/appointment", async function(request, response){
    if(!user)response.send("Ошибка входа");
    doctor = await doctors.distinct("name");
    response.render("appointment.hbs", {
        doctors: doctor
    });
});
app.post("/appointment",urlencodedParser, async function(request, response){
    if(!request.body) return response.sendStatus(400);
    let date=new Date(Date.parse(`${request.body.date}`));
    doctor = await doctors.findOne({name:`${request.body.name}`,slot:date});
    appointment=await appointments.findOne({id_User:user.id,name_Doctor:`${request.body.name}`,slot:date});
    if(doctor && !appointment){
        appointments.insertOne({id_User:user.id,name_Doctor:doctor.name,slot:date});
        doctors.deleteOne({name:doctor.name,slot:date})
        response.send("Запись прошла успешно!");
    }
    else {response.send("Запись не прошла");}
});
async function Notification(){
    if(user)
        appointment=await appointments.findOne({id_User:user.id});
    if(appointment){
            let date=appointment.slot;
            let now=new Date();
            if (date.getMinutes()==now.getMinutes()&&(date.getFullYear()==now.getFullYear())&& (Math.abs(date.getDate()-now.getDate())==1))
                console.log(   now.toLocaleDateString() + "| Привет " + user.name + "! Напоминаем, что вы записаны к " + appointment.name_Doctor + " завтра в " +date.toLocaleTimeString());
            else if((date.getHours()==(now.getHours()+5)) &&(date.getMinutes()==now.getMinutes())&&(date.getFullYear()==now.getFullYear())&& (date.getMonth()==now.getMonth())&&(date.getDay()==now.Day()))
                console.log(   now.toLocaleDateString() + "| Привет " + user.name + "! Вам через 2 часа к " + appointment.name_Doctor + " в " +date.toLocaleTimeString());
    }
}
app.listen(3000, ()=>console.log("Сервер запущен"));