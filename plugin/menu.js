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
                    if(val.disabled == true){
                        return true;
                    }
                    if(val.url){
                        arr.push('<li'+ crt +'><a href="'+ val.url +'" target="_blank">'+ val.title +'</a></li>');
                    }
                    else{
                        crt = val.title == title ? ' class="s-crt"' : '';
                        arr.push('<li'+ crt +'><a href="../'+ val.name +'/index.html">'+ val.title +'</a></li>');
                    }
                });
                return arr.join('');
            })(data);
            $('#menu ul').html(html);
        }
    });    
    
    $('.m-article').append('<div class="ds-thread"></div>');
    $('.ds-thread').attr({
        'data-title':$('title').text(),
        'data-url':location.href
    });
    
})();

var duoshuoQuery = {short_name:"zjaisinofe"};
(function() {
    
    var ds = document.createElement('script');
    ds.type = 'text/javascript';ds.async = true;
    ds.src = (document.location.protocol == 'https:' ? 'https:' : 'http:') + '//static.duoshuo.com/embed.js';
    ds.charset = 'UTF-8';
    (document.getElementsByTagName('head')[0] 
     || document.getElementsByTagName('body')[0]).appendChild(ds);
})();