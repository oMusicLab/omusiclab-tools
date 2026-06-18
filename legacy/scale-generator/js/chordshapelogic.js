function ChordShapeLogic(){
	var NotesPerFret = []
	// CREATE NOTES ARRAY
	$('.noteShape').each(function(){
		var x_axis = $(this).parent().data('x-axis')
		var y_axis = $(this).parent().data('y-axis')
		var ChordName = $(this).parent().attr('data-chord-name')
		NotesPerFret.push({'fret':y_axis,'string':x_axis,'chordname':ChordName})
	})
	// GET SHAPE NOTES
	var chordShape = [] // possible notes that could be used in chord shaping
	for (var x = 0; x <= NotesPerFret.length - 1; x++){
		if (NotesPerFret[x].fret <= 4){
			chordShape.push({'string':NotesPerFret[x].string,'fret':NotesPerFret[x].fret,'fingerPosition':0})
		}
	}
    function countNotesInFret(){
	    var counts = {} // count notes in each fret
		$.each(chordShape, function(key,value) {
			if (!counts.hasOwnProperty(value.fret)) {
				counts[value.fret] = 1
			} else {
				counts[value.fret]++
			}
		})
		return counts
	}
	// GET BARRE POSITIONS
    var barreChord = 0 // count of barre in chord shape (4 frets)
	for (var t = 1; t <= 4; t++){
		for (var e = 0; e <= chordShape.length - 1; e++){
    // 		if (countNotesInFret()[t] > 1 && barreChord == 0 && chordShape[e].fret > t){ barreChord++; alert(barreChord)}
    	}
    }
	// GET FINGER POSITIONS
	var fingerNumber = 1 // maximum is 4. Value became `0` if it's open string. Value became `x` if it's a dead string
	for (var e = 0; e <= chordShape.length - 1; e++){
		var usedIndex = chordShape.findIndex(z => z.string == chordShape[e].string)
		// change finger position value from array
		if (chordShape[e].fret > 0 && chordShape[e].fret == chordShape[usedIndex].fret) {
			chordShape[e].fingerPosition = fingerNumber++; 
		}
		else if (chordShape[e].fret > 0 && chordShape[e].string == chordShape[usedIndex].string && barreChord > 0) {
			// delimit notes (not open note) behind the barre position
			chordShape[usedIndex].fingerPosition = 'delimit';
		}
		else if ((chordShape[e].fret > 0 && chordShape[e].fret != chordShape[usedIndex].fret && barreChord == 0)||
				 (chordShape[e].fret == 0 && chordShape[e].fret == chordShape[usedIndex].fret && barreChord > 0)){
			// delimit notes that were in the same string as open note was placed (no barre)
			// delimit open note behind the barre position
			chordShape[e].fingerPosition = 'delimit'; 
		}
		else if (chordShape[e].fret == 0 && chordShape[e].fret != chordShape[usedIndex].fret){
			chordShape[e].fingerPosition = 'x'; 
		}
	}
	// SORT BY STRING ASC
	chordShape.sort(function(a, b){
	    var aIndex= a.string, bIndex= b.string;
	    if (aIndex == bIndex) return 0;
	    return aIndex > bIndex ? 1 : -1;
	})
	// OUTPUT CODE
	var stringLength = 7 // get value from instrument selected
	var htmlValue = ''
	for (var w = 0; w <= chordShape.length - 1; w++){
		for (var g = 1; g <= stringLength; g++){
			if (chordShape[w].fingerPosition != 'delimit'){
				if (chordShape[w].string == g){
					htmlValue = htmlValue+chordShape[w].fret
				}
			}
		}
	}
	$('#TEMP').append('<span>CODE: '+htmlValue+'</span>')
}