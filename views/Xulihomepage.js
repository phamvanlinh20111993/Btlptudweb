
              function TypeofFile(val)
              {
                var type = val.slice((Math.max(0, val.lastIndexOf(".")) || Infinity) + 1);//lay kieu file vi du helo.jpg se lay duoi file la jpg hoac neu file la abc.adf.acc lay duoc duoi file la acc
                switch(type.toString().toLowerCase())
                {
                  case "jpg":
                  case "gif": 
                  case "bmp": 
                  case "png": 
                  case "jpeg": 
                  return true;
                }
                      
                return false;
              }

              var Image_upload_div = document.getElementsByClassName("chat-box-new-div")
              var Image_form_in_div = Image_upload_div[0].getElementsByClassName("panel-body chat-box-new")
              var Form_image = Image_form_in_div[0].getElementsByTagName("form")
              var Input_button_form_submit = Form_image[0].getElementsByTagName("input")
              var Div_Body_Scroll = document.getElementsByClassName("panel-body chat-box-main")
              var Event_user_typing = document.getElementById("nhapbanphim")

              //chon file de upload anh dai dien
              Input_button_form_submit[1].addEventListener("click", function(){
                if(Input_button_form_submit[0].value == ""){
                  alert("Please choose only a file to upload.")
                }
                else{
                  if(TypeofFile(Input_button_form_submit[0].value) != true){
                    alert("File upload must be image format.Ex: jpeg, png, bmp,...")
                    location.reload()
                  }else{
                    Form_image[0].submit()
                  }
                }
                    
              })

              //ham cat gia tri de xem tin nhan co gui loi hay khong
              function Cutstring(String)
              {
                  var Length = String.length;
                  return String.substring(Length - 5, Length)
              }

              var Div_infor_user_on = document.getElementsByClassName("chat-box-online-div")
              var Sub_div_infor_user_on0 = Div_infor_user_on[0].getElementsByClassName("chat-box-online-head")
              var Sub_div_infor_user_on = Div_infor_user_on[0].getElementsByClassName("panel-body chat-box-online")
              var Status_user_div = Sub_div_infor_user_on[0].getElementsByClassName("chat-box-online-left")

              //ham ve lai so nguoi dung da on hay off
              function Status_user(data, Value)
              {
                  var Length = Status_user_div.length; 
                  for(var index = 0; index < Length; index++){
                    var inputhidden = Status_user_div[index].getElementsByTagName('input');
                    if(inputhidden[0].value.localeCompare(data) == 0){
                      var tagp = Status_user_div[index].getElementsByTagName('p');
                      tagp[0].innerHTML = Value;
                      //alert(Value)
                    }
                  }
              }


                var socket = io.connect('http://127.0.0.1:5556');
                socket.on('connect', function(data) {
                   //ban dau la khi nguoi dung ket noi         
                   socket.emit('online', yemail);//client bao voi server la t online roi
                });

                //kiem tra nguoi dung co online hay khong
                socket.on('offline', function(data) 
                  {//neu co ai do offline server gui xuong client dia chi email co kem theo ma 55555
                  if(Cutstring(data) != "55555")   Status_user(data, "On");
                  else{
                    data = data.substring(0, data.length - 5)
                    Status_user(data, "Off"); 
                  }                            
                   
                });

                //so luong nguoi dang online
                socket.on('useronline', function(data) {
                  if(parseInt(data)  >  1)
                      Sub_div_infor_user_on0[0].innerHTML =  "ONLINE USERS ("+(parseInt(data) - 1)+")";
                  else Sub_div_infor_user_on0[0].innerHTML =  "ONLINE USERS (0)";
                });

        
              //ham bieu dien nguoi dung tren trang web
              //Load noi dung tin nhan tu server
              var Partner_id = "";
              //Khi nguoi dung kick vao bat ki nguoi dung trong danh sach online khac thi mau tren ten cua nguoi
              //dung do bi thay doi 
              function Chat(th, id)
              {
                var ind, Span_status_user_div, H5_status_user_div;
                //phuc hoi mau ve trang thi binh thuong
                for(ind = 0; ind < Status_user_div.length; ind++){
                  Span_status_user_div = Status_user_div[ind].getElementsByTagName("span")
                  H5_status_user_div = Status_user_div[ind].getElementsByTagName("h5")
                  Span_status_user_div[0].style.color = "#03DB2F";
                  H5_status_user_div[0].innerHTML = "";//nhan duoc thong bao thi tat di
                }
                th.style.color = "red";//doi mau tai vi tri kick
                var themid = document.getElementById(id).value;
                Partner_id = themid;//ma id cua doi phuong
                Load_message(yid, themid)
                Event_user_typing.style.display = "none"
              }

              //xet gia tri id cho nguoi dung
              var pos = 0;
              function User_in_app(image, name, email, age, id, status)
              {
                var Content = "";
                Content += '<div class="chat-box-online-left">';
                Content += '<img src="'+image+'" alt="bootstrap Chat box user image" class="img-circle" data-toggle="tooltip" data-placement="right" title="'+age+'" tuổi/>';
                if(pos == 0){
                  Partner_id = id;//mac dinh id nhan tin la nguoi dau tien trong danh sach
                  //thay doi the span mac dinh la do la nguoi mac dinh se nhan tin
                  Content +=  '<span data-toggle="tooltip" data-placement="right" title="'+email+'" style= "cursor: pointer;color:red;" onclick="Chat(this,'+pos+')"> - ' + name + '</span>' + '  .';
                }else{
                  Content +=  '<span data-toggle="tooltip" data-placement="right" title="'+email+'" style= "cursor: pointer;" onclick="Chat(this,'+pos+')"> - ' + name + '</span>' + '  .';
                }
                if(status == 1) Content += '<p>On</p><h5></h5>';
                else            Content += '<p>Off</p><h5></h5>';
                  
                Content +=  '<br />';
                Content +=  '( <small>Active from 3 hours</small> )';
                Content += '<input type="hidden" value = "'+email+'" >';//an dia chi email
                Content += '<input type="hidden" id = "'+pos+'" value = "'+id+'" >';//an id nguoi dung
                Content += '<input type="hidden" value = "'+age+'">';//an do tuoi
                Content +=  '</div>';
                Content +=  '<hr class="hr-clas-low" />';
                pos++;
                return Content;
              }

              //ham tu dong load nhung nguoi dung trong csdl
              function Load_user(Id, val)
              {
                $.ajax({
                  type: "GET",
                  url: "/user/home",
                  data:{loaduser: Id, valsearch: val},
                  success: function(data)
                  {
                    var Length = data.length, index;
                    for(index = 0; index < Length; index++){
                      if((data[index].email).localeCompare(yemail) != 0){
                        Sub_div_infor_user_on[0].innerHTML += User_in_app(data[index].image, data[index].username,
                         data[index].email, data[index].age, data[index]._id, data[index].status)
                      }
                    }  
                  }
                })
              }

              setTimeout(Load_user(1, ""), 500)//load danh sach hien thi nguoi dung
             // setInterval(Load_user, 4000)
              setTimeout(function(){//tu dong load tin nhan tu server
                var index,  Span_status_user_div, Input_hidden_id_user
                for(index = 0; index < Status_user_div.length; index++){
                    Span_status_user_div = Status_user_div[index].getElementsByTagName("span")
                    Input_hidden_id_user = Status_user_div[index].getElementsByTagName("input")
                    if(Span_status_user_div[0].style.color ==  "red")
                    {
                      //load tin nhan tu csdl cho nguoi dung
                      Load_message(yid, Input_hidden_id_user[1].value)
                      break
                    }
                  }
              }, 1500)

             //ham bat su kien nguoi dung tim kiem nguoi dung trong danh sach
              var Div_contain_search = Div_infor_user_on[0].getElementsByTagName("div")
              var Search_input_user = Div_contain_search[2].getElementsByTagName("input")
              var Search_button_user = Div_contain_search[2].getElementsByTagName("button")
              //kick enter tim kiem
              Search_input_user[0].addEventListener("keyup", function(e){
                if(Search_input_user[0].value.length > 2 && e.keyCode == 13){
                  Load_user(5, Search_input_user[0].value);
                  Search_input_user[0].value = "";
                }
              })

              //khi nguoi dung nhan nut search
              Search_button_user[0].addEventListener("click", function(){
                if(Search_input_user[0].value.length > 2){
                  Load_user(5, Search_input_user[0].value)
                  Search_input_user[0].value = "";
                }
              }) 

              //ham load message tu server ve app nguoi dung
              function Load_message(usera, userb)
              {
                var Length, index;

                $.ajax({
                  type: "GET",
                  url: "/user/home",
                  data:{loadmessagea: usera, loadmessageb: userb},
                  success: function(data)//hien thi message
                  {
                    Length = data.length;
                    for(index = 0; index < Length; index++){
                      if((data[index].id_user_A._id).localeCompare(yid) == 0)
                      {//tin nhan nguoi dung gui
                        Create_message_send(data[index].content, Time_transfer(data[index].created_at))
                      }else{//tin nhan duoc nhan
                        Create_message_receive(data[index].content, data[index].id_user_B.username, 
                         data[index].id_user_B.image, Time_transfer(data[index].created_at), data[index].id_user_B.age);
                      }
                    }
                  }
                })
              }

            //Bat su kien scroll de load tin nhan cho nguoi dung
              var num = 0, Input_hidden_id_user;
              Div_Body_Scroll[0].addEventListener("scroll", function(){
                var position =  Div_Body_Scroll[0].scrollTop;
                if(position == 0){
                  num++;
                  for(var index = 0; index < Status_user_div.length; index++){
                    Span_status_user_div = Status_user_div[index].getElementsByTagName("span")
                    Input_hidden_id_user = Status_user_div[index].getElementsByTagName("input")
                    if(Span_status_user_div[0].style.color ==  "red")
                    {
                      //load tin nhan tu csdl cho nguoi dung
                      Load_message(yid, Input_hidden_id_user[1].value)
                      break
                    }
                  }
                  
                }
              })

            //Ham nay se ghep ma nguoi gui va ma nguoi dung vao trong tin nhan theo quy tac
            //de gui toi server, server se boc tach ra luu vao csdl va gui toi nguoi nhan
            function Message_to_server(id_send, id_receive, content)
            {
              var fix = id_send.concat(id_receive);
              fix = fix.concat(content)
              return fix;
            }
          

            var Chatbox = document.getElementsByClassName("chat-box-footer");
            var Input_text_submit = Chatbox[0].getElementsByTagName("input");
            var Input_button_submit = Chatbox[0].getElementsByTagName("button");
            var Div_content_message = document.getElementsByClassName("panel-body chat-box-main")

            //Nguoi dung nhan nut enter
            Input_text_submit[0].addEventListener("keyup", function(e)
            {
              if(e.keyCode == 13){
                if(this.value != "")
                {
                  socket.emit('chat', Message_to_server(yid, Partner_id, this.value))
                  Create_message_send(this.value, Time_stand())
                  Div_content_message[0].scrollTop = Div_content_message[0].scrollHeight;//dat scroll trong the div luon o cuoi the div 
                  this.value = "";
                }
              }else{
                //nguoi dung dang nhap tin nhan
                socket.emit('chatting', Message_to_server(yid, Partner_id, ""))
              }
            })

            //khi nguoi dung nhan nut submit
            Input_button_submit[0].addEventListener("click", function(){
              if(Input_text_submit[0].value != "")
              {
                socket.emit('chat', Message_to_server(yid, Partner_id, Input_text_submit[0].value))
                Create_message_send(Input_text_submit[0].value, Time_stand())
                Div_content_message[0].scrollTop = Div_content_message[0].scrollHeight;
                Input_text_submit[0].value = "";
              }
            })

            //lang nghe su kien nguoi dung dang nhap tin nhan
            //hien thi 1 doan animation la dang co nguoi nhan tin cho minh ;)))))
            var ind, Span_status_user_div, Id_status_user_div, Id_receive;
            socket.on('typing...', function(data)
            {
              Id_send = data.substring(0, 24)//ma nguoi nhan
              for(ind = 0; ind < Status_user_div.length; ind++){
                Span_status_user_div = Status_user_div[ind].getElementsByTagName("span")
                //lay ma nguoi ma nguoi dung dang nhan tin cung kiem tra xem co phai nguoi nhan khong
                Id_status_user_div = Status_user_div[ind].getElementsByTagName("input")
                //ID_status_user_div[1] chinh la ma nguoi nhan
                if(Span_status_user_div[0].style.color == "red"
                 && (Id_status_user_div[1].value).localeCompare(Id_send) == 0)
                {
                  Event_user_typing.style.display = "block";
                  setTimeout(function(){
                    Event_user_typing.style.display = "none";
                  }, 7000)
                  break;
                }
              }
            })

            //ham sua tin nhan ;))))
            function Fix_message(user_name, userpass)
            {
              $.ajax({
                type: "PUT",
                url: "/user/home",
                data:{},
                success: function(data){
                                
                }
              })
            }

            //ham xoa tin nhan cua nguoi dung
            function Delete_message(user_name, userpass)
            {
              $.ajax({
                type: "DELETE",
                url: "/user/home",
                data:{},
                success: function(data){
                                
                }
              })
            }

            //ham tra ve dinh dang thoi gian chuan
            function Time_stand()
            {
              dt = new Date();
              var  time = dt.getHours() + ":" + dt.getMinutes() +", "+ dt.getDate()+ "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear();
              return time;
            }

            //ham chuyen ISOdate trong mongo ve Date js
             function Time_transfer(ISOdate)
            {
              dt = new Date(ISOdate)
              var  time = dt.getHours() + ":" + dt.getMinutes() +", "+ dt.getDate()+ "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear();
              return time;
            }

            //ham tao tin nhan hien thi tren giao dien cho chinh nguoi dung khi nguoi dung gui tin
            function Create_message_send(content, time)
            {
              var Content =  "<div class='chat-box-left' style= 'word-break: break-all;'>" + content;
              Content += "</div><div class='chat-box-name-left'>";
              Content += "<img src='"+ yimage +"' alt='bootstrap Chat box user image' class='img-circle' data-placement='top' title='"+yage+" tuổi'/>";
              Content +=  "- " + yname;
              Content += "<span style='float: right;margin-top: 5%;font-size: 90%;font-style: italic;margin-right:5%;'>"+ time +"</span>";
              Content += "</div><hr class='hr-clas' />";

              Div_content_message[0].innerHTML += Content;
            }

            //ham tao tin nhan hien thi tren giao dien cho nguoi dung khi nguoi dung nhan tin nhan tu nguoi gui
            function Create_message_receive(content, user_send, image, time, age)
            {
              var Content = "<div class='chat-box-right' style= 'word-break: break-all;'>";
              Content += content + "</div>";
              Content += "<div class='chat-box-name-right'>";
              Content += "<img src='"+image+"' alt='bootstrap Chat box user image' class='img-circle' data-placement='top' title='"+age+" tuổi'/>";
              Content += "- "+user_send;
              Content += "<span style='float: left;margin-top: 5%;font-size: 90%;font-style: italic;margin-left:5%;'>"+time+"</span>";
              Content += "</div> <hr class='hr-clas' />";

              Div_content_message[0].innerHTML += Content;
            }

            /*Hàm này sẽ tiến hành thông báo cho người dùng nếu có người khác nhắn tin cho người dùng nhưng
            người dùng đang bận nhắn tin với người khác nên chưa xem.
            Ý tưởng: Kiem tra thẻ span xem có là màu đỏ không(màu đỏ thể hiện là người dùng đang nhắn tin với)
            đối phương. Sau đó kiểm tra id xem có trùng với thẻ span không.Nếu không tức là người dùng chưa xem
            tin nhắn naỳ => hiển thị thông báo*/ 

            function Notify_message(anotherid)//tham so la id cua nguoi gui tin nhan
            {
              var index, Span_status_user_div, H5_status_user_div, Input_hidden_id_user;
                //phuc hoi mau ve trang thi binh thuong
                for(index = 0; index < Status_user_div.length; index++){
                  Span_status_user_div = Status_user_div[index].getElementsByTagName("span")
                  Input_hidden_id_user = Status_user_div[index].getElementsByTagName("input")
                  if(Span_status_user_div[0].style.color ==  "red")
                  {
                    if(Input_hidden_id_user[1].value.localeCompare(anotherid) == 0){//nguoi nhan va nguoi gui
                      break;                           //dang nhan tin voi nhau
                    }
                  }else//nguoi khac nhan tin cho nguoi tôi
                  {
                    if(Input_hidden_id_user[1].value.localeCompare(anotherid) == 0){
                      H5_status_user_div = Status_user_div[index].getElementsByTagName("h5")
                      H5_status_user_div[0].innerHTML = "(Có tin nhắn đến...)";
                   }
                  }
                }
            }


            //server broacast toi tat ca nguoi dung dang online tren he thong
            //Nguoi dung muon nhan dung tin nhan thi phai mo goi du lieu va kiem tra id
            //su kien nay lang nghe phan hoi tin nhan tu ben kia(nguoi gui)
            var Input_hidden_status_user, Image_status_user_div, receive_id, index, sender_id;

            socket.on('reply', function(data)
            {  
              receive_id = data.substring(24, 48);//tôi là người nhận tin của bạn
              sender_id = data.substring(0, 24);
              Notify_message(sender_id)//thong bao co tin nhan neu nguoi dung hien tai dang nhan tin cho nguoi khac
              if(receive_id.localeCompare(yid) == 0)
              {//du lieu nhan dung là của mình thì nhận lấy và hiển thị
                for(index = 0; index < Status_user_div.length; index++)
                {
                  Input_hidden_status_user = Status_user_div[index].getElementsByTagName("input")
                  Span_status_user_div = Status_user_div[index].getElementsByTagName("span")
                 //vi tri 1 luu id, 0 luu email va 2 luu tuoi cua nguoi tôi dang nt
                  if((Input_hidden_status_user[1].value).localeCompare(sender_id) == 0 && 
                    Span_status_user_div[0].style.color == "red")
                  {//tao ra 1 message hien thi tren cho nguoi dung
                    Image_status_user_div = Status_user_div[index].getElementsByTagName("img")
                  //cac gia tri tham so tuong ung la 1- noi dung hoi thoai, 2- ten nguoi gui, 3-anh dai dien nguoi gui, 4- tuoi nguoi gui
                     Event_user_typing.style.display = "none";
                    Create_message_receive(data.substring(48, data.length), Span_status_user_div[0].innerHTML, 
                      Image_status_user_div[0].src, Time_stand(), Input_hidden_status_user[2].value, receive_id)
                    Div_content_message[0].scrollTop = Div_content_message[0].scrollHeight;//dieu chinh thanh scroll 
                  }
                }
              }
            })

            //bắt sự kiện kick chuột vào 2 button Talking by list và Talking random
            var Talking_chat = document.getElementById("cachthucnhantin")
            var Talking_chat_button = Talking_chat.getElementsByTagName("button");
            Talking_chat_button[0].addEventListener("click", function(){
                Talking_chat_button[1].className = "btn btn-default"
                Talking_chat_button[0].className = "btn btn-default active"
                Load_user(1, "")
              })

            Talking_chat_button[1].addEventListener("click", function(){
              Talking_chat_button[0].className = "btn btn-default"
              Talking_chat_button[1].className = "btn btn-default active"
              Load_user(2, "")
            })


        
         /* //khi nguoi dung kick vao nhung nguoi trong danh sach thi can load noi dung hoi thoai giua 2 nguoi
            var Span_status_user_div, Input_hidden_status_user;
            alert(Status_user_div.length)
            for(var index = 0; index < Status_user_div.length; index++)
            {
                Span_status_user_div = Status_user_div[index].getElementsByTagName("span")
                Input_hidden_status_user = Status_user_div[index].getElementsByTagName("input")
                alert(index)
                alert(Input_hidden_status_user[1].value)
                Span_status_user_div[0].onclick = function(){
                Load_message(yid, Input_hidden_status_user[1].value)//Input_hidden_status_user[0] la dia chi mail
                }
            } */
