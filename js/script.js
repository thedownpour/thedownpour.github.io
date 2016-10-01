$(document).ready(function() {
    $(document).ajaxError(function(event, request, settings) {
        console.log("-------------------------------------------------");
        console.log("Triggered ajaxError handler.The request is below");
        console.log(request);
        console.log("-------------------------------------------------");
    });
    $.get("config.json", function(data) {
        init(data);
    });

});

function init(config) {
    var current = document.location.hash;
    var current_id = -1;
    if (current != "") {
        var page = findPageByHash(config,current);
        if(!page){
          page=config[0];
        }
        current_id = config.indexOf(page);
        loadPage(page, {
            "scroll": false
        });
        if (current_id > 0) {
            loadPage(config[current_id - 1], {
                "changeHash": false,
                "scroll": false,
                "next": false
            });
        }
        setTimeout(function() {
            $('html,body').animate({
                scrollTop: $("#" + page.hash).offset().top
            }, 300, 'swing')
        }, 100);

        current_id++;
    }
    var lastScrollPosition = $(window).scrollTop();
    $(document).scroll(function(e) {
        var tillBottom = $(document).height() - ($(window).scrollTop() + $(window).height());
        var scrollingDown = (lastScrollPosition < $(window).scrollTop());
        lastScrollPosition = $(window).scrollTop();
        if ((tillBottom <= 100) && scrollingDown) {
            if (current_id + 1 < config.length) {
                current_id++;
                loadPage(config[current_id], {
                    "scroll": false
                });
            }
        } else {
            if (current_id - 1 > 0) {
                current_id += -1;
                loadPage(config[current_id], {
                    "scroll": false,
                    "next": false
                });
            }
        }
    });



}

function loadPage(page, options = {}) {
  ga('send', 'event', 'page', 'loaded', page.hash);

    if (options.changeHash === undefined) {
        options.changeHash = true;
    }
    if (options.next === undefined) {
        options.next = true;
    }
    if (options.scroll === undefined) {
        options.scroll = true;
    }
    if (options.changeHash) {
        document.location.hash = "#" + page.hash;
    }
    if ($("#" + page.hash).size() == 0) {
        if (options.next) {
            $("#content").append('<div id="' + page.hash + '"></div>');
        } else {
            $("#content").prepend('<div id="' + page.hash + '"></div>');
        }
        $("#loader").show();
        jQuery.ajax({
            url: "/book/" + page.file,
            success: function(result) {
                var converter = new showdown.Converter();
                var html = converter.makeHtml(result);
                $("#" + page.hash).html(html);
                if(page.animation!==undefined){
                  $("#" + page.hash).prepend('<div id="animation-'+page.hash+'" style="'+page.animation.style+'"></div>');
                  var vivus=new Vivus('animation-'+page.hash, {duration: page.animation.duration, file: '/svg/'+page.animation.svg, type:'oneByOne'}, finishedDrawing);
                }
                $("#loader").fadeOut();
                if (options.scroll) {
                    $('html,body').animate({
                        scrollTop: $("#" + page.hash).offset().top
                    }, 300, 'swing');
                }
            }
        });
    }


}
function finishedDrawing(){

}
function findPageByHash(array,hash){
  var page="";

  array.forEach(function(el){
    if(el.hash==hash.replace("#","")){
      page=el;

    }
  });
  return page;
}
