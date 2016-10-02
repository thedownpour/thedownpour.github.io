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
var current_id = -1;

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
                scrollTop: $("#" + page.page.hash).offset().top
            }, 300, 'swing')
        }, 100);

    }
    var lastScrollPosition = $(window).scrollTop();

    $(document).scroll(function(e) {
        var tillBottom = $(document).height() - ($(window).scrollTop() + $(window).height());
        var tillUp = $(window).scrollTop() - $("#content").offset().top;
        var scrollingDown = (lastScrollPosition < $(window).scrollTop());
        lastScrollPosition = $(window).scrollTop();
        if ((tillBottom <= 100) && scrollingDown) {
            if (current_id + 1 < config.length) {

                loadPage(config[current_id + 1], {
                    "scroll": false
                });
            }
        }
        if ((tillUp <= 100) && !scrollingDown) {
            var first_loaded_page_hash = $("#content>div:first").attr("id");
            var page = findPageByHash(config, first_loaded_page_hash);
            if ((page.id - 1) >= 0) {

                loadPage(config[page.id - 1], {
                    "scroll": false,
                    "next": false,
                    "changeHash": false
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
                if (page.animation !== undefined) {
                    $("#" + page.hash).prepend('<div class="animation" id="animation-' + page.hash + '" style="'+ page.animation.style + '"></div>');
                    var vivus = new Vivus('animation-' + page.hash, {
                        duration: page.animation.duration,
                        file: '/svg/' + page.animation.svg,
                        type: 'oneByOne'
                    }, finishedDrawing);
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
                    $('body').scrollTop($("#" + page.hash).offset().top+$("#"+page.hash).height());
                }
            }
        });
    }


}

function finishedDrawing() {

}

function findPageByHash(arr, hash, id) {
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
