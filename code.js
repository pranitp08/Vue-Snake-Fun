const rules = {Up: {row: -1, col:0}, Down: {row: +1, col:0}, 
				Right: {row:0, col: +1}, Left: {row:0, col: -1}};

let snakeList, food;

function isBoxFood(row, col) {
	return (row === food[0] && col === food[1]);
}

function randomElement(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function generateBox(rows, cols) {
	return Array.from(new Array(cols+1), ()=> Array.from(new Array(rows+1), ()=> ({isSnake: false, isFood: false})));
}

function eatingMyself(row, col) {
	let flag = false;
	snakeList.slice(0,-1).forEach(function(elem) {
		if(elem[0] === row && elem[1] === col)
			flag = true;
	}); 
	return flag;
}

function getDefaultData() {
	return {
		snake: 3,
		head:{row:0, col:0},
		tail:{row:0, col:0},
		rows: 15,
		cols: 15,
		grid: [],
		isStuck: false,
		direction: 'Right',
		moveSnake: null
	};
}

function showMessage(message = '') {
	stick.message = message;
}

let stick = new Vue({
	el: '#stick',
	data: {
		isBtnActive: false,
		message: ''
	},
	created: function() {
		this.activeMessage = this.btnMessage;
	},
	computed: {
		btnMessage: function() {
			return (this.isBtnActive?'The Game is On !':'Click Here to Start the Game');
		}
	},
	methods: {
		log: function(e) {
			/*console.log(e);*/
			e.preventDefault();
			game.direction = e.key.replace('Arrow', '');
			if(game.isStuck) {
				this.handleFocus();
			}
		},
		handleFocus: function() {
			this.isBtnActive = true;
			game.moveSnake = setInterval(function(){
				game.moveHead();	
			}, 100);
		},
		handleBlur: function() {
			this.isBtnActive = false;
			game.stopMoving();
		},
		resetGame: function() {
			game.resetGame();
			showMessage();
		}
	}
})

let game = new Vue({
	el: '#game',
	data: function() { return getDefaultData() },
	created: function() {
		this.initAll();
	},
	methods: {
		initAll: function() {
			snakeList = [], food = [];
			this.initGrid();
			this.initSnake();
			this.initFood();
		},
		resetGame: function() {
			 this.stopMoving();
			 Object.assign(this.$data, getDefaultData());
			 this.initAll();
		},
		stopMoving: function() {
			if(this.moveSnake !== null)
				clearInterval(this.moveSnake);
			this.moveSnake = null;
		},
		initSnake: function() {
			let snake = this.snake-1;
			while(snake>=0) {
				let tempCol = this.head.col+snake--;
				this.changeGridFlag(0, tempCol, true);
				snakeList.push([0,tempCol]);
			}
			let head = snakeList[0];
			this.head = {row:head[0], col:head[1]};
		},
		initFood: function() {
			let row = 5, col = 5;
			let keys = {};
			let aList = [];
			let rows = this.rows, cols = this.cols;

			snakeList.forEach(function(val) {
				if(!keys.hasOwnProperty(val[0]))
					keys[val[0]] = [];
				keys[val[0]].push(val[1]);
			});

			for(let i=0; i<=rows; i++) {
				aList[i] = [];
				for(let j=0; j<=cols; j++) {
					if(!(keys.hasOwnProperty(i) && keys[i].includes(j)))
						aList[i].push(j);
				}
			}

			row = randomElement([...aList.keys()]);
			col = randomElement(aList[row]);

			this.changeGridFlag(row, col,true,true);
			food = [row, col];
		},
		initGrid: function() {
			this.grid = generateBox(this.rows, this.cols);
		},
		moveHead: function() {
			let direction = this.direction;
			let row = this.head.row, col = this.head.col, rowCount = this.rows, colCount = this.cols;
			row += rules[direction].row;
			col += rules[direction].col;

			row = (row > rowCount ? 0 : (row < 0 ? rowCount : row));
			col = (col > colCount ? 0 : (col < 0 ? colCount: col));

			if(!eatingMyself(row,col)) {
				if(isBoxFood(row,col)) {
					this.changeGridFlag(row,col,false,true);
					this.changeGridFlag(row,col,true);
					snakeList.unshift([row, col]);
					this.head = {row, col};
					
					this.initFood();
				} else {
					this.changeGridFlag(this.tail.row, this.tail.col, false);
					this.changeGridFlag(row,col, true);
					
					this.head = {row, col};
					snakeList.unshift([row, col]);
					snakeList.pop();

					let snakeLen = snakeList.length;
					let tail = snakeList[snakeLen-1];
					this.tail = {row: tail[0], col: tail[1]};
				}
				showMessage();
				this.isStuck = false;
			} else {
				showMessage('Dude! You just ate yourself');
				this.stopMoving();
				this.isStuck = true;
			}
		},
		changeGridFlag: function(row, col, value, isFood = false) {
			let type = (isFood?'isFood':'isSnake');
			Vue.set(this.grid[row][col], type, value);
		}
	}
})