
//tạo các biến để xử lí các vùng trong ui admin
var Dashboard_event = document.getElementsByClassName("side-menu-container")
//bắt sự kiện khi click vào thanh navbar bên trái 
var Dashboard_event_ul_tag = Dashboard_event[0].getElementsByTagName("ul")
//các thẻ li hiển thị các chức năng trong trang admin
var Dashboard_event_ul_tag_li = Dashboard_event_ul_tag[0].getElementsByTagName("li")
//khai bao cac bien chay 
var index = 0, pos = 0, position = 0, ind = 0, i = 0, j = 0, k = 0;

//khoi tao cac vi tri khi click vao cac nut trong thanh chuc nang admin
for(index = 0; index < Dashboard_event_ul_tag_li.length; index++){
	Dashboard_event_ul_tag_li[index].alt = index;//luu lai cac vi tri
}

//bat su kien click
for(ind = 0; ind < Dashboard_event_ul_tag_li.length; ind++)
{
	console.log(ind)
	Dashboard_event_ul_tag_li[ind].addEventListener("click", function(){
		
		if(this === document.activeElement)
		{
			alert(this.alt)
		}
	})
}
