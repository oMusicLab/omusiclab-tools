function generate(a, t, n) {
    switch (null != t && "" != t || (t = $("body")), null != n && "" != n || (n = ""), a) {
        case "instrument":
            _instrument(n, t);
            break;
        case "settings":
            _settings(n, t)
    }
}

function _instrument(a, t) {
    var n, o, e, r, m, l, i, s = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"],
        u = ["Major (triad)", 
"Major 6th", 
"Major 7th", 
"Major 9th", 
"Major 6/9th", 
"Major 13th", 
"Major 7#11", 
"Minor (triad)", 
"m7th", 
"m9th", 
"m11th", 
"m6", 
"m6/9",  
"m7", 
"m9", 
"Dominant 7th", 
"Dominant 9th", 
"Dominant 13th",
"Dominant 11th", 
"Dominant 9b5", 
"Dominant 7b5", 
"Dominant 7#9", 
"Dominant 7b9", 
"+", 
"Diminished 7th"],
        f = ["Major", "Natural Minor", "Harmonic Minor", "Melodic Minor (Ascending)", "Melodic Minor (Descending)", "Pentatonic Major", "Pentatonic Minor", "Chromatic"],
        c = '<div class="scale_point"></div>',
        d = [];
    "guitar" == a ? (n = 6, o = 24, e = ["e", "B", "G", "D", "A", "E"], d = [3, 5, 7, 9, 12, 15, 17, 19]) : "ukulele" == a && (n = 4, o = 18, e = ["A", "E", "C", "G"], d = [3, 5, 7, 10, 13]);
    for (var h = 0; h <= s.length - 1; h++) {
        m = m + "<option>" + (0 == h ? "--note--" : s[h]) + "</option>", 0 == h && (m = m + "<option>" + s[h] + "</option>")
    }
    for (var p = 0; p <= u.length - 1; p++) {
        l = l + "<option>" + (0 == p ? "--quality--" : u[p]) + "</option>", 0 == p && (l = l + "<option>" + u[p] + "</option>")
    }
    for (p = 0; p <= f.length - 1; p++) {
        i = i + "<option>" + (0 == p ? "--scale--" : f[p]) + "</option>", 0 == p && (i = i + "<option>" + f[p] + "</option>")
    }
    0 == $("#instrument_fret-board").length ? t.append('<div id="virtual_instrument"><div class="navigation"><div class="left"><div class="nav"><nav id="leftNAV" class="nav-button"><span class="nav-button-line"></span><span class="nav-button-line"></span><span class="nav-button-line"></span></nav><div class="nav-content" data-nav="leftNAV"><div class="dropdown" data-type="text"><select id="instrument-selector"><option>guitar</option><option>ukulele</option></select></div><div class="dropdown" data-type="text"><select class="catalog-chord">' + m + '</select></div><div class="dropdown" data-type="text"><select class="catalog-quality">' + l + '</select></div><div class="dropdown" data-type="text"><select class="catalog-scale">' + i + '</select></div></div></div></div><div class="center"><span>virtual instrument</span></div><div class="right"><div class="switch" checked="checked"><label for="switch">scales</label><span data-value="viewScales"></span></div><div class="switch"><label for="switch">notes</label><span data-value="viewNotes"></span></div></div></div><table id="instrument_fret-board" class="black"></table><div class="statusbar"></div></div>') : $("#instrument_fret-board").html(""), $("#virtual_instrument").css({
        width: "calc(100% - 2px)"
    }), $("#instrument_fret-board").css({
        width: "calc(100% - 2px)",
        "border-collapse": "collapse"
    });
    for (h = 0; h <= n; h++) {
        $("#instrument_fret-board").append('<tr class="string"></tr>');
        for (p = 0; p <= o; p++)
            if (0 == h) 0 == p ? $(".string:nth-child(" + (h + 1) + ")").append("<th></th>") : $(".string:nth-child(" + (h + 1) + ")").append("<th>" + p + "</th>");
            else if (0 == p) r = e[h - 1].toUpperCase(), $(".string:nth-child(" + (h + 1) + ")").append('<th class="fret" data-x-axis="' + h + '" data-y-axis="' + p + '" data-chord-name="' + r + '">' + e[h - 1] + c + '<span class="note_name">' + r + "</span></th>");
        else {
            for (var b = 0; b <= o; b++) {
                if (r == s[b] && "B" != s[b]) {
                    r = s[b + 1];
                    break
                }
                if ("B" == s[b]) {
                    r = s[0];
                    break
                }
            }
            $(".string:nth-child(" + (h + 1) + ")").append('<td class="fret" data-x-axis="' + h + '" data-y-axis="' + p + '" data-chord-name="' + r + '"><nav class="str_line"></nav>' + c + '<span class="note_point"></span><span class="note_name">' + r + "</span></td>")
        }
    }
    for (var _ = n / 2, v = d[3], g = 0; g <= d.length - 1; g++) d[g] != v ? $('.string td[data-x-axis="' + _ + '"][data-y-axis="' + d[g] + '"]').append('<span class="fret_mark"></span>') : ($('.string td[data-x-axis="1"][data-y-axis="' + d[g] + '"]').append('<span class="fret_mark"></span>'), $('.string td[data-x-axis="' + (n - 1) + '"][data-y-axis="' + d[g] + '"]').append('<span class="fret_mark"></span>'));
    for (var N = 0; N <= o; N++) $("#instrument_fret-board tbody .string .fret:nth-child(" + N + ")").css({
        "min-width": "calc(60px - " + (N + o) + "px)"
    });
    showNotes("viewNotes"), showNotes("viewScales")
}

function showNotes(a) {
    function t(a) {
        $(".fret").each(function() {
            $("." + a, this).is(":visible") && $("> .note_name", this).css({
                display: "block",
                color: "#111"
            })
        })
    }
    elem = "viewNotes" == a ? "note_point" : "scale_point", "checked" != $('#virtual_instrument .switch > [data-value="' + ("viewNotes" == a ? "viewNotes" : "viewScales") + '"]').parent().attr("checked") ? ($(".fret > ." + elem, "#instrument_fret-board").css({
            display: "none"
        }), $(".fret > .note_name", "#instrument_fret-board").css({
            display: "none"
        }), elem = "viewNotes" == a ? "scale_point" : "note_point", t(elem)) : $(".fret > ." + elem, "#instrument_fret-board").css({
            display: "block"
        }),
        function() {
            var a = $("#virtual_instrument > .navigation .catalog-chord").val(),
                n = $("#virtual_instrument > .navigation .catalog-quality").val(),
                o = $("#virtual_instrument > .navigation .catalog-scale").val(),
                e = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"],
                r = [],
                m = [],
                l = [],
                i = [],
                s = [{
                    name: "Major",
                    formula: [0, 2, 4, 5, 7, 9, 11]
                }, {
                    name: "Natural Minor",
                    formula: [9, 11, 0, 2, 4, 5, 7]
                }, {
                    name: "Harmonic Minor",
                    formula: [9, 11, 0, 2, 4, 5, 8]
                }, {
                    name: "Melodic Minor (Ascending)",
                    formula: [9, 11, 0, 2, 4, 6, 8]
                }, {
                    name: "Melodic Minor (Descending)",
                    formula: [9, 7, 5, 4, 2, 0, 11]
                }, {
                    name: "Pentatonic Major",
                    formula: [0, 2, 4, 7, 9]
                }, {
                    name: "Pentatonic Minor",
                    formula: [9, 0, 2, 4, 7]
                }, {
                    name: "Chromatic",
                    formula: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
                }],
                u = [{
                    name: "Major (triad)",
                    altName: "",
                    orig_formula: [1, 3, 5],
                    formula: [1, 3, 5]
                }, {
                    name: "Major 6th",
                    altName: "M6",
                    orig_formula: [1, 3, 5, 6],
                    formula: [1, 3, 5, 6]
                }, {
                    name: "Major 7th",
                    altName: "M7",
                    orig_formula: [1, 3, 5, 7],
                    formula: [1, 3, 5, 7]
                }, {
                    name: "Major /9th",
                    altName: "M/9",
                    orig_formula: [1, 3, 5, 9],
                    formula: [1, 3, 5, 9]
                }, {
                    name: "Major 9th",
                    altName: "9",
                    orig_formula: [1, 3, 5, 7, 9],
                    formula: [1, 3, 5, 7, 9]
                }, {
                    name: "Major 6/9th",
                    altName: "M6/9",
                    orig_formula: [1, 3, 5, 6, 9],
                    formula: [1, 3, 5, 6, 9]
                }, {
                    name: "Major 13th",
                    altName: "M13",
                    orig_formula: [1, 3, 5, 7, 9, 13],
                    formula: [1, 3, 5, 7, 9, 13]
                }, {
                    name: "Major 7/6th",
                    altName: "M7/6",
                    orig_formula: [1, 3, 5, 7, 13],
                    formula: [1, 3, 5, 7, 13]
                }, {
                    name: "Major 6/9#11",
                    altName: "M6/9#11",
                    orig_formula: [1, 3, 5, 6, 9, "#11"],
                    formula: [1, 3, 5, 6, 9, 11]
                }, {
                    name: "Major 7#11",
                    altName: "",
                    orig_formula: [1, 3, 5, 7, "#11"],
                    formula: [1, 3, 5, 7, 11]
                }, {
                    name: "Major 9#11",
                    altName: "",
                    orig_formula: [1, 3, 5, 7, 9, "#11"],
                    formula: [1, 3, 5, 7, 9, 11]
                }, {
                    name: "Major /9#11",
                    altName: "",
                    orig_formula: [1, 3, 5, 9, "#11"],
                    formula: [1, 3, 5, 9, 11]
                }, {
                    name: "Major /#11",
                    altName: "",
                    orig_formula: [1, 3, 5, "#11"],
                    formula: [1, 3, 5, 11]
                }, {
                    name: "Suspended",
                    altName: "",
                    orig_formula: [1, 4, 5],
                    formula: [1, 4, 5]
                }, {
                    name: "2",
                    altName: "",
                    orig_formula: [1, 2, 5],
                    formula: [1, 2, 5]
                }, {
                    name: "Major 7+",
                    altName: "",
                    orig_formula: [1, 3, "#5", 7],
                    formula: [1, 3, 5, 7]
                }, {
                    name: "Major 9+",
                    altName: "",
                    orig_formula: [1, 3, "#5", 7, 9],
                    formula: [1, 3, 5, 7, 9]
                }, {
                    name: "Minor (triad)",
                    altName: "",
                    orig_formula: [1, "b3", 5],
                    formula: [1, 3, 5]
                }, {
                    name: "m7th",
                    altName: "",
                    orig_formula: [1, "b3", 5, "b7"],
                    formula: [1, 3, 5, 7]
                }, {
                    name: "m7/11th",
                    altName: "",
                    orig_formula: [1, "b3", 5, "b7", 11],
                    formula: [1, 3, 5, 7, 11]
                }, {
                    name: "m9th",
                    altName: "",
                    orig_formula: [1, "b3", 5, "b7", 9],
                    formula: [1, 3, 5, 7, 9]
                }, {
                    name: "m11th",
                    altName: "",
                    orig_formula: [1, "b3", 5, "b7", 9, 11],
                    formula: [1, 3, 5, 7, 9, 11]
                }, {
                    name: "m/9th",
                    altName: "",
                    orig_formula: [1, "b3", 5, 9],
                    formula: [1, 3, 5, 9]
                }, {
                    name: "m7/13th",
                    altName: "",
                    orig_formula: [1, "b3", 5, "b7", 13],
                    formula: [1, 3, 5, 7, 13]
                }, {
                    name: "m9/13th",
                    altName: "",
                    orig_formula: [1, "b3", 5, "b7", 9, 13],
                    formula: [1, 3, 5, 7, 9, 13]
                }, {
                    name: "m7/11/13th",
                    altName: "",
                    orig_formula: [1, "b3", 5, "b7", 11, 13],
                    formula: [1, 3, 5, 7, 11, 13]
                }, {
                    name: "m7b5",
                    altName: "",
                    orig_formula: [1, "b3", "b5", "b7"],
                    formula: [1, 3, 5, 7]
                }, {
                    name: "m7b5/11",
                    altName: "",
                    orig_formula: [1, "b3", "b5", "b7", 11],
                    formula: [1, 3, 5, 7, 11]
                }, {
                    name: "m7+",
                    altName: "",
                    orig_formula: [1, "b3", "#5", "b7"],
                    formula: [1, 3, 5, 7]
                }, {
                    name: "m7/11+",
                    altName: "",
                    orig_formula: [1, "b3", "#5", "b7", 11],
                    formula: [1, 3, 5, 7, 11]
                }, {
                    name: "m6",
                    altName: "",
                    orig_formula: [1, "b3", 5, 6],
                    formula: [1, 3, 5, 6]
                }, {
                    name: "m6/9",
                    altName: "",
                    orig_formula: [1, "b3", 5, 6, 9],
                    formula: [1, 3, 5, 6, 9]
                }, {
                    name: "m6/7",
                    altName: "",
                    orig_formula: [1, "b3", 5, 6, 7],
                    formula: [1, 3, 5, 6, 7]
                }, {
                    name: "m6/9/7",
                    altName: "",
                    orig_formula: [1, "b3", 5, 6, 7, 9],
                    formula: [1, 3, 5, 6, 7, 9]
                }, {
                    name: "m6/11",
                    altName: "",
                    orig_formula: [1, "b3", 5, 6, 11],
                    formula: [1, 3, 5, 6, 11]
                }, {
                    name: "m6/9/11",
                    altName: "",
                    orig_formula: [1, "b3", 5, 6, 9, 11],
                    formula: [1, 3, 5, 6, 9, 11]
                }, {
                    name: "m6/9#11",
                    altName: "",
                    orig_formula: [1, "b3", 5, 6, "#11"],
                    formula: [1, 3, 5, 6, 11]
                }, {
                    name: "m7",
                    altName: "",
                    orig_formula: [1, "b3", 5, 7],
                    formula: [1, 3, 5, 7]
                }, {
                    name: "m9",
                    altName: "",
                    orig_formula: [1, "b3", 5, 7, 9],
                    formula: [1, 3, 5, 7, 9]
                }, {
                    name: "Dominant 7th",
                    altName: "",
                    orig_formula: [1, 3, 5, "b7"],
                    formula: [1, 3, 5, 7]
                }, {
                    name: "Dominant 7/6th",
                    altName: "",
                    orig_formula: [1, 3, 5, "b7", 13],
                    formula: [1, 3, 5, 7, 13]
                }, {
                    name: "Dominant 9th",
                    altName: "",
                    orig_formula: [1, 3, 5, "b7", 9],
                    formula: [1, 3, 5, 7, 9]
                }, {
                    name: "Dominant 13th",
                    altName: "",
                    orig_formula: [1, 3, 5, "b7", 9, 13],
                    formula: [1, 3, 5, 7, 9, 13]
                }, {
                    name: "Dominant 7sus",
                    altName: "",
                    orig_formula: [1, 4, 5, "b7"],
                    formula: [1, 4, 5, 7]
                }, {
                    name: "Dominant 7/6sus",
                    altName: "",
                    orig_formula: [1, 4, 5, "b7", 13],
                    formula: [1, 4, 5, 7, 13]
                }, {
                    name: "Dominant 11th",
                    altName: "",
                    orig_formula: [1, 5, "b7", 9, 11],
                    formula: [1, 5, 7, 9, 11]
                }, {
                    name: "Dominant 13sus",
                    altName: "",
                    orig_formula: [1, 5, "b7", 9, 11, 13],
                    formula: [1, 5, 7, 9, 11, 13]
                }, {
                    name: "Dominant 13#11th",
                    altName: "",
                    orig_formula: [1, 3, 5, "b7", 9, "#11", 13],
                    formula: [1, 3, 5, 7, 9, 11, 13]
                }, {
                    name: "Dominant 9#11th",
                    altName: "",
                    orig_formula: [1, 3, 5, "b7", 9, "#11"],
                    formula: [1, 3, 5, 7, 9, 11]
                }, {
                    name: "Dominant 9b5",
                    altName: "",
                    orig_formula: [1, 3, "b5", "b7", 9],
                    formula: [1, 3, 5, 7, 9]
                }, {
                    name: "Dominant 7+",
                    altName: "",
                    orig_formula: [1, 3, "#5", "b7"],
                    formula: [1, 3, 5, 7]
                }, {
                    name: "Dominant 7b5",
                    altName: "",
                    orig_formula: [1, 3, "b5", "b7"],
                    formula: [1, 3, 5, 7]
                }, {
                    name: "Dominant 7#9",
                    altName: "",
                    orig_formula: [1, 3, 5, "b7", "#9"],
                    formula: [1, 3, 5, 7, 9]
                }, {
                    name: "Dominant 7b9",
                    altName: "",
                    orig_formula: [1, 3, 5, "b7", "b9"],
                    formula: [1, 3, 5, 7, 9]
                }, {
                    name: "Dominant 7#9+",
                    altName: "",
                    orig_formula: [1, 3, "#5", "b7", "#9"],
                    formula: [1, 3, 5, 7, 9]
                }, {
                    name: "Dominant 7b9+",
                    altName: "",
                    orig_formula: [1, 3, "#5", "b7", "b9"],
                    formula: [1, 3, 5, 7, 9]
                }, {
                    name: "Dominant 7#9b5",
                    altName: "",
                    orig_formula: [1, 3, "b5", "b7", "#9"],
                    formula: [1, 3, 5, 7, 9]
                }, {
                    name: "Dominant 7b9b5",
                    altName: "",
                    orig_formula: [1, 3, "b5", "b7", "b9"],
                    formula: [1, 3, 5, 7, 9]
                }, {
                    name: "Dominant 13b9",
                    altName: "",
                    orig_formula: [1, 3, 5, "b7", "b9", 13],
                    formula: [1, 3, 5, 7, 9, 13]
                }, {
                    name: "Dominant 13b9#11",
                    altName: "",
                    orig_formula: [1, 3, 5, "b7", "b9", "#11", 13],
                    formula: [1, 3, 5, 7, 9, 11, 13]
                }, {
                    name: "Dominant 13#9",
                    altName: "",
                    orig_formula: [1, 3, 5, "b7", "#9", 13],
                    formula: [1, 3, 5, 7, 9, 13]
                }, {
                    name: "Dominant 9+",
                    altName: "",
                    orig_formula: [1, 3, "#5", "b7", 9],
                    formula: [1, 3, 5, 7, 9]
                }, {
                    name: "+",
                    altName: "",
                    orig_formula: [1, 3, "#5"],
                    formula: [1, 3, 5]
                }, {
                    name: "+11b9",
                    altName: "",
                    orig_formula: [1, 3, "#5", "b7", "b9", 11],
                    formula: [1, 3, 5, 7, 9, 11]
                }, {
                    name: "Diminished 7th",
                    altName: "",
                    orig_formula: [1, "b3", "b5", "bb7"],
                    formula: [1, 3, 5, 7]
                }, {
                    name: "Diminished 7/7th",
                    altName: "",
                    orig_formula: [1, "b3", "b5", 6, 7],
                    formula: [1, 3, 5, 6, 7]
                }, {
                    name: "Diminished 7/9th",
                    altName: "",
                    orig_formula: [1, "b3", "b5", 6, 9],
                    formula: [1, 3, 5, 6, 9]
                }, {
                    name: "Diminished triad",
                    altName: "",
                    orig_formula: [1, "b3", "b5"],
                    formula: [1, 3, 5]
                }];
            if ("--note--" != a && "" != a && "--quality--" != n && "" != o && "--scale--" != o && "" != o) {
                for (var f = 0; f <= s.length - 1; f++) {
                    r[s[f].name] = [];
                    for (var c = 0; c <= e.length - 1; c++) {
                        for (var d = 0; d <= s[f].formula.length - 1; d++) 0 == d ? m.push(e[c + (f + 1) - 1]) : s[f].formula[d] + c < e.length ? m.push(e[s[f].formula[d] + c]) : m.push(e[s[f].formula[d] + c - 12]);
                        r[s[f].name].push({
                            name: e[c],
                            scales: m
                        }), m = []
                    }
                }
                for (var d = 0; d <= u.length - 1; d++) {
                    l[u[d].name] = [];
                    for (var h = 0; h <= r[o].length - 1; h++) {
                        for (var c = 0; c <= u[d].orig_formula.length - 1; c++)
                            for (var f = 0; f <= r[o][h].scales.length - 1; f++) {
                                var p = u[d].orig_formula[c] > r[o][h].scales.length ? u[d].orig_formula[c] - r[o][h].scales.length : u[d].orig_formula[c];
                                if (f + 1 == p) i.push(r[o][h].scales[f]);
                                else if (f + 1 == u[d].formula[c] && 1 == isNaN(p)) {
                                    for (var b = r[o][h].scales[f], _ = 0; _ <= e.length - 1; _++)
                                        if (e[_] == b) {
                                            var v = $.inArray(b, e);
                                            break
                                        }
                                    "b" == p.charAt(0) ? i.push(e[v - 1]) : "#" == p.charAt(0) && i.push(e[v + 1])
                                }
                            }
                        if (l[u[d].name].push({
                                name: r[o][h].name,
                                shape: i
                            }), u[d].name == n && r[o][h].name == a) {
                            var g = "<span><label>chord name</label>" + a + n + "</span><span><label>scale</label>" + r[o][h].scales + "</span><span><label>chord construction formula</label>" + u[d].orig_formula + " / " + i + "</span>";
                            for ($("#virtual_instrument .fret[data-chord-name] > .note_point").removeClass("noteShape"), $("#virtual_instrument th.fret[data-chord-name] > .scale_point").removeClass("noteShape"), "checked" != $('#virtual_instrument .switch > [data-value="viewNotes"]').parent().attr("checked") && $("#virtual_instrument .fret[data-chord-name] > .note_point").css({
                                    display: "none"
                                }), x = 0; x <= i.length; x++) $('#virtual_instrument .fret[data-chord-name="' + i[x] + '"] > .note_point').addClass("noteShape"), $('#virtual_instrument th.fret[data-chord-name="' + i[x] + '"] > .scale_point').addClass("noteShape");
                            $("#virtual_instrument > .statusbar").html(g)
                        }
                        i = []
                    }
                }
                $("#virtual_instrument .fret > .scale_point").css({
                    display: "none"
                }), $("#virtual_instrument .fret > .note_name").css({
                    display: "none"
                });
                for (var h = 0; h <= r[o].length - 1; h++)
                    if (r[o][h].name == a) {
                        m = r[o][h].scales;
                        for (var f = 0; f <= r[o][h].scales.length - 1; f++)
                            for (var f = 0; f <= m.length - 1; f++) chord_name = m[f] > 7 ? m[f] - 7 : m[f], "checked" == $('#virtual_instrument .switch > [data-value="viewScales"]').parent().attr("checked") ? ($('#virtual_instrument .fret[data-chord-name="' + chord_name + '"] > .note_name').css({
                                display: "block"
                            }), $('#virtual_instrument .fret[data-chord-name="' + chord_name + '"] > .scale_point').css({
                                display: "block"
                            })) : ($('#virtual_instrument .fret[data-chord-name="' + chord_name + '"] > .note_name').css({
                                display: "none"
                            }), $('#virtual_instrument .fret[data-chord-name="' + chord_name + '"] > .scale_point').css({
                                display: "none"
                            }))
                    } ChordShapeLogic()
            } else $("#virtual_instrument .fret > .scale_point").css({
                display: "none"
            }), $("#virtual_instrument .fret > .note_name").css({
                display: "none"
            }), $("#virtual_instrument > .statusbar").html(""), "checked" != $('#virtual_instrument .switch > [data-value="viewNotes"]').parent().attr("checked") && $("#virtual_instrument .fret[data-chord-name] > .note_point").css({
                display: "none"
            }), $("#virtual_instrument .fret[data-chord-name] > .note_point").removeClass("noteShape"), $("#virtual_instrument th.fret[data-chord-name] > .scale_point").removeClass("noteShape");
            t("note_point")
        }(), $(".fret").each(function() {
            $(".scale_point", this).is(":visible") ? $("> .note_name", this).css({
                color: "#111",
                "font-weight": "bold"
            }) : $("> .note_name", this).css({
                color: "#FAFAFA",
                "font-weight": "normal"
            })
        })
}

function _settings(a, t) {
    switch (a) {
        case "popup":
            t.append('<div id="VS-popup"><div id="VS-popup-bg"></div><a class="close">close</a><div id="VS-popup-container"><div class="content mousescroll"><div class="inner-content"><span>&lt;iframe width="100%" height="250" src="' + window.location.href + '" frameborder="0" allowfullscreen&gt;&lt;/iframe&gt;</span></div></div></div></div>')
    }
}
$(document).ready(function() {
    generate("instrument", $("#VS_Instrument"), "guitar"), _settings("popup", $("body")), $("body").on("click", ".embed-code", function() {
        $("#VS-popup").fadeIn()
    }), $("#VS-popup-bg").add("#VS-popup .close").on("click", function() {
        $(window).off("scroll"), $("body").css({
            overflow: "auto"
        }), $("#VS-popup").fadeOut()
    }), $("body").on("change", "#virtual_instrument #instrument-selector", function() {
        _instrument($(this).val(), $(this).parent().parent())
    }), $("body").on("click", "#virtual_instrument .switch", function() {
        showNotes($("> span", this).data("value"))
    }), $("#virtual_instrument > .navigation", "body").on("change", ".catalog-chord, .catalog-quality, .catalog-scale", function() {
        $("#virtual_instrument > .navigation .catalog-chord").val(), $("#virtual_instrument > .navigation .catalog-quality").val();
        showNotes("viewScales")
    })
});