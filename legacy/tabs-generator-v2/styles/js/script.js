$(document).ready(function(){
	// generate('settings',$('#navigation'),'sidebar')
	generate('instrument',$('#inst'),'guitar')
	generate('settings',$('#content'),'generator-tabs')
	$( ".draggable" ).draggable();

	// var div = $('.draggable');
	// function stop(event){
	// 	if(event.type === "resizestop"){
	// 		var topOff = $(this).offset().top - $(window).scrollTop()
	// 		$(this).css("top",topOff)
	// 	}
	// 	$(this).css("position","fixed")     
	// }  
});
