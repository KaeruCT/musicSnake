const parts = {
  KICK: 1,
  HATS: 2,
  SNARE: 3,
  BASS: 4,
  CHORDS: 5,
  MEL1: 6,
  MEL2: 7,
  CONGA: 8,
};
let PART_FREQ = 4;
const MIN_PART_FREQ = 1;
const EMPTY = 0;
const DEAD = -1;
const WIDTH = 376;
const HEIGHT = 500;
let BOARD_WIDTH = 3;
const MAX_BOARD_WIDTH = 5;
const LINE_WIDTH = 2;
const SQUARE_DIM = 30;
const PULSE_SIZE = 50;
const LINE_COLOR = '#30363a';
const H_LINE_COLOR = '#222';
const H_LINE_COLOR_BEAT = '#60666a';
const H_LINE_WIDTH = 2;
const BPM = 90;
const MAX_BPM = 150;
const BPM_INCREASE = 5;
const LEVEL_SCORE = 8;
const SECONDS_PER_BAR = () => 60 / (Tone.Transport.bpm.value || 1);
const DIST_PER_BAR = HEIGHT / 6;
let PUNISHMENT = 1;
const INITIAL_PLAYER_COLOR = '#666666';
const COLORS = [
  '#20262a',
  '#66ffaa',
  '#ff66aa',
  '#aaff66',
  '#ffaa66',
  '#66aaff',
  '#aa66ff',
  '#ff66ff',
  '#66ff66',
];

const SAMPLES = {
  snare: './files/snare.wav'
};
