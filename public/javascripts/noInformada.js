/*jslint browser:true, plusplus:true, vars: true */
"use strict";
// http:/stackoverflow.com/questions/13756482/create-copy-of-multi-dimensional-array-not-reference-javascript
Array.prototype.clone = function () {
    var arr = [], i;
    for (i = 0; i < this.length; i++){ 
        arr[i] = this[i].slice();
   } 
    return arr;
};


function Game() {
    
    var that = this;
    this.map = [];
    this.paused = false;
    this.won = false;
    this.rejectClick = false;
    this.move = 0;
    this.aiHistory = [];

    this.initOnceDone = false;
    /**
     * Only initalize once for these functions, can prevent race condition
     */
    
    
    
    this.initOnce = function () {
        if (this.initOnceDone) {
            return false;
        }

        this.canvas = document.getElementsByTagName("canvas")[0];
     
        this.canvas.addEventListener('click', function (e) {
            that.onclick(that.canvas, e);
        });
        this.context = this.canvas.getContext('2d');
        this.initOnceDone = true;
    };

    
    
    this.init = function () {
        this.map = [];
        this.paused = false;
        this.won = false;
        this.rejectClick = false;
        this.move = 0;
        this.aiHistory = [];
        
        this.initOnce(); // es la función que se declara arriba

        var i, j;
        for (i = 0; i < 6; i++) {
            this.map[i] = []; // es un arreglo de arreglos 
            for (j = 0; j < 7; j++) {
                this.map[i][j] = 0; // Se inicializa ese arreglo con 0.
                //Va por renglones, 
            }
        }
        this.clear(); //Limpia el espacio del canvas antes de usarlo
        this.drawMask(); // DIBUJA EL TABLERO
        this.print();
    };
  // FUNCIÓN QUE REGRESA SI EL TURNO ES DEL JUGADOR
    this.playerMove = function () {
        if (this.move % 2 === 0) {
            return 1;
        }
        return -1;
    };

    this.print = function () {//IMPRIME EL ESTADO ACTUAL DEL MEDIO AMBIENTE
        var i, j, msg;
        msg = "\n";
        msg += "Move: " + this.move;
        msg += "\n";
        for (i = 0; i < 6; i++) {
            for (j = 0; j < 7; j++) {
                msg += " " + this.map[i][j];
            }
            msg += "\n";
        }
        console.log(msg);
    };

    this.printState = function (state) {
        var i, j, msg = "\n";
        for (i = 0; i < 6; i++) {
            for (j = 0; j < 7; j++) {
                msg += " " + state[i][j];
            }
            msg += "\n";
        }
        console.log(msg);
    };

    this.win = function (player) {//NO EVALUA si se cumple la condicion de ganar solamente dice que alguien ya gano
        this.paused = true;
        this.won = true;
        this.rejectClick = false;
        var msg = null;
        if (player > 0) {
            msg = "Ganador: Jugador 1";
        } else if (player < 0) {
            msg = "Ganador: Jugador 2";
        } else {
            msg = "Empate";
        }
        msg += " - Click para reiniciar";
        this.context.save();
        this.context.font = '14pt sans-serif';
        this.context.fillStyle = "#111";
        this.context.fillText(msg, 200, 20);
        this.context.restore();

        console.info(msg);
    };
    
    
    this.fillMap = function (state, column, value) {//PONE UNA FICHA, ya sea del jugador o de la maquina
        var tempMap = state.clone();
        if (tempMap[0][column] !== 0 || column < 0 || column > 6) {
            return -1; //si ya esta lleno o la columna no existe
        }

        var done = false,
            row = 0,
            i;
        for (i = 0; i < 5; i++) {
            if (tempMap[i + 1][column] !== 0) {
                done = true;
                row = i;
                break;
            }
        }
        if (!done) {
            row = 5;
        }
        tempMap[row][column] = value;
        return tempMap;

    };

    this.action = function (column, callback) {
        if (this.paused || this.won) {
            return 0; // No hace nada si el juego esta en pausa o alguien gano
        }
        if (this.map[0][column] !== 0 || column < 0 || column > 6) {
            return -1; // ERROR SI LA COLUMNA ESTA LLENA O NO EXISTE
        }

        var done = false;
        var row = 0, i;
        for (i = 0; i < 5; i++) {
            if (this.map[i + 1][column] !== 0) {
                done = true;
                row = i;
                break;
            }
        }
        if (!done) {
            row = 5;
        }
        this.animate(column, this.playerMove(this.move), row, 0, function () {
            that.map[row][column] = that.playerMove(that.move);
            that.move++;
            that.draw();
            that.check();
            that.print();
            callback();
        });
        this.paused = true;
        return 1;
    };

//MUY IMPORTANTE

    this.check = function () { //REVISA SI ALGUIEN GANO
        var i, j, k;
        var temp_r = 0, temp_b = 0, temp_br = 0, temp_tr = 0;
        for (i = 0; i < 6; i++) {
            for (j = 0; j < 7; j++) {
                temp_r = 0;
                temp_b = 0;
                temp_br = 0;
                temp_tr = 0;
                for (k = 0; k <= 3; k++) {
                    //from (i,j) to right
                    if (j + k < 7) {
                        temp_r += this.map[i][j + k];
                    }
                    //from (i,j) to bottom
                    if (i + k < 6) {
                        temp_b += this.map[i + k][j];
                    }

                    //from (i,j) to bottom-right
                    if (i + k < 6 && j + k < 7) {
                        temp_br += this.map[i + k][j + k];
                    }

                    //from (i,j) to top-right
                    if (i - k >= 0 && j + k < 7) {
                        temp_tr += this.map[i - k][j + k];
                    }
                }
                if (Math.abs(temp_r) === 4) {
                    this.win(temp_r);
                } else if (Math.abs(temp_b) === 4) {
                    this.win(temp_b);
                } else if (Math.abs(temp_br) === 4) {
                    this.win(temp_br);
                } else if (Math.abs(temp_tr) === 4) {
                    this.win(temp_tr);
                }

            }
        }
        // check if draw
        if ((this.move === 42) && (!this.won)) {
            this.win(0);
        }
    };

    this.drawCircle = function (x, y, r, fill, stroke) {
        this.context.save();
        this.context.fillStyle = fill;
        this.context.strokeStyle = stroke;
        this.context.beginPath();
        this.context.arc(x, y, r, 0, 2 * Math.PI, false);
        //this.context.stroke();
        this.context.fill();
        this.context.restore();
    };
    this.drawMask = function () {
        // draw the mask
        // http://stackoverflow.com/questions/6271419/how-to-fill-the-opposite-shape-on-canvas
        // -->  http://stackoverflow.com/a/11770000/917957
    
       // this.canvas.scale(window.innerWidth*0.0008,window.innerHeight*0.0008);

        this.context.save();
        this.context.fillStyle = "#4D6AA7";
        this.context.beginPath(); //define lines, do not draw them (still)
        var x, y;
        for (y = 0; y < 6; y++) { //defines the circles that'll contain the tokens
            for (x = 0; x < 7; x++) {
                this.context.arc(75 * x + 100, 75 * y + 50, 25, 0, 2 * Math.PI);
                this.context.rect(75 * x + 150, 75 * y, -100, 100);
            }
        }
        this.context.fill();//draw the circles
        this.context.restore();//discard the defined lines
    };

    this.draw = function () {
        var x, y;
        var fg_color;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 7; x++) {
                fg_color = "transparent";
                if (this.map[y][x] >= 1) {
                    fg_color = '#FF0000';//"#64C1AF";
                } else if (this.map[y][x] <= -1) {
                    fg_color = "#209E31";
                }
                this.drawCircle(75 * x + 100, 75 * y + 50, 25, fg_color, "black");
            }
        }
    };
    this.clear = function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
    this.animate = function (column, move, to_row, cur_pos, callback) {
        var fg_color = "transparent";
        if (move >= 1) {
            fg_color = '#FF0000';// "#64C1AF"; //ANIMA UNA FICHA DEL JUGADOR
        } else if (move <= -1) {
            fg_color = "#209E31";//ANIMA UNA FICHA DE LA MAQUINA
        }
        if (to_row * 75 >= cur_pos) {
            this.clear();
            this.draw();
            this.drawCircle(75 * column + 100, cur_pos + 50, 25, fg_color, "black");
            this.drawMask();
            window.requestAnimationFrame(function () {
                that.animate(column, move, to_row, cur_pos + 25, callback);
            });
        } else {
            callback();
        }
    };

    this.onregion = function (coord, x, radius) {
        if ((coord[0] - x)*(coord[0] - x) <=  radius * radius) {
            return true;
        }
        return false;
    };
    this.oncircle = function (coord, centerCoord, radius) {
        if ((coord[0] - centerCoord[0]) * (coord[0] - centerCoord[0]) <=  radius * radius
                && (coord[1] - centerCoord[1]) * (coord[1] - centerCoord[1]) <=  radius * radius) {
            return true;
        }
        return false;
    };

    this.onclick = function (canvas, e) {
        if (this.rejectClick) {
            return false;
        }
        if (this.won) {
            this.init();
            return false;
        }
        var rect = canvas.getBoundingClientRect(),
            x = e.clientX - rect.left,// - e.target.scrollTop,
            y = e.clientY - rect.top;// - e.target.scrollLeft;

        //console.log("(" + x + ", " + y + ")");
        var j, valid;
        for (j = 0; j < 7; j++) {
            if (this.onregion([x, y], 75 * j + 100, 25)) {
                // console.log("clicked region " + j);
                this.paused = false;
                valid = this.action(j, function () {
                    that.ai(-1);
                });
                if (valid === 1) { // give user retry if action is invalid
                    this.rejectClick = true;
                }
                break; //because there will be no 2 points that are clicked at a time
            }
        }
    };

    this.ai = function (aiMoveValue) {
        var queue = [];
        var level = 0;
        
        var rootNode = {
          state: this.map.clone(),
          parent: undefined,
          column: 0,
          level: 0
        };
        
        var actualNode = rootNode;
        
        function computerWins(state) { //modificado de la funcion de arriba
        var i, j, k;
        var temp_r = 0, temp_b = 0, temp_br = 0, temp_tr = 0;
        for (i = 0; i < 6; i++) {
            for (j = 0; j < 7; j++) {
                temp_r = 0;
                temp_b = 0;
                temp_br = 0;
                temp_tr = 0;
                for (k = 0; k <= 3; k++) {
                    //from (i,j) to right
                    if (j + k < 7) {
                        temp_r += state[i][j + k];
                    }
                    //from (i,j) to bottom
                    if (i + k < 6) {
                        temp_b += state[i + k][j];
                    }

                    //from (i,j) to bottom-right
                    if (i + k < 6 && j + k < 7) {
                        temp_br += state[i + k][j + k];
                    }

                    //from (i,j) to top-right
                    if (i - k >= 0 && j + k < 7) {
                        temp_tr += state[i - k][j + k];
                    }
                }
                if (temp_r === -4) {
                    return 1;//only return 1 if computer wins
                } else if (temp_b === -4) {
                    return 1;
                } else if (temp_br === -4) {
                    return 1;
                } else if (temp_tr === -4) {
                    return 1;
                }

            }
        }
        return 0; //computer doesnt win.
    };
    
    function decideMove(){    
      
        while( actualNode.level <= 5){//limit search to 5 levels of the tree (17000 possible outcomes)
          //check if actual state is a winner state
          if( computerWins(actualNode.state) ){
            
            console.log('estoy en el if');
            
            while(actualNode.parent !== rootNode){
                  actualNode = actualNode.parent //go up the path until you reach the top
                return actualNode.column;
            }
          }else{
            console.log('estoy en el else');
            //generate another level of moves
              for(var i = 0; i < 7; i++){
                //simulate a token falling in each of the columns
                  var tempState = that.fillMap(actualNode.state,i,Math.pow(-1,actualNode.level+1));
                  
                if(tempState !== -1){
                  queue.push( {
                    state: tempState,
                    parent: actualNode,
                    column: i,
                    level: actualNode.level+1
                  });
                }
              }
          }
            if (queue[0] === null){
              return(-1);
            }
            
            actualNode = queue.shift();
        }
        
        return -1;
        
      };
      console.log('pause: ' + this.pause +' winner: ' + this.won);
      
      
      var move = decideMove()
      console.log('computer decided on column:' + move);
      console.log('pause: ' + this.pause +' winner: ' + this.won);
      
      this.paused = false;
      var done = this.action(move, function () {
            that.rejectClick = false;
        });

console.log('done value = ' + done);
        // if fail, then random
        while (done < 0) {
            console.error("Falling back to random agent");
            var choice = Math.floor(Math.random() * 7);
            done = this.action(choice, function () {
                that.rejectClick = false;
            });
      
    };
  };
  this.init();

};
document.addEventListener('DOMContentLoaded', function () {
    this.game = new Game();
});
