$(document).ready(function() {
    $(document).bind('keyup keydown', function(e){
        if(e.ctrlKey && e.keyCode == 80){
            var myDiv = document.getElementById('content').innerHTML;
            var oldPage = document.body.innerHTML;
            document.body.innerHTML = myDiv;
            window.print();
            document.body.innerHTML = oldPage;
        }
    })
    $('#dark-theme').on('click', function() {
        if ( $(this).parent().attr('checked') !== 'checked' ) {
            $('body').attr('data-theme', 'dark');
        } else {
            $('body').attr('data-theme', 'default');
        }
    })
})

document.getElementById('dark-theme').addEventListener('change', function(event){
    (event.target.checked) ? document.body.setAttribute('data-theme', 'dark') : document.body.removeAttribute('data-theme');
});

function loadjscssfile(filename, filetype){
    if (filetype=="js"){ //if filename is a external JavaScript file
        var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", filename)
    }
    else if (filetype=="css"){ //if filename is an external CSS file
        var fileref=document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }
    if (typeof fileref!="undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref)
}