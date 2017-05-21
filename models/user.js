//collection user
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var user = new Schema({
	username: String,//ten nguoi dung
	email: String,
	password: String,
	image: String, //Anh dai dien
	age: Number,//tuoi
	status: Number,//trang thai on hay off của nguoi dung
	sex: Number,//gioi tinh 0 la nam, 1 la nu
	hobies: String, //so thich
	warning: Number, //số lần bị người khác cảnh cáo, neu so lan canh cao lon hon 30 thi bi block 1 ngay 
	created_at: Date,
	updated_at: Date
})

user.pre('save', function(next){
	var crrD = new Date().toISOString()
	this.updated_at = crrD
	if(!this.created_at){
		this.created_at = crrD;
		next()
	}
})

var User = mongoose.model('User', user)

module.exports ={
	User   : User
}

