function alertBanner(e, t, a, n, c) {
    $(".alert-banner", e).remove(), n = void 0 == n ? "" : n, e.prepend('<div class="alert-banner ' + a + '">' + n + '<span class="alert-content">' + t + "</span></div>"), $(".alert-banner", e).delay(2e3).fadeOut(500);
    var r = "guitar" == $("#instrument-selector").val() ? "208px" : "148px";
    void 0 != c ? $(".alert-banner", e).css({
        position: "fixed",
        top: "0"
    }) : $(".alert-banner", e).animate({
        top: "0"
    }, 200)
}

$(document).ready(function() {
    /**
     * Switch
     */
    $(".switch").each(function() {
        $(".nav[data-value]", this).append('<nav tabindex="0"></nav>'), $(".nav[data-value]", this).on("click keypress", function(e) {
            "click" == e.type ? $(this).parent().attr("checked") ? $(this).parent().removeAttr("checked") : $(this).parent().attr("checked", "checked") : "keypress" == e.type && "13" == e.which && $(this).click()
        })
    })
    /**
     * Tabbed Panel
     */
    let hash_link = location.hash;
    if( hash_link ){
        $('.tabs a').removeClass('active');
        $('[href=' + hash_link + ']').addClass('active');
        $('.box-wrap > div').removeClass('active');
        $(hash_link).addClass('active');
    }
    $('.tabs a').on('click', function() {
        $('.tabs a').removeClass('active');
        $(this).addClass('active');
        $('.box-wrap > div').removeClass('active');
        const tabID = $(this).attr('href');
        $(tabID).addClass('active');
    })
});