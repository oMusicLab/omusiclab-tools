$(document).ready( function() {
    
    // Draw Piano
    var notes         = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'], 
        octaves       = [4,5], 
        flats_sharps  = [1,3,6,8,10], 
        data_index    = 0, 
        curr_note     = '', 
        black_white   = 'piano-black-key text-light';
    $.each( octaves, function(octave_index, octave_value) {
        $.each( notes, function(note_index, note_value) {
            curr_note   = note_value + octave_value
            black_white = ( note_index == 1 || note_index == 3 || note_index == 6 || note_index == 8 || note_index == 10 )?'piano-black-key text-light':'piano-white-key text-dark'
            $('#piano').append('<button title="' + curr_note + '" class="piano-keys ' + black_white + '" name="' + curr_note + '" data-octave="' + octave_value + '" data-note="' + note_value + '" data-index="' + data_index + '"></button>')
            data_index++
            if ( (note_index == (notes.length - 1)) && (octave_index == (octaves.length - 1)) && (octave_value < 9 && octave_value >= 3 ) ) 
                $('#piano').append('<button title="' + notes[0] + parseInt(octave_value + 1) + '" class="piano-keys ' + black_white + '" name="' + notes[0] + parseInt(octave_value + 1)  + '"></button>')
        })
    })

    // Synths are capable of a wide range of sounds depending on their settings
    var piano = new Tone.Synth({
    }).toMaster()
    
    // Events
    // $('#piano').on('touchstart', function(e) {
    //     piano.triggerAttack(e.target.name)
    // })
    // $('#piano').on('touchend', function(e) {
    //     piano.triggerRelease()
    // })

    $('#piano').on('mousedown touchstart', function(e) {
        piano.triggerAttack(e.target.name)
    })
    $('#piano').on('mouseup touchend', function(e) {
        piano.triggerRelease()
    })
    
    // Check oMusic chord formula
    // var myNote = new oMusic('D', 'Major (triad)', 'Major');
    // console.log(myNote.chordformula())
    // $.each(myNote.chordformula().shape, function(index, value){
    //     $('body').append(value);
    // })
    $('#catalog-chord, #catalog-quality, #catalog-scale').on('change', function(){
        var note                = $('#catalog-chord').val(),
            quality             = $('#catalog-quality').val(),
            scale               = $('#catalog-scale').val(),
            first_note_index    = '';
        if (note != '' && quality != '' && scale != '') {
            var myNote = new oMusic(note, quality, scale)
            /**
             * @class oMusic
             * @function chordformula()
             * @jsonIndex = note, name, scale, chord_construction_formula, shape 
             */
            $('#piano .piano-keys').removeClass('selected')
            var element_note;
            $.each(myNote.chordformula().shape, function(index, value){
                // console.log('current index: ' + $('#piano .piano-keys[data-note="' + value + '"]').data('index'))
                element_note = $('#piano .piano-keys[data-note="' + value + '"]')
                if ( index == 0 ){
                    // $.each(element_note, function(){
                        first_note_index = element_note.eq(0).data('index')
                        element_note.eq(0).addClass('selected')
                    // })
                }
                else {
                    var array_note_pushed = [];
                    $.each(element_note, function(){
                        if ( $(this).data('index') > first_note_index ){
                            var count_pushed_notes = 0,
                                current_element_note = $(this);
                            $.each(array_note_pushed, function(note_pushed_index, note_pushed_value){
                                if (note_pushed_value != current_element_note.data('index'))
                                    count_pushed_notes++
                            })
                            if ( count_pushed_notes <= 0 ) {
                                $(this).addClass('selected')
                                array_note_pushed.push($(this).data('index'))
                            }
                        }
                    })
                }
                // console.log('first note index: ' + first_note_index + ' ' + 'current index: ' + element_note.data('index'))
            })
            var $html = '<li><span class="silent">Chord name: </span>' + myNote.chordformula().name + ' <span class="silent"> | </span> ';
                $html += '<span class="silent">' + scale + ' scale notes: </span>' + myNote.chordformula().scale + ' <span class="silent"> | </span> ';
                $html += '<span class="silent">Chord construction formula: </span>' + myNote.chordformula().chord_construction_formula + ' <span class="silent"> or </span> ' + myNote.chordformula().shape + '</li>';
            $('#debugger').html($html)
        }

        // Force landscape mode
        // screen.orientation.lock('landscape');
    })
    
});