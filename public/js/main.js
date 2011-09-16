/**
 * @author pjnovas
 */


now.start = function(){
	
}

$(document).ready(function(){

});

now.updateRooms = function(rs){
	$('#rooms tr').empty().remove();	
	$("#tr-room").tmpl(rs).appendTo("#rooms");
}

