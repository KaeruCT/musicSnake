const hudInit = () => {
  const q = s => document.querySelector(s);

  const hud = q('#hud');
  hud.style.display = 'block';
  const body = document.body;
  const scoreEl = q('#score');
  const maxScoreEl = q('#maxScore');
  const canvas = q('#canvas');
  const gameOver = q('#gameOver');
  let maxScore = 0;
  scoreEl.style.left = canvas.offsetLeft + 40 + 'px';
  maxScoreEl.style.left = canvas.offsetLeft + canvas.clientWidth - 70 + 'px';

  const credits = '<small>Made with ❤️ by <a href="https://github.com/KaeruCT/">Andrés Villarreal</a><br>using <a href="https://tonejs.github.io/">ToneJS</a> and<br>Vanilla JavaScript</small>';

  const methods = {
    setScore: (score, d) => {
      scoreEl.innerText = score;
      scoreEl.className = 'changed';
      setTimeout(() => scoreEl.className = '', 500);

      if (d > 0) {
        body.style.backgroundColor = '#161616';
      } else if (d < 0) {
        body.style.backgroundColor = '#400';
      }
      setTimeout(() => body.style.backgroundColor = '#000', 100);

      if (!maxScore || player.maxScore > maxScore) {
        maxScore = player.maxScore;
        maxScoreEl.innerText = maxScore;
        maxScoreEl.className = 'changed';
        setTimeout(() => maxScoreEl.className = '', 500);
      }
    },
    levelChange: () => {
      body.style.backgroundColor = '#242';
      setTimeout(() => body.style.backgroundColor = '#000', 150);
    },
    gameOver: () => {
      setTimeout(() => body.style.backgroundColor = '#412', 300);
      body.style.backgroundColor = '#611';
      hud.style.display = 'none';
      canvas.style.display = 'none';
      gameOver.style.display = 'block';
      gameOver.innerHTML = '<h2>Game Over!</h2><small>Thanks for playing!</small><br><br>Your max score was: <h1>' + player.maxScore + '</h1><a href="#" onclick="window.location.reload();">Play again?</a><br><br>' + credits;
    },
  };

  methods.setScore(0);

  return methods;
};