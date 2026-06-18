function Diagram(o, n, e, t, a, r) {
    open_strings = "", strings = "", frets = "", "guitar" == n ? string_count = 6 : "ukulele" == n && (string_count = 4);
    for (var d = 0; d <= string_count - 1; d++) open_strings = open_strings + '<pre class="open_string_' + (d + 1) + '">' + a[d] + "</pre>";
    r ? !r && $("#set-fret").length > 0 && "" != $("#set-fret").val() && (r = $("#set-fret").val()) : r = 5;
    for (var c = 0; c <= r - 1; c++) {
        strings = "";
        for (var s = 0; s <= string_count - 2; s++) strings = strings + '<td class="string_' + (s + 1) + '">', a[s] == c + 1 ? strings += '<span class="point"></span>' : s == string_count - 2 && a[s + 1] == c + 1 && (strings += '<span class="last_point"></span>'), a[s] == c + 1 && a[s + 1] == c + 1 && a[s] == c + 1 && (strings += '<span class="last_point"></span>'), strings += "</td>";
        frets = frets + '<tr class="fret">' + strings + "</tr>"
    }
    if (a.length == string_count) {
        "download" == o || "chord" == o ? (l(o, e), function(o, e) {
            for (var a = $(".oml-chord-diagram").length, r = 0; r <= a - 1; r++) $(".oml-chord-diagram:nth-child(" + r + "1)").css({
                display: "none"
            }), $(".myCanvas:nth-child(" + r + "1)").css({
                display: "none"
            });
            html2canvas(e, {
                onrendered: function(a) {
                    e.append(a);
                    var r = n + "-" + t,
                        d = a.toDataURL();
                    $("canvas").attr("class", "myCanvas").attr("hidden", "hidden"), "download" == o && (e.wrap('<a href="' + d + '" download="' + r + '.png"></a>'), e.append('<div class="dl_bg"><span>Click to Download</span></div>'))
                }
            }), 
            $(".oml-chord-diagram").css({
                display: "inline-block"
            })
        }(o, $(".oml-chord-diagram").last())) : "chord-tooltip" == o && l(o, e)
    }

    function l(o, e) {
        e.append('<div class="oml-chord-diagram ' + n + '"><pre class="chord-name">' + t + '</pre><div class="open-string">' + open_strings + '</div><table class="chord">' + frets + "</table></div>")
    }
}
$(document).ready(function() {
    var o, n, e, t;
    omlDiagram();
    $("#instrument-selector").add("#chord_name").add("#chord_code").add("#fret_count").on("keyup change", function () {
        omlDiagram();
    })
    function omlDiagram() {
        o = $("#instrument-selector").val(), n = $("#chord_name").val(), e = $("#chord_code").val(), t = $("#fret_count").val(), $("#chord-generator").html(""), Diagram("chord", o, $("#chord-generator"), n, e, t)
    }
});