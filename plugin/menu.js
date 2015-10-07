(function(){
    var title = $('#title').text();
    $.ajax({
        url:'../data.json',
        dataType:'json',
        cache:false,
        success:function(data){
            var html = (function(res){
                var arr = [], crt;
                $.each(res, function(key, val){
                    crt = val.title == title ? ' class="s-crt"' : '';
                    arr.push('<li'+ crt +'><a href="../'+ val.name +'/index.html">'+ val.title +'</a></li>');
                });
                return arr.join('');
            })(data);
            $('#menu ul').html(html);
        }
    });    
})();