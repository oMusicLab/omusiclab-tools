function generate(t, e, a) {
    switch (null != e && "" != e || (e = $("body")), null != a && "" != a || (a = ""), t) {
        case "instrument":
            _instrument(a, e);
            break;
        case "settings":
            _settings(a, e)
    }
}

function _instrument(t, e) {
    var a, s, n, i, r = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"],
        l = [];
    "guitar" == t ? (a = 6, s = 18, n = ["e", "B", "G", "D", "A", "E"], l = ["5", "7", "9", "12", "15", "17", "19"]) : "ukulele" == t && (a = 4, s = 18, n = ["A", "E", "C", "G"], l = ["3", "5", "7", "10", "13"]), 0 == $("#instrument_fret-board").length ? e.prepend('<div id="virtual_instrument"><!--<div class="left wrap"><div class="dropdown" data-type="text"><select id="instrument-selector"><option>guitar</option><option>ukulele</option></select></div><div class="switch" checked><label for="switch">tabs seq</label><span id="tabs-seq-screen-2">0</span><label for="switch">:</label><nav class="nav" data-value="viewTabs"></nav></div><div id="tab-sequence" class="pager"><button title="Show all tabs" id="tab-seq-all" class="w-m">show all</button><content id="tabs-seq-screen-1" class="pager-screen w-s">all</content><button title="Previous" id="tab-seq-prev" class="left"></button><button title="Next" id="tab-seq-next" class="right"></button><button title="Edit" id="tab-seq-edit" class="edit" hidden></button><button title="Delete" id="tab-seq-delete" class="delete" hidden></button><button title="Save" id="tab-seq-save" class="save" hidden></button><button title="Back" id="tab-seq-back" class="back" hidden></button></div></div><div class="right wrap"><div class="switch"><label for="switch">notes</label><nav class="nav" data-value="viewNotes"></nav></div></div>--><table id="instrument_fret-board" class="black"></table></div>') : $("#instrument_fret-board").html(""), 
    $("#instrument_fret-board").css({
        width: "100%",
        "border-collapse": "collapse"
    });
    for (var d = 0; d <= a; d++) {
        $("#instrument_fret-board").append('<tr class="string"></tr>');
        for (var o = 0; o <= s; o++)
            if (0 == d) 0 == o ? $(".string:nth-child(" + (d + 1) + ")").append("<th></th>") : $(".string:nth-child(" + (d + 1) + ")").append("<th>" + o + "</th>");
            else if (0 == o) i = n[d - 1].toUpperCase(), $(".string:nth-child(" + (d + 1) + ")").append('<th class="fret" data-x-axis="' + d + '" data-y-axis="' + o + '" data-chord-name="' + i + '">' + n[d - 1] + "</th>");
        else {
            for (var c = 0; c <= s; c++) {
                if (i == r[c] && "B" != r[c]) {
                    i = r[c + 1];
                    break
                }
                if ("B" == r[c]) {
                    i = r[0];
                    break
                }
            }
            $(".string:nth-child(" + (d + 1) + ")").append('<td class="fret" data-x-axis="' + d + '" data-y-axis="' + o + '" data-chord-name="' + i + '"><nav class="str_line"></nav><div class="scale_point"></div><span class="note_name">' + i + "</span></td>")
        }
    }

    function b() {
        $(".fret > .scale_point", "#instrument_fret-board").toggle(), $(".fret > .note_name", "#instrument_fret-board").toggle()
    }
    b(), $("body").on("click", '.switch > [data-value="viewNotes"]', function() {
        b()
    });
    for (var u = a / 2, p = l[3], v = 0; v <= l.length - 1; v++) l[v] != p ? $('.string td[data-x-axis="' + u + '"][data-y-axis="' + l[v] + '"]').append('<span class="fret_mark"></span>') : ($('.string td[data-x-axis="1"][data-y-axis="' + l[v] + '"]').append('<span class="fret_mark"></span>'), $('.string td[data-x-axis="' + (a - 1) + '"][data-y-axis="' + l[v] + '"]').append('<span class="fret_mark"></span>'));
    for (var h = 0; h <= s; h++) $("#instrument_fret-board tbody .string .fret:nth-child(" + h + ")").css({
        "min-width": "calc(57px - " + (h + s) + "px)"
    })
}

function _settings(t, e) {
    switch (t) {
        case "sidebar":
            e.append('<div class="settings"><button class="btn add" title="New Staff" id="tabs-generator_new-staff"></button><button class="btn separator" title="New Bar" id="tabs-generator_bar"></button><button class="btn clear" title="Clear" id="tabs-generator_clear"></button><button class="btn delete" title="Delete" id="tabs-generator_delete"></button><button class="btn reset" title="Reset" id="tabs-generator_reset"></button><div class="dropdown" data-type="number"><label>Staff</label><select id="staff-selector"></select></div><div class="textarea"><label>Text Content</label><textarea id="generator_lyrics" placeholder="Write your content here..."></textarea></div><div class="settings-footer"><button class="btn copy" data-copy="tabs-generator" title="Copy Output"></button><button class="btn share" title="Share" id="tabs-generator_share"></button></div></div>');
            break;
        case "generator-tabs":
            e.append('<div id="tabs-generator"></div>'), _create("staff", $("#tabs-generator"), $("#generator_lyrics").text())
    }

    function a(t) {
        strings = "guitar" == $("#instrument-selector").val() ? 6 : 4, $("#set-chord-code", t).attr("maxlength", strings)
    }
    $("#instrument-selector").on("change", function() {
        a(e), _instrument($(this).val(), e)
    }), a(e)
}