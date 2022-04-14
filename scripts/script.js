function init() {

  //#region --- Global Variables
  const grid = document.querySelector('#grid')
  const gridContainer = document.querySelector('#gridContainer')
  gridContainer.style.backgroundImage = 'url("assets/startScreen.png")'
  let cellArray = []
  let difficulty = 'hard'
  let gridHeight
  let gridWidth
  let cellWidth
  let cellHeight
  let cellNum
  let mineNum
  let flagNum
  const winnerArray = []
  //#endregion --- Global Variables

  //#region --- Resize
  function handleResize() {
    if (gridHeight < gridWidth) {
      grid.style.width = '100%'
      grid.style.height = `${grid.clientWidth / 2}px`
    } else if (gridHeight === gridWidth) {
      grid.style.width = '50%'
      grid.style.height = `${grid.clientWidth}px`
    } else {
      grid.style.width = '50%'
      grid.style.height = `${grid.clientWidth * 2}px`
    }
  }

  handleResize()

  window.addEventListener('resize', handleResize)
  //#endregion --- Resize

  //#region --- Cell class
  class cell {
    constructor(order, cellDiv, cellCover, mine, flag) {
      this.order = order ? order : 0

      this.cellDiv = cellDiv ? cellDiv : document.createElement('div')
      this.cellDiv.classList.add('cell')
      this.cellDiv.style.width = `${cellWidth}`
      this.cellDiv.style.height = `${cellHeight}`
      this.cellDiv.style.backgroundImage = 'url("assets/cell.png")'
      grid.appendChild(this.cellDiv)

      this.cellCover = cellCover ? cellCover : document.createElement('div')
      this.cellCover.classList.add('cover')
      this.cellCover.addEventListener('click', (event) => this.handleLeftClick(event))
      this.cellCover.addEventListener('contextmenu', (event) => this.handleRightClick(event), false)
      this.cellCover.style.width = '100%'
      this.cellCover.style.height = '100%'
      this.cellCover.style.backgroundImage = 'url("assets/cover.png")'
      this.cellDiv.appendChild(this.cellCover)

      this.mine = mine ? true : false
      this.flag = flag ? true : false
      this.covered = true
    }
    addMine() {
      this.mine = true
      this.cellDiv.innerHTML = ''
      this.cellDiv.appendChild(this.cellCover)
      this.cellDiv.style.backgroundImage = 'url("assets/cellAndMine.png")'
    }
    removeMine() {
      this.mine = false
      this.cellDiv.style.background = 'url("assets/cell.png")'
    }
    addFlag() {
      console.log(flagCounter.innerText, flagCounter.innerText !== '0')
      flagCounter.innerText = parseInt(flagCounter.innerText) - 1
      this.flag = true
      this.cellCover.style.backgroundImage = 'url("assets/coverAndFlag.png")'
      if (flagCounter.innerText === '0') {
        console.log('here0')
        checkWin()
      }
    }
    removeFlag() {
      this.flag = false
      this.cellCover.style.backgroundImage = 'url("assets/cover.png")'
      flagCounter.innerText = parseInt(flagCounter.innerText) + 1
    }
    addCover() {
      (!this.covered) && (this.cellCover.style.display = 'block')
    }
    removeCover() {
      this.covered = false
      this.cellCover.style.opacity = '0'
      setTimeout(() => this.cellCover.style.display = 'none', 300)
    }
    handleLeftClick() {
      this.flag && this.removeFlag()
      if (this.mine) {
        this.removeCover()
        this.explode()
        this.mine = false
        lose()
      } else {
        this.recurCellUncover()
      }
    }
    handleRightClick(event) {
      if (this.flag) {
        this.removeFlag()
      } else {
        this.addFlag()
      }
      event.preventDefault()
    }
    explode(timer = 1000) {
      setTimeout(() => {
        this.cellDiv.style.backgroundImage = 'url("assets/explosion.gif")'
        setTimeout(() => this.cellDiv.style.backgroundImage = 'url("assets/cellAndCrater.png")', 1000)
      }, timer)
    }
    recurCellUncover() {
      const emptyCells = searchForEmptyCells(this.order)
      if (this.covered) {
        this.removeCover()
        if (emptyCells.length > 0 && !parseInt(this.cellDiv.innerText[0])) {
          for (let count = emptyCells.length; count > 0; count--) {
            emptyCells[count - 1].recurCellUncover()
          }
        }
      }
    }
  }
  //#endregion --- Cell class

  //#region --- Start
  const startButton = document.querySelector('#startButton')
  const flagCounter = document.querySelector('#flagCounter')
  flagCounter.innerText = 0
  let timerIntervalID

  function handleStart(event) {
    difficulty = window.prompt(`Please choose a difficulty: 
    1. Easy
    2. Medium
    3. Hard`)
    if (difficulty === 'Easy' || difficulty === 'easy' || difficulty === '1') {
      difficulty = 'easy'
      gridWidth = 10
      gridHeight = 10
      cellWidth = `${(1 / gridWidth) * 100}%` //'10%'
      cellHeight = `${(1 / gridHeight) * 100}%` //'6.25%'
      cellNum = gridWidth * gridHeight
      mineNum = 10
      flagNum = mineNum
    } else if (difficulty === 'Medium' || difficulty === 'medium' || difficulty === '2') {
      difficulty = 'medium'
      gridWidth = 16
      gridHeight = 16
      cellWidth = `${(1 / gridWidth) * 100}%` //'10%'
      cellHeight = `${(1 / gridHeight) * 100}%` //'10%'
      cellNum = gridWidth * gridHeight
      mineNum = 40
      flagNum = mineNum
    } else if (difficulty === 'Hard' || difficulty === 'hard' || difficulty === '3') {
      difficulty = 'hard'
      gridWidth = 32
      gridHeight = 16
      cellWidth = `${(1 / gridWidth) * 100}%` //'3.125%'
      cellHeight = `${(1 / gridHeight) * 100}%` //'6.25%'
      cellNum = gridWidth * gridHeight
      mineNum = 99
      flagNum = mineNum
    } else {
      console.log('Select a difficulty')
    }

    //Create Cells
    for (let count = 0; count < cellNum; count++) {
      cellArray.push(new cell(count))
    }

    //Assign Mines
    for (let count = mineNum; count > 0; count--) {
      const aCell = cellArray[Math.floor(Math.random() * cellNum)]
      aCell.mine ? count++ : aCell.addMine()
    }

    for (let count = cellNum - 1; count >= 0; count--) {
      if (!cellArray[count].mine) {
        const mineNum = searchForMines(count)
        const holdCell = cellArray[count]
        holdCell.minesAround = mineNum;
        (mineNum) && (holdCell.cellDiv.innerHTML = mineNum)
        holdCell.cellDiv.appendChild(holdCell.cellCover)
        switch (mineNum) {
          case 1:
            cellArray[count].cellDiv.style.color = '#00d'
            break
          case 2:
            cellArray[count].cellDiv.style.color = '#099'
            break
          case 3:
            cellArray[count].cellDiv.style.color = '#090'
            break
          case 4:
            cellArray[count].cellDiv.style.color = '#990'
            break
          case 5:
            cellArray[count].cellDiv.style.color = '#f70'
            break
          case 6:
            cellArray[count].cellDiv.style.color = '#f00'
            break
          case 7:
            cellArray[count].cellDiv.style.color = '#f07'
            break
          case 8:
            cellArray[count].cellDiv.style.color = '#f77'
            break
          default:
            break
        }
      }
    }

    handleResize()

    gridContainer.style.backgroundImage = ''

    timerIntervalID = setInterval(handleTimer, 1000)
    flagCounter.innerText = flagNum

    event.target.setAttribute('disabled', '')
  }

  startButton.addEventListener('click', (event) => handleStart(event))
  //#endregion --- Start

  //#region --- End

  const endButton = document.querySelector('#endButton')

  function handleEnd() {
    removeGrid()
    startButton.removeAttribute('disabled', '')
    clearInterval(timerIntervalID)
    timer.innerText = 0
    timerHold = 0
    flagCounter.innerText = 0
    gridContainer.style.backgroundImage = 'url("assets/startScreen.png")'
  }

  endButton.addEventListener('click', handleEnd)

  function lose(cellPos) {
    // Could be done at start but this way it will ignore the previously clicked mine
    let mineArray = []
    for (let count = cellNum; count > 0; count--) {
      if (cellArray[count - 1].mine) {
        mineArray.push(cellArray[count - 1])
      }
    }

    let randNum
    let incrNum = 0
    console.log(mineArray.length)
    while (mineArray.length > 0) {
      randNum = Math.floor(Math.random() * mineArray.length)
      mineArray[randNum].removeCover()
      mineArray[randNum].explode(incrNum * mineNum / 5)
      mineArray = mineArray.filter(item => item !== mineArray[randNum])
      // console.log(mineArray)
      incrNum++
    }
    setTimeout(clearGrid, incrNum * mineNum / 2.5)

    clearInterval(timerIntervalID)
    timerHold = 0
  }

  function win() {
    const username = window.prompt('Please input a username: ')
    winnerArray.push(`${username}, ${difficulty}, Time: ${timerHold}`)
    scoreboard.innerText = winnerArray.join('\n')
    handleEnd()
  }

  //#endregion --- End

  //#region --- Utility

  const timer = document.querySelector('#timer')
  const scoreboard = document.querySelector('#scoreboard')
  let timerHold = 0
  timer.innerText = 0

  function handleTimer() {
    timer.innerText = timerHold++
  }

  function removeGrid() {
    cellArray = []
    grid.innerText = ''
  }

  function clearGrid() {
    for (let count = cellNum - 1; count >= 0; count--) {
      cellArray[count].removeCover()
    }
  }

  function checkWin() {
    const mineArray = []
    console.log('here1')
    for (let count = cellNum; count > 0; count--) {
      console.log('here2')
      cellArray[count - 1].mine && mineArray.push(cellArray[count - 1])
    }

    console.log(mineArray)

    console.log(mineArray.filter(mineCell => !mineCell.flag))

    mineArray.filter(mineCell => !mineCell.flag).length === 0 && win()
  }

  //#endregion --- Utility

  //#region --- Searches

  function searchForMines(cellPos) {
    let startCellPos
    let minesAround = 0

    //Top Left Corner Check
    if (cellPos === 0) {
      startCellPos = cellPos
      for (let count = 0; count < 2; count++) {
        (cellArray[startCellPos + count].mine) && minesAround++
        // cellArray[startCellPos + count].cellDiv.style.background = 'crimson';
        (cellArray[startCellPos + count + 1].mine) && minesAround++
        // cellArray[startCellPos + count + 1].cellDiv.style.background = 'crimson'
        startCellPos += gridWidth - 1
      }
      //Top Right Check
    } else if (gridWidth - cellPos === 1) {
      startCellPos = cellPos - 1
      for (let count = 0; count < 2; count++) {
        (cellArray[startCellPos + count].mine) && minesAround++
        // cellArray[startCellPos + count].cellDiv.style.background = 'coral';
        (cellArray[startCellPos + count + 1].mine) && minesAround++
        // cellArray[startCellPos + count + 1].cellDiv.style.background = 'coral'
        startCellPos += gridWidth - 1
      }
      //Bottom Right Check
    } else if (cellPos === cellNum - 1) {
      startCellPos = cellPos - (gridWidth + 1)
      for (let count = 0; count < 2; count++) {
        (cellArray[startCellPos + count].mine) && minesAround++
        // cellArray[startCellPos + count].cellDiv.style.background = 'coral';
        (cellArray[startCellPos + count + 1].mine) && minesAround++
        // cellArray[startCellPos + count + 1].cellDiv.style.background = 'coral'
        startCellPos += gridWidth - 1
      }
      //Bottom Left Check
    } else if (cellPos === cellNum - gridWidth) {
      startCellPos = cellPos - gridWidth
      for (let count = 0; count < 2; count++) {
        (cellArray[startCellPos + count].mine) && minesAround++
        // cellArray[startCellPos + count].cellDiv.style.background = 'coral';
        (cellArray[startCellPos + count + 1].mine) && minesAround++
        // cellArray[startCellPos + count + 1].cellDiv.style.background = 'coral'
        startCellPos += gridWidth - 1
      }
      //Top check
    } else if (cellPos < gridWidth) {
      startCellPos = cellPos - 1
      for (let count = 0; count < 2; count++) {
        (cellArray[startCellPos + count].mine) && minesAround++
        // cellArray[startCellPos + count].cellDiv.style.background = 'red';
        (cellArray[startCellPos + count + 1].mine) && minesAround++
        // cellArray[startCellPos + count + 1].cellDiv.style.background = 'green';
        (cellArray[startCellPos + count + 2].mine) && minesAround++
        // cellArray[startCellPos + count + 2].cellDiv.style.background = 'blue'
        startCellPos += gridWidth - 1
      }
      //Right check
    } else if ((cellPos + 1) % gridWidth === 0) {
      startCellPos = cellPos - (gridWidth + 1)
      for (let count = 0; count < 3; count++) {
        (cellArray[startCellPos + count].mine) && minesAround++
        // cellArray[startCellPos + count].cellDiv.style.background = 'yellow';
        (cellArray[startCellPos + count + 1].mine) && minesAround++
        // cellArray[startCellPos + count + 1].cellDiv.style.background = 'grey'
        startCellPos += gridWidth - 1
      }
      //Bottom Check
    } else if (cellPos > cellNum - gridWidth) {
      startCellPos = cellPos - (gridWidth + 1)
      for (let count = 0; count < 2; count++) {
        (cellArray[startCellPos + count].mine) && minesAround++
        // cellArray[startCellPos + count].cellDiv.style.background = 'purple';
        (cellArray[startCellPos + count + 1].mine) && minesAround++
        // cellArray[startCellPos + count + 1].cellDiv.style.background = 'cyan';
        (cellArray[startCellPos + count + 2].mine) && minesAround++
        // cellArray[startCellPos + count + 2].cellDiv.style.background = 'orange'
        startCellPos += gridWidth - 1
      }
      //Left Check
    } else if (cellPos % gridWidth === 0) {
      startCellPos = cellPos - (gridWidth)
      for (let count = 0; count < 3; count++) {
        (cellArray[startCellPos + count].mine) && minesAround++
        // cellArray[startCellPos + count].cellDiv.style.background = 'teal';
        (cellArray[startCellPos + count + 1].mine) && minesAround++
        // cellArray[startCellPos + count + 1].cellDiv.style.background = 'lime'
        startCellPos += gridWidth - 1
      }
    } else {
      startCellPos = cellPos - (gridWidth + 1)
      for (let count = 0; count < 3; count++) {
        (cellArray[startCellPos + count].mine) && minesAround++
        // cellArray[startCellPos + count].cellDiv.style.background = 'black';
        (cellArray[startCellPos + count + 1].mine) && minesAround++
        // cellArray[startCellPos + count + 1].cellDiv.style.background = 'white';
        (cellArray[startCellPos + count + 2].mine) && minesAround++
        // cellArray[startCellPos + count + 2].cellDiv.style.background = 'navy'
        startCellPos += gridWidth - 1
      }
    }
    return minesAround
  }

  function searchForEmptyCells(cellPos) {
    let startCellPos
    const emptyCells = []

    //Top Left Corner Check
    if (cellPos === 0) {
      startCellPos = cellPos
      for (let count = 0; count < 2; count++) {
        !cellArray[startCellPos + count].mine && emptyCells.push(cellArray[startCellPos + count])
        // cellArray[startCellPos + count].cellDiv.style.background = 'crimson'
        !cellArray[startCellPos + count + 1].mine && emptyCells.push(cellArray[startCellPos + count + 1])
        // cellArray[startCellPos + count + 1].cellDiv.style.background = 'crimson'
        startCellPos += gridWidth - 1
      }
      //Top Right Check
    } else if (gridWidth - cellPos === 1) {
      startCellPos = cellPos - 1
      for (let count = 0; count < 2; count++) {
        !cellArray[startCellPos + count].mine && emptyCells.push(cellArray[startCellPos + count])
        // cellArray[startCellPos + count].cellDiv.style.background = 'coral'
        !cellArray[startCellPos + count + 1].mine && emptyCells.push(cellArray[startCellPos + count + 1])
        // cellArray[startCellPos + count + 1].cellDiv.style.background = 'coral'
        startCellPos += gridWidth - 1
      }
      //Bottom Right Check
    } else if (cellPos === cellNum - 1) {
      startCellPos = cellPos - (gridWidth + 1)
      for (let count = 0; count < 2; count++) {
        !cellArray[startCellPos + count].mine && emptyCells.push(cellArray[startCellPos + count])
        // cellArray[startCellPos + count].cellDiv.style.background = 'coral'
        !cellArray[startCellPos + count + 1].mine && emptyCells.push(cellArray[startCellPos + count + 1])
        // cellArray[startCellPos + count + 1].cellDiv.style.background = 'coral'
        startCellPos += gridWidth - 1
      }
      //Bottom Left Check
    } else if (cellPos === cellNum - gridWidth) {
      startCellPos = cellPos - gridWidth
      for (let count = 0; count < 2; count++) {
        !cellArray[startCellPos + count].mine && emptyCells.push(cellArray[startCellPos + count])
        // cellArray[startCellPos + count].cellDiv.style.background = 'coral'
        !cellArray[startCellPos + count + 1].mine && emptyCells.push(cellArray[startCellPos + count + 1])
        // cellArray[startCellPos + count + 1].cellDiv.style.background = 'coral'
        startCellPos += gridWidth - 1
      }
      //Top check
    } else if (cellPos < gridWidth) {
      startCellPos = cellPos - 1
      for (let count = 0; count < 2; count++) {
        !cellArray[startCellPos + count].mine && emptyCells.push(cellArray[startCellPos + count])
        // cellArray[startCellPos + count].cellDiv.style.background = 'red'
        !cellArray[startCellPos + count + 1].mine && emptyCells.push(cellArray[startCellPos + count + 1])
        // cellArray[startCellPos + count + 1].cellDiv.style.background = 'green'
        !cellArray[startCellPos + count + 2].mine && emptyCells.push(cellArray[startCellPos + count + 2])
        // cellArray[startCellPos + count + 2].cellDiv.style.background = 'blue'
        startCellPos += gridWidth - 1
      }
      //Right check
    } else if ((cellPos + 1) % gridWidth === 0) {
      startCellPos = cellPos - (gridWidth + 1)
      for (let count = 0; count < 3; count++) {
        !cellArray[startCellPos + count].mine && emptyCells.push(cellArray[startCellPos + count])
        // cellArray[startCellPos + count].cellDiv.style.background = 'yellow'
        !cellArray[startCellPos + count + 1].mine && emptyCells.push(cellArray[startCellPos + count + 1])
        // cellArray[startCellPos + count + 1].cellDiv.style.background = 'grey'
        startCellPos += gridWidth - 1
      }
      //Bottom Check
    } else if (cellPos > cellNum - gridWidth) {
      startCellPos = cellPos - (gridWidth + 1)
      for (let count = 0; count < 2; count++) {
        !cellArray[startCellPos + count].mine && emptyCells.push(cellArray[startCellPos + count])
        // cellArray[startCellPos + count].cellDiv.style.background = 'purple'
        !cellArray[startCellPos + count + 1].mine && emptyCells.push(cellArray[startCellPos + count + 1])
        // cellArray[startCellPos + count + 1].cellDiv.style.background = 'cyan'
        !cellArray[startCellPos + count + 2].mine && emptyCells.push(cellArray[startCellPos + count + 2])
        // cellArray[startCellPos + count + 2].cellDiv.style.background = 'orange'
        startCellPos += gridWidth - 1
      }
      //Left Check
    } else if (cellPos % gridWidth === 0) {
      startCellPos = cellPos - (gridWidth)
      for (let count = 0; count < 3; count++) {
        !cellArray[startCellPos + count].mine && emptyCells.push(cellArray[startCellPos + count])
        // cellArray[startCellPos + count].cellDiv.style.background = 'teal'
        !cellArray[startCellPos + count + 1].mine && emptyCells.push(cellArray[startCellPos + count + 1])
        // cellArray[startCellPos + count + 1].cellDiv.style.background = 'lime'
        startCellPos += gridWidth - 1
      }
    } else {
      startCellPos = cellPos - (gridWidth + 1)
      for (let count = 0; count < 3; count++) {
        !cellArray[startCellPos + count].mine && emptyCells.push(cellArray[startCellPos + count])
        // cellArray[startCellPos + count].cellDiv.style.background = 'black'
        !cellArray[startCellPos + count + 1].mine && emptyCells.push(cellArray[startCellPos + count + 1])
        // cellArray[startCellPos + count + 1].cellDiv.style.background = 'white'
        !cellArray[startCellPos + count + 2].mine && emptyCells.push(cellArray[startCellPos + count + 2])
        // cellArray[startCellPos + count + 2].cellDiv.style.background = 'navy'
        startCellPos += gridWidth - 1
      }
    }
    return emptyCells
  }

  //#endregion --- Searches
}

window.addEventListener('DOMContentLoaded', init)