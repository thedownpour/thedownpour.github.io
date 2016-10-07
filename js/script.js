$(document).ready(function() {
    $(document).ajaxError(function(event, request, settings) {
        console.log("-------------------------------------------------");
        console.log("Triggered ajaxError handler.The request is below");
        console.log(request);
        console.log("-------------------------------------------------");
    });
    $.get("/config.json?v=3", function(data) {
        init(data);
    });

});
var current_id = -1;
var lastScrollTop = 0;
var loading=false;


function init(config) {
    var current = document.location.hash;
    if (current != "") {
        var page = findPageByHash(config, current);
        if (!page.page) {
            page = config[0];
            current_id = 0;
        } else {
            current_id = page.id;
        }
        loadPage(page.page, {
            "scroll": false,
            "first": true
        });
        if (current_id > 0) {
            loadPage(config[current_id - 1], {
                "changeHash": false,
                "scroll": false,
                "next": false
            });
        }

        $(document).on("pageLoaded", function(event, page, options) {
            if (options.first) {
                $('html,body').animate({
                    scrollTop: $("#" + page.hash).offset().top
                }, 300, 'swing');
            }
        });


    } else {
        loadPage(config[0], {
            "changeHash": false,
            "scroll": false
        });
    }


    $(document).scroll(function(e) {
        if (loading) {
            return false;
        }
        if (isCloseToEdge("bottom", e)) {
            if (current_id + 1 < config.length) {
                loadPage(config[current_id + 1], {
                    "scroll": false,
                    "changeHash": true
                });
            }
        }

        if (isCloseToEdge("top", e)) {
            var first_loaded_page_hash = $("#content>div:first").attr("id");
            var page = findPageByHash(config, first_loaded_page_hash);
            if ((page.id - 1) >= 0) {

                loadPage(config[page.id - 1], {
                    "scroll": false,
                    "next": false
                });

            }
        }


    });



}

function loadPage(page, options) {

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
        if (history.pushState) {
            history.pushState(null, null, "#" + page.hash);
        } else {
            location.hash = "#" + page.hash;
        }
    }
    if ($("#" + page.hash).size() == 0) {
        if (options.next) {
            $("#content").append('<div id="' + page.hash + '"></div>');
        } else {
            $("#content").prepend('<div id="' + page.hash + '"></div>');
        }
        $("#loader").show();
        loading = true;
        jQuery.ajax({
            url: "/book/" + page.file,
            success: function(result) {
                var converter = new showdown.Converter();
                var html = converter.makeHtml(result);
                $("#" + page.hash).html(html);
                loading=false;
                if (page.animation !== undefined) {
                    $("#" + page.hash).prepend('<div class="animation" id="animation-' + page.hash + '" style="' + page.animation.style + '"></div>');
                    var vivus = new Vivus('animation-' + page.hash, {
                        duration: page.animation.duration,
                        file: '/svg/' + page.animation.svg,
                        type: 'oneByOne'
                    }, finishedDrawing);
                    $('#animation-' + page.hash).fadeIn();
                }
                $("#" + page.hash).fadeIn();
                $("#loader").fadeOut();
                if (options.scroll) {
                    $('body').animate({
                        scrollTop: $("#" + page.hash).offset().top
                    }, 300, 'swing');
                }
                if (options.next) {
                    current_id++;
                } else {
                    current_id += -1;
                    $('body').scrollTop($("#" + page.hash).offset().top + $("#" + page.hash).height());
                }

                $("#" + page.hash).slideDown(500);

                $(document).trigger("pageLoaded", [page, options]);
            }
        });
    }else{
    loading=false;
  }
}

function finishedDrawing() {

}


/* @covered findPageByHash*/
function findPageByHash(arr, hash) {
    var page = {
        "id": -1
    };
    for (var i = 0; i < arr.length; i++) {
        var el = arr[i];

        if (el.hash == hash.replace("#", "")) {
            page.page = el;
            page.id = i;
        }


    }
    return page;
}



function isCloseToEdge(side, e) {
    e.preventDefault()
    var headingTo;
    var toEdge;
    var st = $(window).scrollTop();
    if (st > lastScrollTop) {
        headingTo = "bottom";
        toEdge = $(window).scrollBottom();
    } else {
        headingTo = "top";
        toEdge = st - $(".pusher").height();
    }
    lastScrollTop = st;

    return ((headingTo == side) && (toEdge <= 100));
}



$.fn.scrollBottom = function() {
    return $(document).height() - this.scrollTop() - this.height();
};
