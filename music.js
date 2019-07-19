const initializeInstruments = onLoaded => {
  Tone.Master.volume.value = -12;
  Tone.context.latencyHint = 'playback';
  const freeverb3 = new Tone.Freeverb(0.01, 10000);
  freeverb3.chain(new Tone.Volume(-18), Tone.Master);
  const shaker = new Tone.NoiseSynth({
    volume: -4,
    envelope: {
      attack: 0.003,
      decay: 0.003,
      sustain: 0
    }
  }).connect(freeverb3);

  const kick = new Tone.MembraneSynth({
    volume: 2,
    envelope: {
      decay: 0.1,
      sustain: 0.01,
      release: 0.2,
    }
  }).toMaster();

  const hat = new Tone.NoiseSynth({
    volume: -6,
    envelope: {
      attack: 0.0005,
      decay: 0.1,
      release: 0.05,
      sustain: 0.0001,
    }
  }).connect(freeverb3);

  const crash = new Tone.NoiseSynth({
    volume: 4,
    envelope: {
      attack: 0.0001,
      decay: 2,
      release: 2,
      sustain: 0.1,
    }
  }).connect(freeverb3);

  const freeverb = new Tone.Freeverb(0.01, 500);
  freeverb.chain(new Tone.Volume(-12), Tone.Master);
  const chordBg = new Tone.PolySynth(3, Tone.Synth).connect(freeverb);
  chordBg.set({
    oscillator: {
      type: 'amsquare',
    },
    filter: {
      type: 'notch'
    },
    envelope: {
      attack: 0.0001,
      decay: 0.5,
      sustain: 0.5,
      release: 0.1,
    }
  });

  const freeverb2 = new Tone.Freeverb(0.05, 300);
  freeverb2.chain(new Tone.Volume(1), Tone.Master);
  const mel2 = new Tone.DuoSynth({
    volume: -4,
    harmonicity: 2,
    voice0: {
      oscillator: {
        type: 'triangle'
      },
      filter: {
        type: 'notch'
      },
    },
    voice1: {
      oscillator: {
        type: 'amsawtooth'
      },
      filter: {
        type: 'notch'
      },
    },
    envelope: {
      attack: 0.001,
      decay: 0.5,
      sustain: 1,
      release: 0.6
    }
  }).connect(freeverb2);
  const mel = new Tone.DuoSynth({
    volume: -14,
    harmonicity: 1,
    voice0: {
      oscillator: {
        type: 'fmsquare'
      },
      filter: {
        type: 'notch'
      },
      envelope: {
        attack: 0.001,
        decay: 0.5,
        sustain: 0.9,
        release: 1.5,
      }
    },
    voice1: {
      oscillator: {
        type: 'fmsine'
      },
      filter: {
        type: 'notch'
      },
      envelope: {
        attack: 0.0001,
        decay: 0.5,
        sustain: 1,
        release: 2,
      }
    },
  }).connect(Tone.Master);

  const bass = new Tone.Synth({
    volume: -6,
    oscillator: {
      type: 'fmtriangle'
    },
    envelope: {
      attack: 0.001,
      decay: 0.5,
      sustain: 0.7,
      release: 1,
    }
  }).connect(Tone.Master);

  const snare = new Tone.Sampler({ C2: SAMPLES.snare }, () => {
    onLoaded();
  }).connect(freeverb3);
  snare.volume.value = 6;

  const conga = new Tone.MembraneSynth({
    volume: 9,
    envelope: {
      decay: 0.001,
      sustain: 0.05,
      release: 0.8,
    }
  }).connect(freeverb3);

  const chords = [
    ['G3', 'A#3', 'D4'],
    ['C3', 'D#3', 'G4'],
    ['A#3', 'D#3', 'G4'],
    ['G3', 'A#3', 'D4'],
    ['F3', 'G#3', 'C4'],
  ];

  const note = (val, fill, tr) => {
    const arr = [transpose(val, tr || 0)];
    for (let i = 1; i < fill; i++) arr.push(0);
    return arr;
  };

  const transpose = (note, tr) => {
    if (!/\d/.test(note) || !note.replace) return note;
    return note.replace(/\d/, match => parseInt(match) + tr);
  };

  const arp = (vals, fill, tr) => {
    const arr = [];
    for (let i = 0; i < fill; i++) arr.push(transpose(vals[i % vals.length], tr || 0));
    return arr;
  };

  const rhythms = [
    [1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0],
    [0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1],
    [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0],
    [1, 0],
    [1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0],
    [1, 0, 1, 0, 1, 1, 0, 1],
  ];
  const randNotes = (notes, size) => {
    const arr = [];
    const rhythm = randValue(rhythms);
    for (let i = 0; i < size; i++) {
      arr.push(rhythm[i % rhythm.length] ? randValue(notes) : 0);
    }
    return arr;
  };

  const instrumentParts = {
    [parts.KICK]: {
      fn: (time, note) => kick.triggerAttackRelease(note, '8n', time),
      patterns: () => {
        const normal = [...note('C1', 4)];
        const interesting = [...note('C1', 4), ...note('C1', 4), ...note('C1', 4), ...note('C1', 2), ...note('C1', 2)];
        return [
          normal,
          normal,
          normal,
          normal,
          interesting,
          interesting,
        ];
      },
    },
    [parts.CONGA]: {
      fn: (time) => conga.triggerAttackRelease('F1', '8n', time),
      patterns: () => ([
        [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1],
      ])
    },
    [parts.HATS]: {
      fn: (time) => {
        if (choice % 2 === 0) {
          hat.triggerAttackRelease('8n', time);
        } else {
          shaker.triggerAttackRelease('8n', time);
        }
      },
      patterns: () => {
        const boring = [0, 1, 0, 1, 0, 0, 1, 0];
        const interesting = [0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1];
        const veryInteresting = [
          0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0,
        ];

        return [
          boring,
          interesting,
          boring,
          interesting,
          boring,
          veryInteresting,
        ]
      },
      update: () => {
        if (!this.choice) this.choice = 0;
        this.choice += 1;
      },
    },
    [parts.SNARE]: {
      fn: (time, note) => snare.triggerAttackRelease(note, '8n', time),
      patterns: () => {
        const normal = [...note(0, 4), ...note('C2', 4), ...note(0, 4), ...note('C2', 4)];
        const break1 = [...note(0, 4), ...note('C2', 4), ...note(0, 4), 'C2', 0, 0, 'C2'];
        const break2 = [...note(0, 4), ...note('C2', 4), ...note(0, 4), 'C2', 0, 'C2', 'C2'];
        return [
          normal,
          break1,
          normal,
          break2,
          normal,
          break1,
        ]
      },
    },
    [parts.BASS]: {
      fn: (time, notes) => bass.triggerAttackRelease(notes, '1n', time),
      patterns: () => [
        [
          'C2', ...note('G2', 2), ...note('A#2', 9), ...note('G#2', 2), ...note('G2', 2), ...note('C2', 2), 'G2', ...note('A#2', 8), 'C3', ...note('A#2', 2), ...note('G#2', 2), 'C2', ...note('G2', 2), ...note('G#2', 8), 'G2', ...note('F2', 2), ...note('D#2', 2), ...note('D2', 8), ...note('C2', 8),
        ]
      ],
    },
    [parts.CHORDS]: {
      fn: (time, notes) => {
        chordBg.triggerAttackRelease(notes, '4n', time);
      },
      patterns: () => {
        const justChords = [
          ...note(chords[0], 8),
          ...note(chords[0], 8),
          ...note(chords[1], 8),
          ...note(chords[1], 8),
          ...note(chords[2], 8),
          ...note(chords[2], 8),
          ...note(chords[3], 8),
          ...note(chords[4], 4),
          ...note(chords[4], 4),
        ];

        return [
          justChords,
          justChords,
          justChords,
          justChords,
          justChords,
          justChords,
        ];
      },
    },
    [parts.MEL1]: {
      fn: (time, notes, bar) => {
        if (bar === 2 || bar === 3 || bar === 5) {
          mel.triggerAttackRelease(notes, '8n', time, 0.4); // lower velocity for high pitched sections
        } else {
          mel.triggerAttackRelease(notes, '8n', time);
        }
      },
      patterns: () => {
        const origMel = [
          ...note('C5', 2), 'D5', 'D#5', 'F5', ...note('G5', 8),
          'F5', 'G5', ...note('A#5', 3), ...note('G#5', 2), ...note('G5', 2), 'F5', ...note('G5', 6), 'C5',
          ...note('D#5', 2), ...note('G#5', 3), ...note('G5', 2), 'F5', ...note('G5', 7), 'D#5', 'F5', 'D#5', ...note('G5', 3), ...note('F5', 3), ...note('D5', 2), ...note('D#5', 3), ...note('D5', 3), ...note('C5', 2)
        ];
        const intro = [
          ...note(0, 4),
          ...note(chords[0][1], 4, 1),
          ...note(chords[0][0], 4, 1),
          ...note(chords[0][0], 8, 1),
          ...note(chords[1][0], 8, 1),
          ...note(chords[1][2], 2, 1),
          ...note(chords[1][1], 2, 1),
          ...note(chords[1][0], 4, 1),
          ...note(chords[2][0], 8, 1),
          ...note(chords[2][1], 8, 1),
          ...note(chords[3][0], 4, 1),
          ...note(chords[3][2], 4, 1),
          ...note(chords[4][0], 2, 1),
          ...note(chords[4][1], 2, 1)
        ];
        const arpeggio = [
          ...arp(chords[0], 8, 1),
          ...arp(chords[0], 8, 1),
          ...arp(chords[1], 8, 1),
          ...arp(chords[1], 8, 1),
          ...arp(chords[2], 8, 1),
          ...arp(chords[2], 8, 1),
          ...arp(chords[3], 8, 1),
          ...arp(chords[4], 4, 1),
          ...arp(chords[4], 4, 1),
        ];
        return [
          intro.map(n => transpose(n, -1)),
          origMel.map(n => transpose(n, -1)),
          origMel,
          arpeggio,
          arpeggio.map(n => transpose(n, -1)),
          origMel,
        ];
      }
    },
    [parts.MEL2]: {
      fn: (time, note) => mel2.triggerAttackRelease(note, '16n', time),
      patterns: () => [
        [
          ...randNotes(chords[0], 16),
          ...randNotes(chords[1], 16),
          ...randNotes(chords[2], 16),
          ...randNotes(chords[3], 8),
          ...randNotes(chords[4], 8),
        ]
      ],
    }
  };
  return { crash, instrumentParts };
};
const musicSetup = (onLoaded, onBeat) => {
  let b = 0;
  Tone.start();
  Tone.Transport.bpm.value = BPM;

  let cachedPatterns = {};
  const { instrumentParts, crash } = initializeInstruments(onLoaded);

  let score = 0;
  let levelChange = 0;

  const increaseFreq = () => {
    if (PART_FREQ > MIN_PART_FREQ) {
      PART_FREQ -= 1;
      return true;
    }
    return false;
  };

  const increaseBpm = () => {
    const newBpm = Tone.Transport.bpm.value + BPM_INCREASE;
    if (newBpm < MAX_BPM) {
      Tone.Transport.bpm.rampTo(newBpm, 2);
      return true;
    }
    return false;
  };

  const increaseWidth = () => {
    if (BOARD_WIDTH < MAX_BOARD_WIDTH) {
      BOARD_WIDTH += 1;
      return true;
    }
    return false;
  };

  const levelChanges = [
    increaseWidth,
    increaseFreq,
  ];

  Tone.Transport.scheduleRepeat(time => {
    onBeat();

    if (score < player.score) {
      score = player.score;
      if (score > 0 && score % LEVEL_SCORE === 0) {
        const success = levelChanges[levelChange % levelChanges.length]();
        if (!success) {
          increaseBpm();
        }
        levelChange += 1;
        PUNISHMENT = levelChange;
        hud.levelChange();
      }
    }
  }, '4n');

  let songPart = 0;
  const patternLengths = {};
  Tone.Transport.scheduleRepeat(time => {
    enabledParts.forEach(i => {
      const instrument = instrumentParts[i];
      if (!instrument) return; // TODO: shouldn't be needed when all instruments are defined

      if (!cachedPatterns[i]) {
        const allPatterns = instrument.patterns();
        cachedPatterns[i] = allPatterns[songPart % allPatterns.length];
        patternLengths[i] = allPatterns.length;
      }
      const pattern = cachedPatterns[i];
      const note = pattern[b % pattern.length];
      instrument.update && instrument.update();
      if (note) {
        instrument.fn(time, note, songPart % patternLengths[i]);
      }
    });
    b += 1;

    if (b % 64 === 0) {
      cachedPatterns = {};
      songPart += 1;
      crash.triggerAttackRelease('8n', time);

      // add snare if it's not here yet (i really want it)
      if (songPart >= 4) addMusicPart(parts.SNARE);
    }

    if (b % 256 === 0) {
      if (enabledParts[initialPartsSize]) {
        // always keep at least initialPartsSize parts
        removeMusicPart(enabledParts[initialPartsSize]);
      }
    }
  }, '16n');
};

let enabledParts = [parts.KICK, parts.HATS];
const initialPartsSize = enabledParts.length;

const removeMusicPart = toRemove => {
  enabledParts = enabledParts.filter(part => part !== toRemove);
};

const addMusicPart = part => {
  if (!enabledParts.includes(part)) {
    enabledParts.push(part);
  }
};

const musicStart = () => Tone.Transport.start();
const musicStop = () => Tone.Transport.stop();