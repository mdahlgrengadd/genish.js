data( './resources/audiofiles/amen.wav' ).then( amen => {
  // we'll use a single-sample-delay to store a sample
  // which we'll output repeatedly, thus in effect decreasing the sample rate
  hold = ssd(0)
  
  bitDepth   = param( 'bitDepth', 4, .5, 16 )
  sampleRate = param( 'sampleRate', .5, .01, 1 )
  
  // every time this counter wraps, we'll take a sample from the audiofile
  c = counter( sampleRate, 0, 1 )
  
  // read our audiofile
  audio = peek(
    amen, 
    accum( 1, 0, { min: 0, max:amen.buffer.length } ), 
    { mode:'samples' }
  )
  
  // math for bitcrushing
  bitMult = pow( bitDepth, 2 )
  crushed = div( floor( mul( audio, bitMult ) ), bitMult )
  
  sample = ternary( 
    c.wrap,   // if our counter has wrapped...
    crushed,  // ... get a new bit-crushed sample to store
    hold.out  // ... otherwise, repeat the last stored sample
  )

  // store the current sample for repeating
  hold.in( sample )
  
  play( sample, null, true ).then( node => {
    // create a simple gui using dat.GUI
    gui = new dat.GUI({ width: 400 }) 
    gui.add( node, 'bitDepth',   .5, 16 )
    gui.add( node, 'sampleRate', .01, 1 )  
  })
})
