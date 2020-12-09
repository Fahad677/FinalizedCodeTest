import logo from "./logo.svg";
import "./App.css";
import { Component } from "react";

var location, grid, colors;
function Coordinates(xIn, yIn) {
  this.x = xIn;
  this.y = yIn;
}

function GenerateColor(red, green, blue) {
  this.r = red;
  this.g = green;
  this.b = blue;
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
      checker: false,
      componentSteps: 32,
      movementUpdate: 500,
      width: 0,
      height: 0,
      frameRate: 150,
      imageData: null,
      prevPositions: [],
      ctx: null,
      canvas: null,
    };
  }
  Load = () => {
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
    for (var r = 1; r < this.state.componentSteps; r++) {
      for (var g = 1; g < this.state.componentSteps; g++) {
        for (var b = 1; b < this.state.componentSteps; b++) {
          colors.push(
            new GenerateColor(
              (r * 255) / (this.state.componentSteps - 1),
              (g * 255) / (this.state.componentSteps - 1),
              (b * 255) / (this.state.componentSteps - 1)
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
    location = new Coordinates(Math.floor(0.9), Math.floor(0.1));
    grid[location.x][location.y] = 1;
    this.setState({
      prevPositions: this.state.prevPositions.concat(location),
    });
    this.ImagePixelChange(
      this.state.imageData,
      location.x,
      location.y,
      colors.pop()
    );
    setInterval(this.Pattern, 200 / this.state.frameRate);
  };
  Pattern = () => {
    this.Add();
    this.PrintPattern();
  };
  Add = () => {
    if (!this.state.checker) {
      var counter = this.state.movementUpdate;
      while (counter > 0) {
        var notMoved = true;
        while (notMoved) {
          var availableSpaces = this.FreeSpaces(grid);
          if (availableSpaces.length > 0) {
            this.setState({
              prevPositions: this.state.prevPositions.concat(location),
            });
            location =
              availableSpaces[Math.floor(0.9 * availableSpaces.length)];
            grid[location.x][location.y] = 1;
            this.ImagePixelChange(
              this.state.imageData,
              location.x,
              location.y,
              colors.pop()
            );
            notMoved = false;
          } else {
            if (this.state.prevPositions.length != 0) {
              location = this.state.prevPositions.pop();
            } else {
              this.state.ctx.putImageData(this.state.imageData, 0, 0);
              this.setState({ checker: true });
              break;
            }
          }
        }
        counter--;
      }
    }
  };
  PrintPattern = () => {
    this.state.ctx.putImageData(this.state.imageData, 0, 0);
  };

  FreeSpaces = (inGrid) => {
    var availableSpaces = [];
    if (location.x > 0) {
      if (inGrid[location.x - 1][location.y] == 0) {
        availableSpaces.push(new Coordinates(location.x - 1, location.y));
      }
    } else if (inGrid[this.state.width - 1][location.y] == 0) {
      availableSpaces.push(new Coordinates(this.state.width - 1, location.y));
    }

    if (location.x < this.state.width - 1) {
      if (inGrid[location.x + 1][location.y] == 0) {
        availableSpaces.push(new Coordinates(location.x + 1, location.y));
      }
    } else if (inGrid[0][location.y] == 0) {
      availableSpaces.push(new Coordinates(0, location.y));
    }
    if (location.y > 0) {
      if (inGrid[location.x][location.y - 1] == 0) {
        availableSpaces.push(new Coordinates(location.x, location.y - 1));
      }
    } else if (inGrid[location.x][this.state.height - 1] == 0) {
      availableSpaces.push(new Coordinates(location.x, this.state.height - 1));
    }
    if (location.y < this.state.height - 1) {
      if (inGrid[location.x][location.y + 1] == 0) {
        availableSpaces.push(new Coordinates(location.x, location.y + 1));
      }
    } else if (inGrid[location.x][0] == 0) {
      availableSpaces.push(new Coordinates(location.x, 0));
    }
    return availableSpaces;
  };
  ImagePixelChange = (data, x, y, color) => {
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
    window.onload = this.Load;
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
        <body onload="this.Load">
          <canvas id="canvas" width="256" height="128"></canvas>
        </body>
      </div>
    );
  }
}
