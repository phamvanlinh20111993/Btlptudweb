var express = require('express')
var app = express()
var router = express.Router()
var models = require('../models/user')
var models1 = require('../models/ban')
var session = require('express-session')
var md5 = require('md5')

//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
//tao random ma gui cho nguoi dung xac thuc tai khoan
function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 45; i++ )//ma xac thuc co ngau nhien 45 ki tu
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

router.route('/')//dieu huong khi nguoi dung go thieu url: khi nguoi dung go localhost:5555/user/-"/"
 .get(function(req, res){//thi tu dong dieu huong sang localhost:5555/user/logsg
 	//console.log(req.originalUrl)
 	if(req.originalUrl.toString() === "/user/")
 		res.redirect('logsg');
 	else 
 	    res.redirect('user/logsg');
})


router.route('/logsg')
.get(function(req, res)
{
	//tai khoan nguoi dung bi khoa
	//if(typeof Lock_user != 'undefined')
	//{
//		res.render("login_signup", {BanUser : JSON.parse(Lock_user)})
//		delete BanUser;
//		delete Lock_user;
//	}else{
		//console.log(req.cookies)
		var cookieN = req.cookies.CookieName;
		var cookieP = req.cookies.CookiePass;
		//console.log(cookieN)
	
		if(typeof cookieN === 'undefined'){
			res.render('login_signup')
		}else
		{//neu cookie da ton tai, bay gio can xem xet nguoi dung da dang xuat truoc do hay chua
	
			models.User.findOne({$and:[{'email': cookieN}, 
			{ 'password': md5(cookieP) }]})
			.exec(function(err, value)
			{
				if(err)
					throw err
				
				if(value.status_logout == 0)//nguoi dung chua tung dang xuat
				{
					//khoi tao phien lam viec
					req.session.name = value.username;
					req.session.password = cookieP;
					req.session.image = value.image;
					req.session.email = cookieN;
					req.session.age = value.age;
					req.session.chat_id = value._id
	
					if(value.role == "Admin_all"){//tai khoan admin manh nhat trong admin
						res.redirect('admin');
					}else{
						res.redirect('home');
					}
				}else
					res.render('login_signup',{email: cookieN, pass: cookieP})
					
			})
			
		}
	//}
}).post(function(req, res)
{
	//kiem tra email nguoi dung da dang ki hay chua:co the danh chi muc cho email
	//dia chi email nguoi dung bi khoa vinh vien
	
	if(typeof req.body.exist_email != 'undefined')
	{
		var Email_user = req.body.exist_email;
		
		models.User.findOne({'email' : Email_user}).
		exec(function(err, value){
			if(err){
		  	 	console.log(err);
			}else{
		   		if(value != null){
		  	   		res.send("10");
				}else{	
					//co mot so truong hop xay ra do la email nay bi cấm vĩnh viễn(admin xóa) trong app nay
					//hoac dia chi email nay chua duoc dang ki
					
					models1.Ban.findOne({ $and:[{'email' : Email_user},
					 { 'time': new Date("October 6, 1995 15:15:15").toISOString()} ]})
					//.sort({'time': 1})
					.exec(function(err, BanU){
						if(err)
							throw err
						
						if(BanU == null)//nguoi dùng không bị khóa tài khoản
							res.send("11");
						else 
							res.send("12");
					})
		   	   		
				}
			}
		})
		delete req.body.exist_email;
	}

	//gui ma email xac nhan nguoi dung sau khi kick nut signin
	if(typeof req.body.request_verify_code != 'undefined'){
		name = req.body.name
		email = req.body.email
		age = req.body.Age
		pass = req.body.pass
		const nodemailer = require('nodemailer')
		//var smtpTransport = require('nodemailer-smtp-transport')

		let transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {//tai khoan gmail chinh cua server
				user: 'duanwebptudweb@gmail.com',
				pass: 'DuAnWebPTUDWEB123',
			}
		});
        
		var Code = makeid();//tao ngau nhien 1 string
		//console.log(Code)
		User_enter_code = Code;

		if(parseInt(req.body.request_verify_code) == 0)//ma 0 tuong ung voi dang ki tai khoan
		{
			let mailOptions = {
				from: 'duanwebptudweb@gmail.com',
				to: email,//email nguoi dung
				subject: 'Ma xac thuc tai khoan dang ki',
				html: '<div><div><span style="font-size:140%;"><i>Chao mung ban da dang nhap vao he thong chat online cua chung toi!!!</i></span></div><div><p>Ma xac thuc tai khoan cua ban la: </p><b>'+Code+'</b></div></div>'
			}

			transporter.sendMail(mailOptions, (error, info)=>{
				if(error){
					console.log("Loi nay day: " + error)
					res.send("0. Loi dang ki.")
				}
				console.log('Message %s sent: %s', info.messageId, info.response)
			})
		}else // ma 1 hoac mã khác tương ứng với quên mật khẩu của người dùng
		{
			let mailOptions = {
				from: 'duanwebptudweb@gmail.com',
				to: email,//email nguoi dung
				subject: 'Mã xác thực tài khoản người dùng',
				html: '<div><div><span style="font-size:140%;"><i>Email của bạn đã được xác thực!!!</i></span></div><div><p>Ma xac nhan lai tai khoan cua ban la: </p><b>'+Code+'</b></div></div>'
			}

			transporter.sendMail(mailOptions, (error, info)=>{
				if(error){
					console.log("Loi nay day: " + error)
					res.send("1. Loi xac thuc lai tai khoan.")
				}
				console.log('Message %s sent: %s', info.messageId, info.response)
			})
		}
	}

	else if(typeof req.body.verificationcodes != 'undefined')//dang ki thanh cong
	{	
		//ma xac thuc la chinh xac
		if(req.body.verificationcodes.localeCompare(User_enter_code) == 0)
		{
			//luu tru thong tin nguoi dung
			var pass1 = md5(pass)
			var user_chat = new models.User({
				username: name,
				email: email,
				password: pass1,
				image: "/1.png",//anh mac dinh
				role: "User",
				age: age,
				status: 1 //trang thai online la 1 vi khi dang ki thanh cong nguoi dung se duoc dieu huong
				//thang sang trang home
			})

			//luu lai
			user_chat.save(function(err)
			{
                if(err){
                	console.log(err)
                }
				req.session.name = name;
				req.session.password = pass;
				req.session.image = "/1.png";//anh dai dien mac dinh cua he thong
				req.session.email = email;
				req.session.age = age;
                if(typeof code_err != 'undefined')
                	delete code_err;
			    delete User_enter_code, name, email, age, pass;//huy
			})

			//tao ma id chat cho nguoi dung
			setTimeout(//tao ham dong bo hàm này chạy sau hàm trên
			 function (){
				models.User.findOne({'email' : email, 'password': pass1}).
				exec(function(err, value)
				{
					if(err){
		  	 			console.log(err);
					}else{
		   				if(value != null){
		   					req.session.chat_id = value._id
		   					res.redirect('home')
		   				}
					}
				}) }, 400)//400 miliseconds run function
 			
		}else{
			res.render("login_signup", {code_err: 1});
		}
		
	}
})

module.exports = router;