import logo from "./logo.svg";
import "./App.css";
import { Component } from "react";

var grid, colors, currentPos;
function Point(xIn, yIn) {
  this.x = xIn;
  this.y = yIn;
}

function Color(r, g, b) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.hue = Math.atan2(
    Math.sqrt(3) * (this.g - this.b),
    2 * this.r - this.g,
    this.b
  );
  this.min = Math.min(this.r, this.g);
  this.min = Math.min(this.min, this.b);
  this.min /= 255;
  this.max = Math.max(this.r, this.g);
  this.max = Math.max(this.max, this.b);
  this.max /= 255;
  this.luminance = (this.min + this.max) / 2;
  if (this.min === this.max) {
    this.saturation = 0;
  } else if (this.luminance < 0.5) {
    this.saturation = (this.max - this.min) / (this.max + this.min);
  } else if (this.luminance >= 0.5) {
    this.saturation = (this.max - this.min) / (2 - this.max - this.min);
  }
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      FPS: 60,
      canvas: null,
      ctx: null,
      bInstantDraw: false,
      MOVES_PER_UPDATE: 20, //How many pixels get placed down
      bDone: false,
      width: null, //canvas width
      height: 0, //canvas height
      colorSteps: 32,
      imageData: null,
      prevPositions: [],
    };
  }

  // This is called when the page loads
  Init = () => {
    this.setState({ canvas: document.getElementById("canvas") }); // Get the HTML element with the ID of 'canvas'
    this.setState({ width: this.state.canvas.width });
    this.setState({ height: this.state.canvas.height });
    this.setState({ ctx: this.state.canvas.getContext("2d") });
    this.setState({
      imageData: this.state.ctx.createImageData(
        this.state.width,
        this.state.height
      ),
    }); //Needed to do pixel manipulation
    grid = []; //Grid for the labyrinth algorithm
    colors = []; //Array of all colors
    for (var r = 1; r < this.state.colorSteps; r++) {
      for (var g = 1; g < this.state.colorSteps; g++) {
        for (var b = 1; b < this.state.colorSteps; b++) {
          colors.push(
            new Color(
              (r * 255) / (this.state.colorSteps - 1),
              (g * 255) / (this.state.colorSteps - 1),
              (b * 255) / (this.state.colorSteps - 1)
            )
          );
          //Fill the array with all colors
        }
      }
    }
    for (var x = 0; x < this.state.width; x++) {
      grid.push(new Array());
      for (var y = 0; y < this.state.height; y++) {
        grid[x].push(0); //Set up the grid
      }
    }
    currentPos = new Point(
      Math.floor(Math.random() * this.state.width),
      Math.floor(Math.random() * this.state.height)
    );
    grid[currentPos.x][currentPos.y] = 1;
    this.setState({
      prevPositions: this.state.prevPositions.concat(currentPos),
    });
    this.ChangePixel(
      this.state.imageData,
      currentPos.x,
      currentPos.y,
      colors.pop()
    );
    setInterval(this.GameLoop, 1000 / this.state.FPS);
  };
  // Main program loop
  GameLoop = () => {
    this.Update();
    this.Draw();
  };
  // Game logic goes here
  Update = () => {
    if (!this.state.bDone) {
      var counter = this.state.MOVES_PER_UPDATE;
      while (counter > 0) {
        //For speeding up the drawing
        var notMoved = true;
        while (notMoved) {
          var availableSpaces = this.CheckForSpaces(grid); //Find available spaces
          if (availableSpaces.length > 0) {
            //If there are available spaces
            this.setState({
              prevPositions: this.state.prevPositions.concat(currentPos),
            }); //add old position to prevPosition array
            currentPos =
              availableSpaces[
                Math.floor(Math.random() * availableSpaces.length)
              ];
            //pick a random available space
            grid[currentPos.x][currentPos.y] = 1; //set that space to filled
            this.ChangePixel(
              this.state.imageData,
              currentPos.x,
              currentPos.y,
              colors.pop()
            ); //pop color of the array and put it in that space
            notMoved = false;
          } else {
            if (this.state.prevPositions.length != 0) {
              currentPos = this.state.prevPositions.pop(); //pop to previous position where spaces are available
            } else {
              this.state.ctx.putImageData(this.state.imageData, 0, 0);
              this.setState({ bDone: true });
              break;
            }
          }
        }
        counter--;
      }
    }
  };
  Draw = () => {
    // Clear the screen
    this.state.ctx.clearRect(
      0,
      0,
      this.state.ctx.canvas.width,
      this.state.ctx.canvas.height
    );
    this.state.ctx.fillStyle = "#000000";
    this.state.ctx.fillRect(
      0,
      0,
      this.state.ctx.canvas.width,
      this.state.ctx.canvas.height
    );
    this.state.ctx.putImageData(this.state.imageData, 0, 0);
  };
  CheckForSpaces = (inGrid) => {
    //Checks for available spaces then returns back all available spaces
    var availableSpaces = [];
    if (currentPos.x > 0) {
      if (inGrid[currentPos.x - 1][currentPos.y] == 0) {
        availableSpaces.push(new Point(currentPos.x - 1, currentPos.y));
      }
    } else if (inGrid[this.state.width - 1][currentPos.y] == 0) {
      availableSpaces.push(new Point(this.state.width - 1, currentPos.y));
    }

    if (currentPos.x < this.state.width - 1) {
      if (inGrid[currentPos.x + 1][currentPos.y] == 0) {
        availableSpaces.push(new Point(currentPos.x + 1, currentPos.y));
      }
    } else if (inGrid[0][currentPos.y] == 0) {
      availableSpaces.push(new Point(0, currentPos.y));
    }

    if (currentPos.y > 0) {
      if (inGrid[currentPos.x][currentPos.y - 1] == 0) {
        availableSpaces.push(new Point(currentPos.x, currentPos.y - 1));
      }
    } else if (inGrid[currentPos.x][this.state.height - 1] == 0) {
      availableSpaces.push(new Point(currentPos.x, this.state.height - 1));
    }

    if (currentPos.y < this.state.height - 1) {
      if (inGrid[currentPos.x][currentPos.y + 1] == 0) {
        availableSpaces.push(new Point(currentPos.x, currentPos.y + 1));
      }
    } else if (inGrid[currentPos.x][0] == 0) {
      availableSpaces.push(new Point(currentPos.x, 0));
    }

    return availableSpaces;
  };

  ChangePixel = (data, x, y, color) => {
    //Quick function to simplify changing pixels
    if (color == undefined || color == "undefined" || color == null) {
      return;
    } else {
      data.data[(x + y * this.state.width) * 4 + 0] = color.r;
      data.data[(x + y * this.state.width) * 4 + 1] = color.g;
      data.data[(x + y * this.state.width) * 4 + 2] = color.b;
      data.data[(x + y * this.state.width) * 4 + 3] = 255;
    }
  };

  componentDidMount() {
    window.onload = this.Init;
  }
  render() {
    return (
      <div>
        <div
          style={{
            marginTop: "20px",
            "text-align": "center",
            background: "#1abc9c",
            color: "white",
            marginBottom: "40px",
          }}
        >
          <h2 style={{ fontSize: "30px" }}>Coding Test</h2>
          <h6 style={{ fontSize: "15px" }}>Thank you for your patience :) </h6>
        </div>
        <body onLoad="this.state.Init">
          <canvas id="canvas" width="256" height="128">
            Sorry your browser does not support Canvas, try Firefox or Chrome!
          </canvas>
        </body>
      </div>
    );
  }
}
