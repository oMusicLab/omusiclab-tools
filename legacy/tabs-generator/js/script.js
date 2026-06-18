$(document).ready(function(){
	generate('settings',$('#navigation'),'sidebar')
	generate('instrument',$('#inst'),'guitar')
	generate('settings',$('#content'),'generator-tabs')
	// force to hide watermark
    $('footer + div').css({'display':'none !important'});
    $('footer + div').remove();
});
