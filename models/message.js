var mogoose = require('mogoose')
var Schema = mongoose.Schema

var messgage = new Schema({
	id_user_A: String,//ma nguoi dung 1
	id_user_B: String,//ma nguoi dung 2
	code_send_receiver: Number,//mã 1 đại diện cho nguoi gui, ma  0 đại diện nguoi nhan lay id_user_A la moc
	//giả sử A nhắn tin cho B, nếu A nhắn cho B thì code_send_receive là 1 ngược lại là 0(B là người gửi)
	content: String,// noi dung tin nhan
	created_at: Date,
	updated_at: Date
})

messgage.pre('save', function(next){
	var crrD = new Date().toISOString()
	this.updated_at = crrD
	if(!this.created_at){
		this.created_at = crrD;
		next()
	}
}

var Messgage = mogoose.model('Messgage', messgage)

module.exports ={
	Messgage : Messgage
}

