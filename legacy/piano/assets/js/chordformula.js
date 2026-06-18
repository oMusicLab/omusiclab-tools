class oMusic {
    // get the main note from the generated shape then make conditions.
    //vi mobile responsive
    constructor(note, quality, scale) {
        this.note = note;
        this.quality = quality;
        this.scale = scale;
        this.notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        // this.notes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
        this.scales = [{
            name: 'Major',
            formula: [0, 2, 4, 5, 7, 9, 11]
        }, {
            name: 'Natural Minor',
            formula: [9, 11, 0, 2, 4, 5, 7]
        }, {
            name: 'Harmonic Minor',
            formula: [9, 11, 0, 2, 4, 5, 8]
        }, {
            name: 'Melodic Minor (Ascending)',
            formula: [9, 11, 0, 2, 4, 6, 8]
        }, {
            name: 'Melodic Minor (Descending)',
            formula: [9, 7, 5, 4, 2, 0, 11]
        }, {
            name: 'Pentatonic Major',
            formula: [0, 2, 4, 7, 9]
        }, {
            name: 'Pentatonic Minor',
            formula: [9, 0, 2, 4, 7]
        }, {
            name: 'Chromatic',
            formula: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        }];
        this.qualities = [{
            name: 'Major (triad)',
            altName: '',
            orig_formula: [1, 3, 5],
            formula: [1, 3, 5]
        }, {
            name: 'Major 6th',
            altName: 'M6',
            orig_formula: [1, 3, 5, 6],
            formula: [1, 3, 5, 6]
        }, {
            name: 'Major 7th',
            altName: 'M7',
            orig_formula: [1, 3, 5, 7],
            formula: [1, 3, 5, 7]
        }, {
            name: 'Major /9th',
            altName: 'M/9',
            orig_formula: [1, 3, 5, 9],
            formula: [1, 3, 5, 9]
        }, {
            name: 'Major 9th',
            altName: '9',
            orig_formula: [1, 3, 5, 7, 9],
            formula: [1, 3, 5, 7, 9]
        }, {
            name: 'Major 6/9th',
            altName: 'M6/9',
            orig_formula: [1, 3, 5, 6, 9],
            formula: [1, 3, 5, 6, 9]
        }, {
            name: 'Major 13th',
            altName: 'M13',
            orig_formula: [1, 3, 5, 7, 9, 13],
            formula: [1, 3, 5, 7, 9, 13]
        }, {
            name: 'Major 7/6th',
            altName: 'M7/6',
            orig_formula: [1, 3, 5, 7, 13],
            formula: [1, 3, 5, 7, 13]
        }, {
            name: 'Major 6/9#11',
            altName: 'M6/9#11',
            orig_formula: [1, 3, 5, 6, 9, '#11'],
            formula: [1, 3, 5, 6, 9, 11]
        }, {
            name: 'Major 7#11',
            altName: '',
            orig_formula: [1, 3, 5, 7, '#11'],
            formula: [1, 3, 5, 7, 11]
        }, {
            name: 'Major 9#11',
            altName: '',
            orig_formula: [1, 3, 5, 7, 9, '#11'],
            formula: [1, 3, 5, 7, 9, 11]
        }, {
            name: 'Major /9#11',
            altName: '',
            orig_formula: [1, 3, 5, 9, '#11'],
            formula: [1, 3, 5, 9, 11]
        }, {
            name: 'Major /#11',
            altName: '',
            orig_formula: [1, 3, 5, '#11'],
            formula: [1, 3, 5, 11]
        }, {
            name: 'Suspended',
            altName: '',
            orig_formula: [1, 4, 5],
            formula: [1, 4, 5]
        }, {
            name: '2',
            altName: '',
            orig_formula: [1, 2, 5],
            formula: [1, 2, 5]
        }, {
            name: 'Major 7+',
            altName: '',
            orig_formula: [1, 3, '#5', 7],
            formula: [1, 3, 5, 7]
        }, {
            name: 'Major 9+',
            altName: '',
            orig_formula: [1, 3, '#5', 7, 9],
            formula: [1, 3, 5, 7, 9]
        }, {
            name: 'Minor (triad)',
            altName: '',
            orig_formula: [1, 'b3', 5],
            formula: [1, 3, 5]
        }, {
            name: 'm7th',
            altName: '',
            orig_formula: [1, 'b3', 5, 'b7'],
            formula: [1, 3, 5, 7]
        }, {
            name: 'm7/11th',
            altName: '',
            orig_formula: [1, 'b3', 5, 'b7', 11],
            formula: [1, 3, 5, 7, 11]
        }, {
            name: 'm9th',
            altName: '',
            orig_formula: [1, 'b3', 5, 'b7', 9],
            formula: [1, 3, 5, 7, 9]
        }, {
            name: 'm11th',
            altName: '',
            orig_formula: [1, 'b3', 5, 'b7', 9, 11],
            formula: [1, 3, 5, 7, 9, 11]
        }, {
            name: 'm/9th',
            altName: '',
            orig_formula: [1, 'b3', 5, 9],
            formula: [1, 3, 5, 9]
        }, {
            name: 'm7/13th',
            altName: '',
            orig_formula: [1, 'b3', 5, 'b7', 13],
            formula: [1, 3, 5, 7, 13]
        }, {
            name: 'm9/13th',
            altName: '',
            orig_formula: [1, 'b3', 5, 'b7', 9, 13],
            formula: [1, 3, 5, 7, 9, 13]
        }, {
            name: 'm7/11/13th',
            altName: '',
            orig_formula: [1, 'b3', 5, 'b7', 11, 13],
            formula: [1, 3, 5, 7, 11, 13]
        }, {
            name: 'm7b5',
            altName: '',
            orig_formula: [1, 'b3', 'b5', 'b7'],
            formula: [1, 3, 5, 7]
        }, {
            name: 'm7b5/11',
            altName: '',
            orig_formula: [1, 'b3', 'b5', 'b7', 11],
            formula: [1, 3, 5, 7, 11]
        }, {
            name: 'm7+',
            altName: '',
            orig_formula: [1, 'b3', '#5', 'b7'],
            formula: [1, 3, 5, 7]
        }, {
            name: 'm7/11+',
            altName: '',
            orig_formula: [1, 'b3', '#5', 'b7', 11],
            formula: [1, 3, 5, 7, 11]
        }, {
            name: 'm6',
            altName: '',
            orig_formula: [1, 'b3', 5, 6],
            formula: [1, 3, 5, 6]
        }, {
            name: 'm6/9',
            altName: '',
            orig_formula: [1, 'b3', 5, 6, 9],
            formula: [1, 3, 5, 6, 9]
        }, {
            name: 'm6/7',
            altName: '',
            orig_formula: [1, 'b3', 5, 6, 7],
            formula: [1, 3, 5, 6, 7]
        }, {
            name: 'm6/9/7',
            altName: '',
            orig_formula: [1, 'b3', 5, 6, 7, 9],
            formula: [1, 3, 5, 6, 7, 9]
        }, {
            name: 'm6/11',
            altName: '',
            orig_formula: [1, 'b3', 5, 6, 11],
            formula: [1, 3, 5, 6, 11]
        }, {
            name: 'm6/9/11',
            altName: '',
            orig_formula: [1, 'b3', 5, 6, 9, 11],
            formula: [1, 3, 5, 6, 9, 11]
        }, {
            name: 'm6/9#11',
            altName: '',
            orig_formula: [1, 'b3', 5, 6, '#11'],
            formula: [1, 3, 5, 6, 11]
        }, {
            name: 'm7',
            altName: '',
            orig_formula: [1, 'b3', 5, 7],
            formula: [1, 3, 5, 7]
        }, {
            name: 'm9',
            altName: '',
            orig_formula: [1, 'b3', 5, 7, 9],
            formula: [1, 3, 5, 7, 9]
        }, {
            name: 'Dominant 7th',
            altName: '',
            orig_formula: [1, 3, 5, 'b7'],
            formula: [1, 3, 5, 7]
        }, {
            name: 'Dominant 7/6th',
            altName: '',
            orig_formula: [1, 3, 5, 'b7', 13],
            formula: [1, 3, 5, 7, 13]
        }, {
            name: 'Dominant 9th',
            altName: '',
            orig_formula: [1, 3, 5, 'b7', 9],
            formula: [1, 3, 5, 7, 9]
        }, {
            name: 'Dominant 13th',
            altName: '',
            orig_formula: [1, 3, 5, 'b7', 9, 13],
            formula: [1, 3, 5, 7, 9, 13]
        }, {
            name: 'Dominant 7sus',
            altName: '',
            orig_formula: [1, 4, 5, 'b7'],
            formula: [1, 4, 5, 7]
        }, {
            name: 'Dominant 7/6sus',
            altName: '',
            orig_formula: [1, 4, 5, 'b7', 13],
            formula: [1, 4, 5, 7, 13]
        }, {
            name: 'Dominant 11th',
            altName: '',
            orig_formula: [1, 5, 'b7', 9, 11],
            formula: [1, 5, 7, 9, 11]
        }, {
            name: 'Dominant 13sus',
            altName: '',
            orig_formula: [1, 5, 'b7', 9, 11, 13],
            formula: [1, 5, 7, 9, 11, 13]
        }, {
            name: 'Dominant 13#11th',
            altName: '',
            orig_formula: [1, 3, 5, 'b7', 9, '#11', 13],
            formula: [1, 3, 5, 7, 9, 11, 13]
        }, {
            name: 'Dominant 9#11th',
            altName: '',
            orig_formula: [1, 3, 5, 'b7', 9, '#11'],
            formula: [1, 3, 5, 7, 9, 11]
        }, {
            name: 'Dominant 9b5',
            altName: '',
            orig_formula: [1, 3, 'b5', 'b7', 9],
            formula: [1, 3, 5, 7, 9]
        }, {
            name: 'Dominant 7+',
            altName: '',
            orig_formula: [1, 3, '#5', 'b7'],
            formula: [1, 3, 5, 7]
        }, {
            name: 'Dominant 7b5',
            altName: '',
            orig_formula: [1, 3, 'b5', 'b7'],
            formula: [1, 3, 5, 7]
        }, {
            name: 'Dominant 7#9',
            altName: '',
            orig_formula: [1, 3, 5, 'b7', '#9'],
            formula: [1, 3, 5, 7, 9]
        }, {
            name: 'Dominant 7b9',
            altName: '',
            orig_formula: [1, 3, 5, 'b7', 'b9'],
            formula: [1, 3, 5, 7, 9]
        }, {
            name: 'Dominant 7#9+',
            altName: '',
            orig_formula: [1, 3, '#5', 'b7', '#9'],
            formula: [1, 3, 5, 7, 9]
        }, {
            name: 'Dominant 7b9+',
            altName: '',
            orig_formula: [1, 3, '#5', 'b7', 'b9'],
            formula: [1, 3, 5, 7, 9]
        }, {
            name: 'Dominant 7#9b5',
            altName: '',
            orig_formula: [1, 3, 'b5', 'b7', '#9'],
            formula: [1, 3, 5, 7, 9]
        }, {
            name: 'Dominant 7b9b5',
            altName: '',
            orig_formula: [1, 3, 'b5', 'b7', 'b9'],
            formula: [1, 3, 5, 7, 9]
        }, {
            name: 'Dominant 13b9',
            altName: '',
            orig_formula: [1, 3, 5, 'b7', 'b9', 13],
            formula: [1, 3, 5, 7, 9, 13]
        }, {
            name: 'Dominant 13b9#11',
            altName: '',
            orig_formula: [1, 3, 5, 'b7', 'b9', '#11', 13],
            formula: [1, 3, 5, 7, 9, 11, 13]
        }, {
            name: 'Dominant 13#9',
            altName: '',
            orig_formula: [1, 3, 5, 'b7', '#9', 13],
            formula: [1, 3, 5, 7, 9, 13]
        }, {
            name: 'Dominant 9+',
            altName: '',
            orig_formula: [1, 3, '#5', 'b7', 9],
            formula: [1, 3, 5, 7, 9]
        }, {
            name: '+',
            altName: '',
            orig_formula: [1, 3, '#5'],
            formula: [1, 3, 5]
        }, {
            name: '+11b9',
            altName: '',
            orig_formula: [1, 3, '#5', 'b7', 'b9', 11],
            formula: [1, 3, 5, 7, 9, 11]
        }, {
            name: 'Diminished 7th',
            altName: '',
            orig_formula: [1, 'b3', 'b5', 'bb7'],
            formula: [1, 3, 5, 7]
        }, {
            name: 'Diminished 7/7th',
            altName: '',
            orig_formula: [1, 'b3', 'b5', 6, 7],
            formula: [1, 3, 5, 6, 7]
        }, {
            name: 'Diminished 7/9th',
            altName: '',
            orig_formula: [1, 'b3', 'b5', 6, 9],
            formula: [1, 3, 5, 6, 9]
        }, {
            name: 'Diminished triad',
            altName: '',
            orig_formula: [1, 'b3', 'b5'],
            formula: [1, 3, 5]
        }];
    }
    
    chordformula() {
        var r = [], m = [], l = [], i = []; // array containers
        if ('' != this.note && '' != this.qualities && '' != this.scale) {
            for (var f = 0; f <= this.scales.length - 1; f++) {
                r[this.scales[f].name] = [];
                for (var c = 0; c <= this.notes.length - 1; c++) {
                    for (var d = 0; d <= this.scales[f].formula.length - 1; d++) 0 == d ? m.push(this.notes[c + (f + 1) - 1]) : this.scales[f].formula[d] + c < this.notes.length ? m.push(this.notes[this.scales[f].formula[d] + c]) : m.push(this.notes[this.scales[f].formula[d] + c - 12]);
                    r[this.scales[f].name].push({
                        name: this.notes[c],
                        scales: m
                    }), m = []
                }
            }
            for (var d = 0; d <= this.qualities.length - 1; d++) {
                l[this.note + this.qualities[d].name] = [];
                for (var h = 0; h <= r[this.scale].length - 1; h++) {
                    for (var c = 0; c <= this.qualities[d].orig_formula.length - 1; c++)
                        for (var f = 0; f <= r[this.scale][h].scales.length - 1; f++) {
                            var p = this.qualities[d].orig_formula[c] > r[this.scale][h].scales.length ? this.qualities[d].orig_formula[c] - r[this.scale][h].scales.length : this.qualities[d].orig_formula[c];
                            if (f + 1 == p) i.push(r[this.scale][h].scales[f]);
                            else if (f + 1 == this.qualities[d].formula[c] && 1 == isNaN(p)) {
                                for (var b = r[this.scale][h].scales[f], _ = 0; _ <= this.notes.length - 1; _++)
                                    if (this.notes[_] == b) {
                                        var v = $.inArray(b, this.notes);
                                        break
                                    }
                                'b' == p.charAt(0) ? i.push(this.notes[v - 1]) : '#' == p.charAt(0) && i.push(this.notes[v + 1])
                            }
                        }
                    if (this.qualities[d].name == this.quality && r[this.scale][h].name == this.note) {
                        // var g = '<span><label>chord name</label>' + this.note + this.quality + '</span><span><label>variations</label></span><span><label>scale</label>' + r[this.scale][h].scales + '</span><span><label>chord construction formula</label>' + this.qualities[d].orig_formula + ' / ' + i + '</span>';
                        l[this.note + this.qualities[d].name].push({
                            note: r[this.scale][h].name,
                            name: this.note + '' + this.quality,
                            scale: r[this.scale][h].scales,
                            chord_construction_formula: this.qualities[d].orig_formula,
                            shape: i
                        })
                        return l[this.note + this.qualities[d].name][0];
                    }
                    i = []
                }
            }
        }
    }

}