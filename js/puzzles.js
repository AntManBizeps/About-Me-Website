(function() {
    const canvas = document.getElementById('puzzleCanvas');
    const ctx = canvas.getContext('2d');
    const imgInput = document.getElementById('imgInput');
    const rowsInput = document.getElementById('rowsInput');
    const colsInput = document.getElementById('colsInput');
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    const msgDiv = document.getElementById('message');

    let img = new Image();
    let rows = 3, cols = 3;
    let tileW, tileH;
    let tiles = [];
    let blankPos = { x: 0, y: 0 };
    let hovered = null;
    let playing = false;
    let sourceCanvas, sourceCtx;

    function resizeCanvas() {
      const viewportWidth = window.innerWidth;
      let size = viewportWidth < 667 ? Math.min(viewportWidth * 0.9, 600) : 600;
      canvas.width = size;
      canvas.height = size;
      if (!img.src) return;

      sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = size;
      sourceCanvas.height = size;
      sourceCtx = sourceCanvas.getContext('2d');

      const imgRatio = img.naturalWidth / img.naturalHeight;
      let sx, sy, sWidth, sHeight;
      if (imgRatio > 1) {
        sHeight = img.naturalHeight;
        sWidth = img.naturalHeight;
        sx = (img.naturalWidth - sWidth) / 2;
        sy = 0;
      } else {
        sWidth = img.naturalWidth;
        sHeight = img.naturalWidth;
        sx = 0;
        sy = (img.naturalHeight - sHeight) / 2;
      }
      sourceCtx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, size, size);

      if (playing) {
        tileW = canvas.width / cols;
        tileH = canvas.height / rows;
        draw();
      }
    }

    window.addEventListener('resize', resizeCanvas);

    function saveState() {
      if (!playing) return;
      localStorage.setItem('puzzleState', JSON.stringify({
        tiles,
        blankPos,
        rows,
        cols,
        imgSrc: img.src,
        rowsValue: rowsInput.value,
        colsValue: colsInput.value,
        imgName: img.dataset.name || ''
      }));
    }

    function loadState() {
      const saved = localStorage.getItem('puzzleState');
      if (!saved) return false;
      const state = JSON.parse(saved);
      rows = state.rows;
      cols = state.cols;
      rowsInput.value = state.rowsValue;
      colsInput.value = state.colsValue;
      tiles = state.tiles;
      blankPos = state.blankPos;
      img.src = state.imgSrc;
      img.dataset.name = state.imgName;
      playing = true;
      startBtn.disabled = false;
      restartBtn.disabled = false;
      resizeCanvas();
      return true;
    }

    function initTiles() {
      tiles = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          tiles.push({
            correctPos: { x, y },
            currentPos: { x, y }
          });
        }
      }
      blankPos = { x: 0, y: 0 };
    }

    function shuffleTiles(moves) {
      const dirs = [{ x:1,y:0 }, { x:-1,y:0 }, { x:0,y:1 }, { x:0,y:-1 }];
      for (let i = 0; i < moves; i++) {
        const neighbors = dirs
          .map(d => ({ x: blankPos.x + d.x, y: blankPos.y + d.y }))
          .filter(p => p.x>=0 && p.x<cols && p.y>=0 && p.y<rows);
        const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
        moveTile(pick);
      }
    }

    function moveTile(toPos) {
      const idxTile = tiles.findIndex(t => t.currentPos.x===toPos.x && t.currentPos.y===toPos.y);
      const idxBlank = tiles.findIndex(t => t.currentPos.x===blankPos.x && t.currentPos.y===blankPos.y);
      if(idxTile<0||idxBlank<0) return;
      [tiles[idxTile].currentPos, tiles[idxBlank].currentPos] =
        [tiles[idxBlank].currentPos, tiles[idxTile].currentPos];
      blankPos = { ...toPos };
      saveState();
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      tileW = canvas.width / cols;
      tileH = canvas.height / rows;
      tiles.forEach(t => {
        const { x: cx, y: cy } = t.currentPos;
        if (cx===blankPos.x && cy===blankPos.y) {
          ctx.fillStyle = 'white';
          ctx.fillRect(cx*tileW, cy*tileH, tileW, tileH);
        } else {
          const sx = t.correctPos.x * tileW;
          const sy = t.correctPos.y * tileH;
          ctx.drawImage(sourceCanvas, sx, sy, tileW, tileH,
                        cx*tileW, cy*tileH, tileW, tileH);
        }
      });
      if (hovered) {
        ctx.strokeStyle = '#33ff33';
        ctx.lineWidth = 5;
        ctx.strokeRect(hovered.x*tileW, hovered.y*tileH, tileW, tileH);
      }
    }

    function isAdjacent(pos) {
      const dx = Math.abs(pos.x-blankPos.x);
      const dy = Math.abs(pos.y-blankPos.y);
      return dx+dy===1;
    }

    function checkWin() {
      return tiles.every(t =>
        t.currentPos.x===t.correctPos.x && t.currentPos.y===t.correctPos.y
      );
    }

    function getEventPos(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches? e.touches[0].clientX : e.clientX;
      const clientY = e.touches? e.touches[0].clientY : e.clientY;
      return {
        x: Math.floor((clientX-rect.left)/tileW),
        y: Math.floor((clientY-rect.top)/tileH)
      };
    }

    function handleClick(e) {
      if (!playing) return;
      const pos = getEventPos(e);
      if (!isAdjacent(pos)) return;
      moveTile(pos);
      hovered = null;
      draw();
      if (checkWin()) {
        playing = false;
        msgDiv.textContent = 'Congratulations! You solved the puzzle!';
        restartBtn.disabled = false;
        localStorage.removeItem('puzzleState');
      }
    }

    canvas.addEventListener('mousemove', e => {
      if (!playing) return;
      const pos = getEventPos(e);
      hovered = isAdjacent(pos)? pos : null;
      draw();
    });
    canvas.addEventListener('touchstart', handleClick, { passive: true });
    canvas.addEventListener('click', handleClick);

    startBtn.addEventListener('click', () => {
      if (!img.src) { alert('Choose the picture first!'); return; }
      rows = +rowsInput.value;
      cols = +colsInput.value;
      playing = true;
      initTiles();
      shuffleTiles(rows * cols * 10);
      msgDiv.textContent = '';
      restartBtn.disabled = false;
      resizeCanvas();
      draw();
      saveState();
    });

    restartBtn.addEventListener('click', () => {
      shuffleTiles(rows * cols * 10);
      msgDiv.textContent = '';
      playing = true;
      draw();
      saveState();
    });

    imgInput.addEventListener('change', () => {
      const file = imgInput.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        img.src = e.target.result;
        img.dataset.name = file.name;
        localStorage.removeItem('puzzleState');
      };
      reader.readAsDataURL(file);
    });

    img.onload = () => {
      startBtn.disabled = false;
      resizeCanvas();
      draw();
    };

    loadState();
  })();