/* ====================================================================
   Research page — interactive negation-circuit explorer.
   Data below is the actual output of the experiment (see
   research/negation-circuit-downloads/RESULTS.md for the full write-up).
   ==================================================================== */
(function () {
  'use strict';

var PATCHING_SCORES = [
  [0.00301,0.02073,0.00427,0.00059,0.00575,-0.00129,0.01544,-0.01882,-0.01131,0.02462,-0.03038,-0.01368],
  [-0.04008,0.00053,-0.01499,0.03035,0.01112,-0.05885,-0.00943,-0.01029,0.00285,-0.00899,-0.00797,0.00461],
  [-0.08293,-0.08485,-0.00372,0.00240,-0.08640,-0.00894,-0.00840,-0.00511,-0.00242,0.00508,-0.03217,0.08194],
  [-0.00357,0.00555,-0.01149,0.00210,0.00199,-0.00693,-0.03348,0.00591,0.00627,-0.01934,0.07209,-0.06334],
  [0.02276,-0.07253,-0.03409,-0.00198,0.00214,0.00691,0.02531,0.00787,-0.01033,-0.07896,0.00825,0.03598],
  [0.00217,0.00137,0.03952,-0.09295,0.00046,-0.01296,0.04879,0.00187,0.00030,0.00133,-0.00916,0.06755],
  [-0.03427,0.00223,-0.01488,0.00695,0.01599,-0.01480,0.04105,0.01152,-0.13529,0.00188,-0.00881,0.11742],
  [0.02935,0.00442,0.00003,0.04531,-0.00460,0.05466,-0.01940,-0.00132,-0.07144,0.14182,-0.00247,-0.00125],
  [-0.05910,-0.00125,-0.06754,0.00386,-0.03803,0.28612,-0.00412,0.09773,-0.04986,0.04783,0.01163,-0.00422],
  [-0.00984,-0.00746,-0.05548,0.24646,-0.00701,0.00179,0.00296,-0.01400,0.03636,-0.00415,0.25734,-0.00116],
  [0.00902,-0.00402,-0.00067,-0.00207,-0.00123,0.11033,-0.00565,0.02128,0.00447,0.55063,0.00346,0.01216],
  [-0.02277,-0.03059,0.00710,0.00861,-0.06161,0.00529,-0.00863,-0.03045,0.24466,-0.00133,0.13088,-0.02820]
];

var DLA_SCORES = [
  [0.11614,0.05977,0.34289,-0.27722,-0.02073,0.39383,0.18451,0.33019,0.21197,-0.37112,-0.09070,1.29190],
  [-0.34261,0.11605,-0.16654,-0.91667,0.33631,1.18797,0.12342,-0.22098,-0.33279,-0.52001,0.35626,-0.64718],
  [-0.09314,-0.25809,0.81179,-0.12666,-0.01755,0.07956,-0.12350,-0.50134,-0.67737,1.10570,1.10842,-0.34117],
  [-0.43622,0.01235,0.08559,-0.02014,0.22628,-0.50741,-0.08477,0.59685,0.12897,-0.51065,-0.23222,0.17183],
  [0.05664,-0.50421,-0.10946,0.72235,-0.18863,0.10231,0.15773,0.26040,-0.61837,-0.31031,-0.39743,0.18482],
  [0.56877,0.11378,-0.50851,-0.89095,-0.16489,0.03279,-0.41615,0.38685,0.81376,-1.11453,0.01951,-0.70722],
  [0.64655,-0.02195,-0.63610,-0.00431,-0.16505,1.28953,-0.66915,0.18964,0.14967,0.49312,-0.27639,-0.48530],
  [-0.18856,0.07455,0.23654,-0.82951,-0.31792,0.85819,-1.21627,-0.08255,0.77277,0.16887,-0.04829,0.08876],
  [0.68019,-0.10216,-0.25890,0.76149,0.04798,0.19387,-0.04326,-0.76771,1.19940,-0.28066,-0.00818,-0.10309],
  [0.26811,-0.09555,0.53786,-0.05273,0.12063,-0.31080,-0.03945,-0.11601,-0.29276,0.35512,-1.63525,-0.27719],
  [0.08520,0.60741,0.53111,0.06089,1.84198,-0.71269,-0.08476,-0.06208,-0.66840,-2.93325,-0.12996,1.72509],
  [-0.91082,0.10279,0.61831,-0.37463,0.08335,-0.83878,0.02878,-0.49070,0.39674,-0.34031,-0.21699,0.28005]
];

var MLP_SCORES = [-0.05229,-0.06896,-0.24416,-0.16470,-0.18018,-0.36016,-0.01329,0.09340,0.69317,-0.80267,0.31810,-0.37332];

var SUSPECT_HEADS = [[10, 9], [10, 4], [10, 11], [9, 10], [0, 11], [6, 5], [7, 6], [8, 8], [1, 5], [5, 9]];

  var N_LAYERS = 12;
  var N_HEADS = 12;

  function suspectKey(l, h) { return l + '-' + h; }
  var SUSPECT_SET = {};
  SUSPECT_HEADS.forEach(function (pair) { SUSPECT_SET[suspectKey(pair[0], pair[1])] = true; });

  // Diverging color scale (violet-ish negative -> neutral -> cyan-ish positive),
  // matching the site's existing accent palette rather than introducing new hues.
  function colorFor(value, maxAbs) {
    var t = Math.max(-1, Math.min(1, value / maxAbs)); // -1..1
    if (t >= 0) {
      // 0 -> neutral surface, 1 -> cyan
      var a = t;
      return 'rgba(77, 232, 212, ' + (0.12 + a * 0.78).toFixed(3) + ')';
    } else {
      var b = -t;
      return 'rgba(255, 107, 130, ' + (0.12 + b * 0.78).toFixed(3) + ')';
    }
  }

  function maxAbsOf(matrix) {
    var m = 0;
    matrix.forEach(function (row) {
      row.forEach(function (v) { if (Math.abs(v) > m) m = Math.abs(v); });
    });
    return m || 1;
  }

  function initCircuitWidget(widget) {
    var grid = widget.querySelector('[data-circuit-grid]');
    var tooltip = widget.querySelector('[data-circuit-tooltip]');
    var toggleBtns = Array.prototype.slice.call(widget.querySelectorAll('.circuit-toggle-btn'));
    var yLabels = widget.querySelector('.circuit-grid-labels-y');
    if (!grid || !tooltip) return;

    // Layer labels down the left edge (0, 3, 6, 9, 11 — sparse, not every row,
    // to avoid clutter at this size).
    [0, 3, 6, 9, 11].forEach(function (n) {
      var span = document.createElement('span');
      span.textContent = 'L' + n;
      yLabels.appendChild(span);
    });

    var currentMetric = 'patching';

    function dataFor(metric) {
      return metric === 'patching' ? PATCHING_SCORES : DLA_SCORES;
    }

    function describe(metric, layer, head, value) {
      var headLabel = 'L' + layer + 'H' + head;
      var isSuspect = SUSPECT_SET[suspectKey(layer, head)];
      var metricLabel = metric === 'patching'
        ? 'activation patching recovery'
        : 'direct logit attribution score';
      var note = isSuspect
        ? ' — one of the top 10 heads implicated in the negation circuit.'
        : '';
      return '<strong>' + headLabel + '</strong> — ' + metricLabel + ': <strong>' +
        value.toFixed(3) + '</strong>' + note;
    }

    function render(metric) {
      currentMetric = metric;
      var matrix = dataFor(metric);
      var maxAbs = maxAbsOf(matrix);
      grid.innerHTML = '';

      for (var l = 0; l < N_LAYERS; l++) {
        for (var h = 0; h < N_HEADS; h++) {
          var value = matrix[l][h];
          var cell = document.createElement('button');
          cell.type = 'button';
          cell.className = 'circuit-cell';
          if (SUSPECT_SET[suspectKey(l, h)]) cell.className += ' is-suspect';
          cell.style.background = colorFor(value, maxAbs);
          cell.setAttribute('aria-label', 'Layer ' + l + ', head ' + h + ', value ' + value.toFixed(3));
          cell.dataset.layer = l;
          cell.dataset.head = h;
          cell.dataset.value = value;

          cell.addEventListener('mouseenter', function () {
            showTooltip(this);
          });
          cell.addEventListener('focus', function () {
            showTooltip(this);
          });
          cell.addEventListener('click', function () {
            showTooltip(this);
          });

          grid.appendChild(cell);
        }
      }
    }

    function showTooltip(cell) {
      var l = parseInt(cell.dataset.layer, 10);
      var h = parseInt(cell.dataset.head, 10);
      var v = parseFloat(cell.dataset.value);
      tooltip.hidden = false;
      tooltip.innerHTML = describe(currentMetric, l, h, v);
    }

    toggleBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        toggleBtns.forEach(function (b) {
          b.classList.remove('is-active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
        render(btn.dataset.metric);
        tooltip.hidden = true;
        tooltip.innerHTML = '';
      });
    });

    render('patching');
  }

  /* ==================================================================
     Agent Exchange — specialization-emergence widget.
     Data below is the actual output of the simulation (5 agents, 1500
     tasks, seed 42 — see research/agent-exchange-downloads/RESULTS.md).
     Each window covers 100 tasks; "shares" is each agent's fraction of
     wins within that window, per task type.
     ================================================================== */
  var MARKET_WINDOWS = [
    {"step":0,"shares":{"code_fix":{"0":0.129,"1":0.226,"2":0.065,"3":0.355,"4":0.226},"math":{"0":0.346,"1":0.346,"2":0.077,"3":0.077,"4":0.154},"research_lookup":{"0":0.409,"1":0.227,"2":0.091,"3":0.182,"4":0.091},"summarization":{"0":0.286,"1":0.19,"2":0.238,"3":0.143,"4":0.143}}},
    {"step":100,"shares":{"code_fix":{"0":0.12,"1":0.12,"2":0.2,"3":0.36,"4":0.2},"math":{"0":0.071,"1":0.536,"2":0.107,"3":0.071,"4":0.214},"research_lookup":{"0":0.208,"1":0.333,"2":0.083,"3":0.25,"4":0.125},"summarization":{"0":0.043,"1":0.217,"2":0.478,"3":0.087,"4":0.174}}},
    {"step":200,"shares":{"code_fix":{"0":0.278,"1":0.278,"2":0.222,"3":0.111,"4":0.111},"math":{"0":0.304,"1":0.435,"2":0.13,"3":0.087,"4":0.043},"research_lookup":{"0":0.19,"1":0.476,"2":0.19,"3":0.048,"4":0.095},"summarization":{"0":0.053,"1":0.053,"2":0.737,"3":0.026,"4":0.132}}},
    {"step":300,"shares":{"code_fix":{"0":0.346,"1":0.077,"2":0.115,"3":0.385,"4":0.077},"math":{"0":0.333,"1":0.167,"2":0.111,"3":0.111,"4":0.278},"research_lookup":{"0":0.423,"1":0.385,"2":0.038,"3":0.077,"4":0.077},"summarization":{"0":0.1,"1":0.267,"2":0.167,"3":0.367,"4":0.1}}},
    {"step":400,"shares":{"code_fix":{"0":0.833,"1":0.0,"2":0.167,"3":0.0,"4":0.0},"math":{"0":0.042,"1":0.625,"2":0.208,"3":0.042,"4":0.083},"research_lookup":{"0":0.692,"1":0.077,"2":0.077,"3":0.077,"4":0.077},"summarization":{"0":0.0,"1":0.0,"2":0.038,"3":0.0,"4":0.962}}},
    {"step":500,"shares":{"code_fix":{"0":0.913,"1":0.0,"2":0.0,"3":0.087,"4":0.0},"math":{"0":0.0,"1":0.042,"2":0.167,"3":0.0,"4":0.792},"research_lookup":{"0":0.955,"1":0.0,"2":0.0,"3":0.0,"4":0.045},"summarization":{"0":0.0,"1":0.0,"2":0.065,"3":0.0,"4":0.935}}},
    {"step":600,"shares":{"code_fix":{"0":0.059,"1":0.059,"2":0.235,"3":0.647,"4":0.0},"math":{"0":0.0,"1":0.351,"2":0.054,"3":0.0,"4":0.595},"research_lookup":{"0":0.957,"1":0.043,"2":0.0,"3":0.0,"4":0.0},"summarization":{"0":0.0,"1":0.609,"2":0.043,"3":0.0,"4":0.348}}},
    {"step":700,"shares":{"code_fix":{"0":0.333,"1":0.3,"2":0.333,"3":0.0,"4":0.033},"math":{"0":0.087,"1":0.217,"2":0.087,"3":0.087,"4":0.522},"research_lookup":{"0":0.455,"1":0.091,"2":0.091,"3":0.318,"4":0.045},"summarization":{"0":0.08,"1":0.24,"2":0.6,"3":0.04,"4":0.04}}},
    {"step":800,"shares":{"code_fix":{"0":0.111,"1":0.778,"2":0.074,"3":0.0,"4":0.037},"math":{"0":0.0,"1":0.0,"2":0.0,"3":0.0,"4":1.0},"research_lookup":{"0":0.917,"1":0.0,"2":0.042,"3":0.0,"4":0.042},"summarization":{"0":0.0,"1":0.0,"2":1.0,"3":0.0,"4":0.0}}},
    {"step":900,"shares":{"code_fix":{"0":0.105,"1":0.368,"2":0.053,"3":0.105,"4":0.368},"math":{"0":0.0,"1":0.0,"2":0.0,"3":0.0,"4":1.0},"research_lookup":{"0":0.44,"1":0.0,"2":0.52,"3":0.04,"4":0.0},"summarization":{"0":0.0,"1":0.0,"2":1.0,"3":0.0,"4":0.0}}},
    {"step":1000,"shares":{"code_fix":{"0":0.897,"1":0.034,"2":0.034,"3":0.034,"4":0.0},"math":{"0":0.0,"1":0.0,"2":0.0,"3":0.0,"4":1.0},"research_lookup":{"0":0.1,"1":0.0,"2":0.9,"3":0.0,"4":0.0},"summarization":{"0":0.0,"1":0.0,"2":1.0,"3":0.0,"4":0.0}}},
    {"step":1100,"shares":{"code_fix":{"0":0.5,"1":0.3,"2":0.2,"3":0.0,"4":0.0},"math":{"0":0.0,"1":0.0,"2":0.0,"3":0.0,"4":1.0},"research_lookup":{"0":0.214,"1":0.036,"2":0.643,"3":0.036,"4":0.071},"summarization":{"0":0.0,"1":0.0,"2":1.0,"3":0.0,"4":0.0}}},
    {"step":1200,"shares":{"code_fix":{"0":1.0,"1":0.0,"2":0.0,"3":0.0,"4":0.0},"math":{"0":0.0,"1":0.0,"2":0.038,"3":0.0,"4":0.962},"research_lookup":{"0":0.0,"1":0.038,"2":0.885,"3":0.038,"4":0.038},"summarization":{"0":0.0,"1":0.0,"2":1.0,"3":0.0,"4":0.0}}},
    {"step":1300,"shares":{"code_fix":{"0":0.724,"1":0.0,"2":0.034,"3":0.207,"4":0.034},"math":{"0":0.0,"1":0.0,"2":0.0,"3":0.0,"4":1.0},"research_lookup":{"0":0.0,"1":0.0,"2":0.0,"3":1.0,"4":0.0},"summarization":{"0":0.0,"1":0.0,"2":1.0,"3":0.0,"4":0.0}}},
    {"step":1400,"shares":{"code_fix":{"0":0.0,"1":0.0,"2":0.0,"3":1.0,"4":0.0},"math":{"0":0.0,"1":0.0,"2":0.0,"3":0.0,"4":1.0},"research_lookup":{"0":0.0,"1":0.154,"2":0.0,"3":0.808,"4":0.038},"summarization":{"0":0.0,"1":0.0,"2":1.0,"3":0.0,"4":0.0}}}
  ];

  var MARKET_TASK_TYPES = ["code_fix", "math", "summarization", "research_lookup"];
  var MARKET_TASK_LABELS = { code_fix: "Code fix", math: "Math", summarization: "Summarization", research_lookup: "Research lookup" };
  // reuses the site's own accent palette — no new colors introduced
  var MARKET_AGENT_COLORS = ["#5b7aff", "#9d8cff", "#ff6b82", "#f7c04a", "#4de8d4"];
  var MARKET_N_AGENTS = 5;

  function initMarketWidget(widget) {
    var svg = widget.querySelector('[data-market-svg]');
    var legend = widget.querySelector('[data-market-legend]');
    var scrub = widget.querySelector('[data-market-scrub]');
    var readout = widget.querySelector('[data-market-readout]');
    var playBtn = widget.querySelector('[data-market-play]');
    var tooltip = widget.querySelector('[data-market-tooltip]');
    var toggleBtns = Array.prototype.slice.call(widget.querySelectorAll('.circuit-toggle-btn'));
    var statLeader = widget.querySelector('[data-stat-leader]');
    var statShare = widget.querySelector('[data-stat-share]');
    if (!svg || !scrub) return;

    var currentTask = 'code_fix';
    var playing = false, playTimer = null;

    // legend, built once
    legend.innerHTML = '';
    for (var a = 0; a < MARKET_N_AGENTS; a++) {
      var item = document.createElement('span');
      item.className = 'market-legend-item';
      item.innerHTML = '<span class="market-legend-swatch" style="background:' +
        MARKET_AGENT_COLORS[a] + '"></span>Agent ' + a;
      legend.appendChild(item);
    }

    var W = 320, H = 130, LEFT = 18, BAR_GAP = 1.5;

    function render(upToIdx) {
      var slice = MARKET_WINDOWS.slice(0, upToIdx + 1);
      var plotW = W - LEFT;
      var barW = (plotW / MARKET_WINDOWS.length) - BAR_GAP;
      var bars = '';

      slice.forEach(function (w, wi) {
        var shares = w.shares[currentTask];
        var yOff = 0;
        var x = LEFT + wi * (plotW / MARKET_WINDOWS.length);
        for (var a = 0; a < MARKET_N_AGENTS; a++) {
          var frac = shares[String(a)] || 0;
          var h = frac * H;
          var y = H - yOff - h;
          if (h > 0.4) {
            bars += '<rect class="market-bar" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) +
              '" width="' + barW.toFixed(1) + '" height="' + h.toFixed(1) + '" fill="' +
              MARKET_AGENT_COLORS[a] + '" data-agent="' + a + '" data-window="' + wi +
              '" data-frac="' + frac.toFixed(3) + '"></rect>';
          }
          yOff += h;
        }
      });

      var grid = [0, 0.5, 1].map(function (f) {
        var y = H - f * H;
        return '<line class="market-gridline" x1="' + LEFT + '" y1="' + y + '" x2="' + W + '" y2="' + y + '"/>' +
          '<text class="market-axis-label" x="0" y="' + (y + 3) + '">' + Math.round(f * 100) + '%</text>';
      }).join('');

      svg.innerHTML = grid + bars;

      Array.prototype.slice.call(svg.querySelectorAll('.market-bar')).forEach(function (rect) {
        rect.addEventListener('mouseenter', function () { showTooltip(this); });
        rect.addEventListener('focus', function () { showTooltip(this); });
      });

      // stats for the current (rightmost visible) window
      var w = MARKET_WINDOWS[upToIdx];
      var shares = w.shares[currentTask];
      var bestAgent = 0, bestFrac = -1;
      for (var a2 = 0; a2 < MARKET_N_AGENTS; a2++) {
        var f2 = shares[String(a2)] || 0;
        if (f2 > bestFrac) { bestFrac = f2; bestAgent = a2; }
      }
      if (statLeader) statLeader.textContent = 'Agent ' + bestAgent;
      if (statLeader) statLeader.style.color = MARKET_AGENT_COLORS[bestAgent];
      if (statShare) statShare.textContent = Math.round(bestFrac * 100) + '%';

      if (readout) {
        readout.textContent = 'tasks 0–' + (w.step + 100) + ' of 1,500 · ' + MARKET_TASK_LABELS[currentTask];
      }
    }

    function showTooltip(rect) {
      var a = rect.dataset.agent;
      var wi = parseInt(rect.dataset.window, 10);
      var frac = parseFloat(rect.dataset.frac);
      var w = MARKET_WINDOWS[wi];
      tooltip.hidden = false;
      tooltip.innerHTML = '<strong style="color:' + MARKET_AGENT_COLORS[a] + '">Agent ' + a +
        '</strong> — ' + MARKET_TASK_LABELS[currentTask] + ', tasks ' + w.step + '–' + (w.step + 99) +
        ': won <strong>' + Math.round(frac * 100) + '%</strong>';
    }

    scrub.addEventListener('input', function (e) {
      render(parseInt(e.target.value, 10));
    });

    toggleBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        toggleBtns.forEach(function (b) {
          b.classList.remove('is-active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
        currentTask = btn.dataset.task;
        tooltip.hidden = true;
        render(parseInt(scrub.value, 10));
      });
    });

    if (playBtn) {
      playBtn.addEventListener('click', function () {
        playing = !playing;
        playBtn.innerHTML = playing
          ? '<i class="fas fa-pause"></i> Pause'
          : '<i class="fas fa-play"></i> Play';
        if (playing) {
          if (parseInt(scrub.value, 10) >= MARKET_WINDOWS.length - 1) scrub.value = 0;
          playTimer = setInterval(function () {
            var v = parseInt(scrub.value, 10) + 1;
            if (v > MARKET_WINDOWS.length - 1) {
              v = MARKET_WINDOWS.length - 1;
              playing = false;
              playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
              clearInterval(playTimer);
            }
            scrub.value = v;
            render(v);
          }, 450);
        } else {
          clearInterval(playTimer);
        }
      });
    }

    render(MARKET_WINDOWS.length - 1);
  }

  function init() {
    var widgets = Array.prototype.slice.call(document.querySelectorAll('[data-circuit-widget]'));
    widgets.forEach(initCircuitWidget);

    var marketWidgets = Array.prototype.slice.call(document.querySelectorAll('[data-market-widget]'));
    marketWidgets.forEach(initMarketWidget);

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();