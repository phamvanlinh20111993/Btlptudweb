              //hàm kiểm tra kiểu file mà người dùng muốn cập nhật ảnh đại diện
              //tham số val là đường dẫn của người dùng có chứa tên file và kiểu file 
              function TypeofFile(val)
              {
                //lay kieu file vi du helo.jpg se lay duoi file la jpg hoac neu file la abc.adf.acc lay duoc duoi file la acc
                var type = val.slice((Math.max(0, val.lastIndexOf(".")) || Infinity) + 1);
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

              //ham chuyen doi thoi gian so voi hien tai
              //tham số đầu vào Date_time là thời gian trước thời gian hiện tại, là IOSdate trong csdl
              function Change_date(Date_time)
              {
                  var second, d, d1, date_now, text; 
                  d = new Date();//lay thoi gian hien tai
                  d1 = new Date(Date_time);//;lay thoi gian da offline la thoi gian IOStime
                  second = parseInt((d - d1)/1000);//thoi gian hien tai va thoi gian da dang
                  if(second < 60) text = "Vừa xong";
                  else if(second > 60 && second < 3600)            text =parseInt(second/60)+" Phút trước";
                  else if(second >= 3600 && second < 86400)        text = "Khoảng "+parseInt(second/3600)+" Tiếng trước"; 
                  else if(second >= 86400 && second < 2592000)     text = parseInt(second/86400)+" Ngày trước"; 
                  else if(second >= 2592000 && second < 946080000) text = parseInt(second/2592000)+" Tháng trước";
                  else                                             text = "Không xác định";     
                  return text;                               
              }

              var Image_upload_div = document.getElementsByClassName("chat-box-new-div")
              var Image_form_in_div = Image_upload_div[0].getElementsByClassName("panel-body chat-box-new")
              var Form_image = Image_form_in_div[0].getElementsByTagName("form")
              var Input_button_form_submit = Form_image[0].getElementsByTagName("input")
              var Div_content_message = document.getElementsByClassName("panel-body chat-box-main")
              var Event_user_typing = document.getElementById("nhapbanphim")
              var Div_infor_user_on = document.getElementsByClassName("chat-box-online-div")
              var Sub_div_infor_user_on0 = Div_infor_user_on[0].getElementsByClassName("chat-box-online-head")
              var Sub_div_infor_user_on = Div_infor_user_on[0].getElementsByClassName("panel-body chat-box-online")
              var Status_user_div = Sub_div_infor_user_on[0].getElementsByClassName("chat-box-online-left")

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
              //Nếu tin nhắn có lỗi thì nội dung tin nhắn có gắn thêm mã "55555" ở cuối String của tin nhắn
              function Cutstring(String)
              {
                  var Length = String.length;
                  return String.substring(Length - 5, Length)
              }

              //ham ve lai so nguoi dung da on hay off
              //các tham số data là mã của người dùng đang nhắn tin cùng
              //tham số Value là là 1 string "on" hoặc "off" tùy vào trạng thái
              function Status_user(data, Value)
              {
                  var Length = Status_user_div.length; 
                  for(var index = 0; index < Length; index++){
                    var inputhidden = Status_user_div[index].getElementsByTagName('input');//mã người dùng bị ẩn
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
              socket.on('offline', function(data) //data là tham số chứa email người dùng bên kia
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
              var Partner_id = "", you_can_using_scroll = false;
              /*Khi nguoi dung kick vao bat ki nguoi dung trong danh sach online khac thi mau tren ten cua nguoi
               dung do bi thay doi(cụ thể là màu đỏ), tham số th là 1 html DOM-đại diện cho thẻ span chứa người
               Dùng. id là tham số đại diện cho vị trí của người dùng trong HTML DOM
               */
              function Chat(th, id)
              {
                var ind, Span_status_user_div, H5_status_user_div;
                user_request = true;//khoi phuc trang thai load nguoi dung
                no_message_for_you = true;//khoi phuc trang thai co the load tin nhan
                num_of_message_request = 1;//so luong tin nhan tra ve 1
                //phuc hoi mau ve trang thi binh thuong
                for(ind = 0; ind < Status_user_div.length; ind++)
                {
                  Span_status_user_div = Status_user_div[ind].getElementsByTagName("span")
                  H5_status_user_div = Status_user_div[ind].getElementsByTagName("h5")
                  Span_status_user_div[0].style.color = "#03DB2F";
                  H5_status_user_div[0].innerHTML = "";//nhan duoc thong bao thi tat di
                }

                th.style.color = "red";//doi mau tai vi tri kick
                var themid = document.getElementById(id).value;
                Div_content_message[0].innerHTML = ""//reset lai hop thoai chat
                Partner_id = themid;//ma id cua doi phuong
                Load_message(yid, themid, 15, function(data){
                  if(data.length < 15) 
                    no_message_for_you = false;
                  Show_message(data)
                  Div_content_message[0].scrollTop = Div_content_message[0].scrollHeight;
                })// mặc định 15 tin nhắn(lịch sử chat) từ 2 người dùng

                /*ẩn trang thái có ai đó đang nhập phím gửi tin nhắn cho bạn thì   Event_user_typing.style.display =
                  "block" hiển thị báo cho người dùng biết. Khi chuyển người dùng khác để nhắn tin thì nó trở vể
                  trạng thái "none"
                 */
                Event_user_typing.style.display = "none"
              }

              /*xet gia tri id cho nguoi dung
              Các tham số image là ảnh đại diện của người dùng, name là tên của người dùng, email là địa chỉ
              mail người dùng đăng kí(mail duy nhất- nhận dạng người dùng), tham số age là tuổi người dùng 
              đăng kí, id là 1 Object id trong csdl mặc định(nhận dạng người dùng), tham số status biểu thị trạng
              thái on hay offline của người dùng
              */
              var pos = 0;
              function User_in_app(image, name, email, age, id, status, date)
              {
                var Content = "";
                Content += '<div class="chat-box-online-left">';
                Content += '<img src="'+image+'" alt="bootstrap Chat box user image" class="img-circle" data-toggle="tooltip" data-placement="right" title="'+age+'" tuổi/>';
                if(pos == 0){
                  Partner_id = id;//mac dinh id nhan tin la nguoi dau tien trong danh sach
                  //thay doi the span mac dinh la do la nguoi mac dinh se nhan tin
                  Content +=  '<span data-toggle="tooltip" data-placement="right" title="'+email+'" style= "cursor: pointer;color:red;" onclick="Chat(this,'+pos+')"> - ' + name + '</span> ';
                }else{
                  Content +=  '<span data-toggle="tooltip" data-placement="right" title="'+email+'" style= "cursor: pointer;" onclick="Chat(this,'+pos+')"> - ' + name + '</span>' + '  .';
                }
                if(status == 1) Content += '<p style="color:blue;">On</p><h5></h5>';
                else            Content += '<p>Off</p><h5></h5>';
                  
                Content +=  '<br />';

                if(status == 0)
                 Content +=  '( <small style="color:black;">'+Change_date(date)+'</small> )';

                Content += '<input type="hidden" value = "'+email+'" >';//an dia chi email
                Content += '<input type="hidden" id = "'+pos+'" value = "'+id+'" >';//an id nguoi dung
                Content += '<input type="hidden" value = "'+age+'">';//an do tuoi
                Content +=  '</div>';
                Content +=  '<hr class="hr-clas-low" />';
                pos++;

                return Content;
              }

              /*Hàm tu dong load nhung nguoi dung trong csdl,mỗi người dùng online muốn biết cụ thể ngoài bản thân
                mình ra còn ai online trong danh sách không để nhắn tin hoặc làm gì đó.
                Các tham số Id là mã load, val là giá trị khi người dùng tìm kiếm, num_of_user_request
                Hàm Load_user() được sử dụng khi:
                -Khi người dùng vào app thì Hàm được tự động được sử dụng load 1 số người dùng khác đang online:
                các tham số val = "", num_of_user_request = 10(hiển thị 10 người)
                -Khi người dùng muốn hiển thị thêm nhiều hơn những người online(mỗi lần yêu cầu sẽ tăng thêm 10), giá
                trị val = "", num_of_user_request tương ứng với số lần yêu cầu
                -Khi người dùng muốn tìm kiếm ai đó: val = giá trị tìm kiếm, num_of_user_request = 5(tìm người gần
                đúng nhất với giá trị tìm kiếm)
                -Tìm kiếm random 1 người nào đó để trò chuyện
              */
              var message_request = true, user_request = true;
              //bien message_request de the hien neu tren server da het message thi k duoc yeu cau gui nua
              //bat su kien scroll cho viec yeu cau xem lich su tin nhan giua 2 nguoi
              //tuong tu nhu bien user_request bat su kien scroll hien thi them nguoi dung
              function Load_user(Id, val, num_of_user_request)
              {
                $.ajax({
                  type: "GET",
                  url: "/user/home",
                  data:{loaduser: Id, valsearch: val, num_of_user: num_of_user_request},
                  success: function(data)
                  {
                    var Length = data.length, index;

                    if(Length == 0 && val == ""){//data.lenght = 0 la khong ton tại nguoi dung nao
                      if(Id == 1){//lay nguoi dung
                        user_request = false
                      }
                    }
                    
                    for(index = 0; index < Length; index++)
                    {
                      if((data[index].email).localeCompare(yemail) != 0){
                        Sub_div_infor_user_on[0].innerHTML += User_in_app(data[index].image, data[index].username,
                         data[index].email, data[index].age, data[index]._id, data[index].status, data[index].updated_at)
                      }
                    }  
                  }
                })
              }

              setTimeout(Load_user(1, "", 10), 1500)//load danh sach hien thi nguoi dung
             // setInterval(Load_user, 4000)
              setTimeout(function()
              {//tu dong load tin nhan tu server
                var index, Span_status_user_div, Input_hidden_id_user;

                for(index = 0; index < Status_user_div.length; index++)
                {
                    Span_status_user_div = Status_user_div[index].getElementsByTagName("span")
                    Input_hidden_id_user = Status_user_div[index].getElementsByTagName("input")
                    if(Span_status_user_div[0].style.color ==  "red")
                    {
                      //load tin nhan tu csdl cho nguoi dung
                      Load_message(yid, Input_hidden_id_user[1].value, 15, function(data){
                        if(data.length < 15) no_message_for_you = false;
                        Show_message(data)
                        Div_content_message[0].scrollTop = Div_content_message[0].scrollHeight;
                      });
                      break;
                    }
                }
              }, 400)//load sau 0.4s
             
             //ham bat su kien nguoi dung tim kiem nguoi dung khác trong danh sach
              var Div_contain_search = Div_infor_user_on[0].getElementsByTagName("div")
              var Search_input_user = Div_contain_search[2].getElementsByTagName("input")
              var Search_button_user = Div_contain_search[2].getElementsByTagName("button")
              //kick enter tim kiem
              Search_input_user[0].addEventListener("keyup", function(e){
                if(Search_input_user[0].value.length > 2 && e.keyCode == 13){
                  Load_user(5, Search_input_user[0].value, 100);
                  Search_input_user[0].value = "";
                }
              })

              //khi nguoi dung nhan nut search
              Search_button_user[0].addEventListener("click", function(){
                if(Search_input_user[0].value.length > 1){
                  Load_user(5, Search_input_user[0].value, 100)
                  Search_input_user[0].value = "";
                }
              }) 

              /*ham load message tu server ve app nguoi dung
                để load được tin nhắn của 2 người giao tiếp với nhau cần có mã id phân biệt từng người với nhau
                Ham Load_message() chứa 3 tham số trong đó usera là mã của người dùng đang online, userb là mã của
                người mà người dùng sẽ nhắn tin cùng, tham số còn lại num_of_message_request để load 1 số lượng tin
                nhắn mà người dùng yêu cầu(mặc định là 15 tin nhắn)
              */
              function Load_message(usera, userb, num_of_message_request, callback)
              {
                var Length, index;
            
                $.ajax({
                  type: "GET",
                  url: "/user/home",
                  data:{loadmessagea: usera, loadmessageb: userb, num: num_of_message_request},
                  success: function(data)//hien thi message
                  {
                    if(typeof callback == "function")
                      callback(data);//tra ve du lieu
                  }
                })
              }

              //hien thi du lieu tin nhan
              function Show_message(data)
              {
                var Length = data.length;

                for(index = 0; index < Length; index++)
                {
                  // if(data[index].id_user_A != null && data[index].id_user_B != null)
                  // {//server cần giải quyết vấn đề id_user_B va id_user_B khong bi null
                  //trả vể null - server bỏ qua các giá trị null, font k cần giải quyết
                  if((data[index].id_user_A._id).localeCompare(yid) == 0)
                  {//tin nhan nguoi dung gui
                    Create_message_send(data[index].content, Time_transfer(data[index].created_at))
                  }else
                  {//tin nhan duoc nhan
                    if((data[index].id_user_B).localeCompare(yid) == 0){
                      Create_message_receive(data[index].content, data[index].id_user_A.username, 
                      data[index].id_user_A.image, Time_transfer(data[index].created_at), data[index].id_user_A.age);
                    }
                  }
                     // }
                }
              }

            //Bat su kien scroll de load tin nhan cho nguoi dung
              var num_of_message_request = 1, Input_hidden_id_user, num_of_user_request = 1;
              var no_message_for_you = true, Storage = "", position_scroll = 0;

              Div_content_message[0].addEventListener("scroll", function(){ 
                var position = Div_content_message[0].scrollTop;
               
                if(position == 0 && you_can_using_scroll && no_message_for_you)//di chuyen tu duoi len tren
                {
                  num_of_message_request++;
                  for(var index = 0; index < Status_user_div.length; index++)
                  {
                    Span_status_user_div = Status_user_div[index].getElementsByTagName("span")
                    Input_hidden_id_user = Status_user_div[index].getElementsByTagName("input")
                    if(Span_status_user_div[0].style.color ==  "red")//người dùng phải đang nói chuyện với
                    {                                                //một người dùng cụ thể nào đó                                                            
                      //luu tru so luong tin nhan hien thi hien tai
                      //load tin nhan tu csdl cho nguoi dung, reset lai hop thoai
                      Storage = Div_content_message[0].innerHTML;

                      //gan vi tri cua so luong tin nhan truoc
                      position_scroll = Div_content_message[0].scrollHeight
                      Div_content_message[0].innerHTML = "";
                      Load_message(yid, Input_hidden_id_user[1].value, num_of_message_request*15, function(data)
                      {
                        Show_message(data)//hien thi tin nhan tu qua khu
                        Div_content_message[0].innerHTML += Storage ;//lay so luong tin nhan truoc do ra
                        if(data.length < num_of_message_request*15)
                          no_message_for_you = false;
                        //sau khi load thêm số luong tin nhắn scroll thay đổi cần giữ lại vị trí trước đó(trước
                        // khi thay đổi)
                        Div_content_message[0].scrollTop = (Div_content_message[0].scrollHeight - position_scroll);
                      })
                      break;
                    }
                  }
                 
                }

                //tinh the bat buoc
                /*phải tạo ra 1 biến global you_can_using_scroll = false bởi vì
                  khi người dùng đang nhắn tin cho A và kéo scroll tới bottom hộp thoại chat sau đó chuyển sang
                  nhắn tin với người dùng khác thì do mặc định scroll sẽ được mặc định Div_content_message[0].scrollTop = 0,
                  do đó hàm Load_message() sẽ được gọi 2 lần đồng thời(Lần 1 khi kick vào người dùng B, và lần 2 
                  khi hàm:
                     Div_content_message[0].addEventListener("scroll", function(){ 
                        var position = Div_content_message[0].scrollTop;//gia tri nay là 0-vấn đề
                        if(position == 0){Load_user()}
                     }),
                  tin nhắn trong hộp thoại gấp đôi lên-lỗi. Do đó phải set cho thêm 1 biến  you_can_using_scroll = false;
                  để hàm Load_user() chỉ chạy 1 lần mà thôi
                */

                if(position > 5){
                   you_can_using_scroll = false;
                }else{
                  you_can_using_scroll = true;

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

            //Nguoi dung nhan nut enter
            Input_text_submit[0].addEventListener("keyup", function(e)
            {
              if(e.keyCode == 13){
                if(this.value != "")
                {
                  socket.emit('chat', Message_to_server(yid, Partner_id, this.value))
                  Create_message_send(this.value, Time_stand())
                  //dat scroll trong the div luon o cuoi the div 
                  Div_content_message[0].scrollTop = Div_content_message[0].scrollHeight;
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
              for(ind = 0; ind < Status_user_div.length; ind++)
              {
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
                  }, 10000)
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
              var  time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds() + ", "+ dt.getDate()+ "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear();
              return time;
            }

            //ham chuyen ISOdate trong mongo ve Date js
             function Time_transfer(ISOdate)
            {
              dt = new Date(ISOdate)
              var  time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds() + ", "+ dt.getDate()+ "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear();
              return time;
            }

            //ham tao tin nhan hien thi tren giao dien cho chinh nguoi dung khi nguoi dung gui tin
            //tham số content là nội dung tin nhắn, time là thời gian đăng
            function Create_message_send(content, time)
            {
              var Content =  "<div class='chat-box-left' style= 'word-break:break-all;background-color:#c9e0e0;'>" + content;
              Content += "</div><div class='chat-box-name-left'>";
              Content += "<img src='"+ yimage +"' alt='bootstrap Chat box user image' class='img-circle' data-placement='top' title='"+yage+" tuổi'/>";
              Content +=  "- " + yname;
              Content += "<span style='float: right;margin-top: 5%;font-size: 90%;font-style: italic;margin-right:5%;'>"+ time +"</span>";
              Content += "</div><hr class='hr-clas' />";

              Div_content_message[0].innerHTML += Content;
            }

            /*ham tao tin nhan hien thi tren giao dien cho nguoi dung khi nguoi dung nhan tin nhan tu nguoi gui
             tham số content la nội dung tin nhắn được nhận, user_send là tên người gửi, image là ảnh đại diện
             của người gửi, time là thời gian gửi đến, age là tuổi của người gửi
             */
            function Create_message_receive(content, user_send, image, time, age)
            {
              var Content = "<div class='chat-box-right' style='word-break:break-all;background-color:#d8d2d2;'>";
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
            var count_click_talkingbylist = 0;
            //Talking by list
            Talking_chat_button[0].addEventListener("click", function(){
              Div_content_message[0].innerHTML = "";//reset hop thoai chat
              Sub_div_infor_user_on[0].innerHTML = "";//reset hop thoai nguoi dung trong ds online
              Talking_chat_button[1].className = "btn btn-default"
              Talking_chat_button[0].className = "btn btn-default active"
              if(count_click_talkingbylist == 0){
                Load_user(1, "", 10)//hien thi 20 nguoi trong danh sach
                count_click_talkingbylist++
              }
            })

            //Talking random
            Talking_chat_button[1].addEventListener("click", function()
            {
              Sub_div_infor_user_on[0].innerHTML = "";//reset hop thoai nguoi dung trong ds online
              Talking_chat_button[0].className = "btn btn-default"
              Talking_chat_button[1].className = "btn btn-default active"
              Load_user(2, "", 0)
              count_click_talkingbylist = 0;//khoi phuc ve trang thai ban dau
            })

            //ham su li su kien nguoi dung scroll tim kiem nguoi dung khac
            Sub_div_infor_user_on[0].addEventListener("scroll", function(){
              var position1 =  Sub_div_infor_user_on[0].offsetHeight + Sub_div_infor_user_on[0].scrollTop;
              var position = Sub_div_infor_user_on[0].scrollHeight;
              if(position == position1){//khi nguoi dung kick vao button tim kiem nguoi dung
                 num_of_user_request++;
                 document.getElementById("concac").innerHTML += position 
                 if(user_request)//neu van con nguoi dung de load
                  Load_user(1, "", num_of_user_request*10)
              }
            })
