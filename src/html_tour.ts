import introJs = require('intro.js');

/**
 * Function startTour used to make an interactive tour on the page when Help button is pressed.
 * @param callback to be called on tour exit. Used to activate / deactivate board
 * control.
 */
export function startTour(callback: any): void {
  const intro: introJs.IntroJs = introJs(); 
  intro.setOptions({
    steps: [
      {
        element: '.main-container',
        intro: '<b>[N]ext-puzzle</b> is a game based on the classical <a href="https://en.wikipedia.org/wiki/15_puzzle" target="_blank">15-puzzle</a>,'
        + ' but with several exceptions:<br> '
        + ' - Board size can be modified in the <code>SIZE</code> field (press \'New game\' to update the board).<br>'
        + ' - Game can be solved by a human a user or by a solving algorithm.<br><br>'
        + 'Current version is Alpha, it lacks some features like scoreboard and others.<br>If bugs are encountered please be indulgent.<br>'
        + 'Some important known issues: For relatively high shuffle complexity and board size (e.g. 6 and 200 respectively) A* search time can be very long and would cause the browser page to freeze.<br>'
        + 'If it happens reopen the browser tab.<br>'
        + 'Enjoy !<br>',
        position: 'bottom'
      },
      {
        element: '.game-container',
        intro: 'Play using key groups:<br> - <b>arrows [&#8592;, &#8593;, &#8594;, &#8595;]</b>.<br> - <b>vim-style [H, J, K, L]</b>.<br> - <b>gamer-style [W, A, S, D]</b>.<br>'
             + 'For touch-screen swipe in the desired direction on the board.',
        position: 'right'
      },
      {
        element: '.score-container',
        intro: 'Moves counter.',
        position: 'right'
      },
      {
        element: '.status-container',
        intro: 'Status. One of:<br>'
             + ' - READY<br>'
             + ' - SOLVING...<br>'
             + ' - SOLVED<br>'
             + ' - UNSOLVABLE<br>',
        position: 'right'
      },
      {
        element: '.time-container',
        intro: 'Solving algorithm search time.',
        position: 'right'
      },
      {
        element: '.compl-size-container',
        intro: 'Memory complexity (solving algorithm) - maximum number of graph nodes simultaneously present in memory.',
        position: 'right'
      },
      {
        element: '.compl-time-container',
        intro: 'Time complexity (solving algorithm) - total number of search iterations through the priority queue.',
        position: 'right'
      },
      {
        element: '.moves-container',
        intro: 'Number of moves from the solving algorithm.',
        position: 'right'
      },
      {
        element: '.size-field-container',
        intro: 'Define board NxN size, where N is an integer [2..100].',
        position: 'right'
      },
      {
        element: '.complexity-field-container',
        intro: 'Shuffle complexity - distance (number of moves) from solved to shuffled state, where all intermediate states are unique.'
             + ' It does not represent the minimal distance, but only an indicator of shuffling complexity.',
        position: 'right'
      },
      {
        element: '.solvable-checkbox-container',
        intro: 'Define if the new game is solvable.<br>N.B. Half of all possible combinations are unsolvable. <a href="https://www.cs.bham.ac.uk/~mdr/teaching/modules04/java2/TilesSolvability.html" target="_blank">Solvability check algorithm.</a>',
        position: 'right'
      },
      {
        element: '.select-speed',
        intro: 'Animation speed:<br>'
             + ' - Slow -  <br>'
             + ' - Normal -  <br>'
             + ' - Fast -  <br>',
        position: 'right'
      },
      {
        element: '.select-algo',
        intro: 'Solving algorithm:<br>'
             + ' - \'A*\' (A-star) is the popular <a href="https://en.wikipedia.org/wiki/A*_search_algorithm" target="_blank">path search algorithm.</a>'
             +' A* can be viewed as the classical <a href="https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm" target="_blank">Dijkstra\'s algorithm</a> with an added heuristic.<br>'
             + ' - \'A* opt.\' is an optimized version of A*.<br>'
             + ' - \'Best-first\' is the <a href="https://en.wikipedia.org/wiki/Greedy_algorithm" target="_blank">greedy version</a> of A* opt.',
        position: 'right'
      },
      {
        element: '.select-heuristic',
        intro: 'Heuristic - metric to compute distance from current to solved state.<br>'
             + 'Available heuristics:<br>'
             + ' - <a href="https://en.wikipedia.org/wiki/Hamming_distance" target="_blank">Hamming distance</a>.<br>'
             + ' - <a href="https://en.wikipedia.org/wiki/Taxicab_geometry" target="_blank">Manhattan distance</a>.<br>'
             + ' - Linear conflict described in the <a href="https://cse.sc.edu/~mgv/csce580sp15/gradPres/HanssonMayerYung1992.pdf" target="_blank">original article</a>.<br>'
             + ' - <a href="https://en.wikipedia.org/wiki/Euclidean_distance" target="_blank">Euclidean distance</a>.<br>'
             + ' - Permutation nb. - simple heuristic counts number misplaced (not in increasing order) tiles.<br>'
             + 'Only Hamming, Manhattan, and Euclidean distance are admissible heuristics.',
        position: 'right'
      },
      {
        element: '.buttons-container',
        intro: 'Control buttons:<br>'
             + ' - \'New game\' - shuffle and draw a new board using provided <code>SIZE</code> and <code>SHUFFLE COMP.</code>.</br>'
             + ' - \'Replay\' - go back to previous \'New game\' and reset moves counter.</br>'
             + ' - \'Solve\' - solve the game using specified algorithm and heuristic.',
        position: 'right'
      }
    ],
    showBullets: true,
    showButtons: true,
    exitOnOverlayClick: false,
    keyboardNavigation: true,
  });
  intro.onexit(callback);
  intro.start();
}