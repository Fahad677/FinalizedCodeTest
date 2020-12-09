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
    Math.sqrt(6) * (this.g - this.b),
    5 * this.r - this.g,
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
      FPS: 150,
      canvas: null,
      ctx: null,
      bInstantDraw: false,
      MOVES_PER_UPDATE: 500,
      bDone: false,
      width: 0,
      height: 0,
      colorSteps: 32,
      imageData: null,
      prevPositions: [],
    };
  }
  Init = () => {
    this.setState({ canvas: document.getElementById("canvas") });
    this.setState({ width: this.state.canvas.width });
    this.setState({ height: this.state.canvas.height });
    this.setState({ ctx: this.state.canvas.getContext("2d") });
    this.setState({
      imageData: this.state.ctx.createImageData(
        this.state.width,
        this.state.height
      ),
    });
    grid = [];
    colors = [];
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
        }
      }
    }
    for (var x = 0; x < this.state.width; x++) {
      grid.push(new Array());
      for (var y = 0; y < this.state.height; y++) {
        grid[x].push(0);
      }
    }
    currentPos = new Point(Math.floor(0.9), Math.floor(0.1));
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
    setInterval(this.GameLoop, 200 / this.state.FPS);
  };
  GameLoop = () => {
    this.Update();
    this.Draw();
  };
  Update = () => {
    if (!this.state.bDone) {
      var counter = this.state.MOVES_PER_UPDATE;
      while (counter > 0) {
        var notMoved = true;
        while (notMoved) {
          var availableSpaces = this.CheckForSpaces(grid);
          if (availableSpaces.length > 0) {
            this.setState({
              prevPositions: this.state.prevPositions.concat(currentPos),
            });
            currentPos =
              availableSpaces[Math.floor(0.9 * availableSpaces.length)];
            grid[currentPos.x][currentPos.y] = 1;
            this.ChangePixel(
              this.state.imageData,
              currentPos.x,
              currentPos.y,
              colors.pop()
            );
            notMoved = false;
          } else {
            if (this.state.prevPositions.length != 0) {
              currentPos = this.state.prevPositions.pop();
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
    this.state.ctx.putImageData(this.state.imageData, 0, 0);
  };

  CheckForSpaces = (inGrid) => {
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
          <canvas id="canvas" width="256" height="128"></canvas>
        </body>
      </div>
    );
  }
}
