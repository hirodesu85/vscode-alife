import * as vscode from "vscode";

export class WebViewProvider implements vscode.WebviewViewProvider {
  constructor(private extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Boid Simulation with Pixel Art</title>
          <style>
            body {
              margin: 0;
              overflow: hidden;
            }
            canvas {
              display: block;
            }
          </style>
        </head>
        <body>
          <canvas id="canvas"></canvas>
          <script>
            const FPS = 30;
            const BOID_SIZE = 1;
            const MAX_SPEED = 6;

            const pixelArt = [
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 4, 4, 4, 4, 2, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 4, 2, 5, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3, 2, 5, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 3, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 2, 5, 6, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 3, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 2, 5, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 1, 4, 3, 6, 6, 6, 6, 6, 6, 6, 6, 3, 4, 1, 1, 1, 6, 6, 6, 5, 5, 5, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 1, 1, 1, 4, 3, 6, 6, 6, 6, 6, 6, 3, 4, 1, 1, 1, 1, 1, 6, 6, 6, 6, 4, 5, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 1, 2, 2, 2, 1, 4, 6, 6, 6, 6, 6, 6, 4, 1, 1, 2, 2, 2, 1, 1, 6, 6, 6, 6, 4, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 1, 2, 2, 2, 1, 1, 1, 6, 6, 6, 6, 6, 6, 1, 1, 2, 2, 2, 2, 2, 1, 1, 6, 6, 6, 4, 4, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 1, 1, 2, 2, 1, 2, 1, 1, 6, 6, 6, 6, 6, 6, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 6, 6, 4, 4, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 6, 6, 6, 6, 6, 6, 1, 1, 1, 1, 1, 1, 2, 1, 7, 1, 6, 6, 5, 5, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 6, 6, 6, 6, 6, 6, 1, 1, 1, 1, 1, 1, 1, 7, 4, 1, 6, 6, 5, 5, 5, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 7, 6, 6, 6, 6, 6, 6, 1, 1, 1, 1, 1, 1, 7, 5, 4, 1, 4, 6, 6, 5, 5, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 1, 4, 1, 1, 1, 7, 7, 6, 6, 3, 3, 6, 6, 6, 1, 1, 7, 3, 7, 7, 5, 4, 11, 1, 4, 6, 6, 6, 5, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 1, 8, 7, 4, 7, 3, 5, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 3, 3, 3, 5, 2, 4, 1, 4, 6, 6, 6, 6, 5, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 1, 10, 2, 1, 11, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 2, 2, 1, 2, 2, 2, 2, 2, 8, 8, 8, 6, 6, 6, 6, 5, 10, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 1, 10, 9, 9, 1, 1, 1, 2, 2, 1, 6, 11, 11, 6, 1, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2, 0, 8, 6, 6, 6, 5, 8, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 1, 8, 10, 10, 8, 2, 2, 2, 2, 2, 1, 6, 6, 1, 2, 2, 2, 2, 2, 2, 2, 8, 8, 8, 0, 0, 8, 6, 6, 5, 7, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0],
              [0, 1, 8, 8, 8, 8, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 8, 8, 8, 8, 8, 8, 5, 5, 7, 10, 1, 0, 1, 4, 4, 4, 1, 0, 0, 1, 4, 4, 1, 0, 0],
              [0, 1, 10, 8, 8, 8, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 8, 8, 8, 8, 8, 5, 5, 7, 10, 10, 0, 1, 4, 4, 2, 3, 3, 1, 1, 4, 2, 3, 4, 1, 0],
              [0, 0, 1, 10, 8, 8, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 8, 8, 8, 8, 8, 7, 7, 10, 1, 0, 1, 4, 6, 2, 2, 5, 3, 5, 2, 2, 6, 4, 1, 0],
              [0, 0, 0, 1, 8, 9, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 8, 8, 8, 7, 10, 1, 0, 0, 5, 5, 6, 6, 2, 2, 2, 2, 2, 6, 6, 3, 1, 0],
              [0, 0, 0, 0, 1, 1, 9, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 9, 7, 7, 8, 1, 0, 0, 0, 0, 5, 6, 6, 6, 6, 2, 6, 6, 6, 6, 5, 1, 0],
              [0, 0, 0, 0, 0, 0, 1, 10, 9, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 9, 9, 9, 8, 1, 1, 0, 0, 0, 0, 1, 5, 3, 6, 6, 6, 6, 6, 4, 5, 0, 1, 0],
              [0, 0, 0, 0, 0, 0, 0, 1, 9, 9, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 9, 9, 9, 10, 1, 1, 3, 3, 1, 0, 0, 0, 0, 1, 3, 3, 6, 6, 6, 4, 5, 5, 8, 1, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 8, 9, 2, 2, 2, 2, 2, 2, 2, 2, 9, 8, 1, 1, 1, 1, 3, 3, 3, 5, 5, 1, 0, 0, 0, 0, 10, 3, 6, 6, 5, 5, 0, 10, 1, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 8, 9, 9, 9, 9, 9, 9, 9, 9, 8, 6, 5, 5, 5, 1, 3, 3, 5, 6, 6, 6, 1, 0, 1, 1, 8, 6, 6, 5, 8, 8, 10, 1, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 9, 9, 9, 9, 9, 9, 9, 9, 6, 6, 6, 6, 6, 4, 1, 3, 6, 6, 6, 6, 6, 1, 6, 6, 6, 6, 5, 5, 1, 1, 1, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 1, 1, 5, 1, 2, 2, 2, 2, 2, 2, 2, 2, 9, 4, 6, 6, 6, 6, 6, 4, 1, 3, 3, 6, 6, 6, 6, 6, 6, 6, 5, 8, 9, 1, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 1, 4, 4, 5, 1, 2, 2, 2, 2, 2, 2, 2, 2, 9, 9, 4, 6, 6, 4, 4, 5, 1, 3, 3, 6, 6, 6, 6, 6, 6, 6, 8, 9, 9, 1, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 1, 4, 4, 5, 1, 0, 2, 2, 2, 2, 2, 2, 2, 2, 9, 1, 4, 4, 5, 5, 6, 1, 3, 3, 3, 6, 6, 6, 6, 6, 8, 8, 9, 9, 1, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 1, 6, 5, 5, 1, 0, 2, 2, 2, 2, 2, 2, 2, 2, 9, 9, 1, 1, 1, 1, 1, 8, 3, 3, 3, 6, 6, 6, 5, 5, 8, 8, 9, 9, 1, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 9, 9, 9, 9, 9, 8, 8, 8, 8, 8, 3, 3, 5, 8, 8, 8, 9, 9, 1, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 9, 9, 9, 9, 9, 8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 1, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 9, 9, 9, 9, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 9, 9, 9, 9, 9, 8, 8, 8, 9, 9, 9, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 9, 9, 9, 9, 9, 9, 9, 9, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 9, 9, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            ];

            const backgroundArt = [
              [0, 1, 1, 0, 1, 1, 1, 0],
              [1, 0, 0, 1, 0, 0, 0, 1],
              [1, 0, 1, 1, 1, 0, 0, 1],
              [0, 1, 0, 0, 0, 1, 1, 0],
              [1, 0, 1, 0, 1, 0, 0, 1],
              [0, 1, 1, 1, 1, 1, 1, 0],
              [1, 0, 1, 0, 0, 1, 0, 1],
              [0, 1, 0, 1, 1, 0, 1, 0],
            ];

            class Boids {
              constructor() {
                this.canvas = document.querySelector("#canvas");
                this.ctx = this.canvas.getContext("2d");
                this.offscreenCanvas = document.createElement("canvas");
                this.offscreenCtx = this.offscreenCanvas.getContext("2d");
                this.boids = [];
                this.view = { width: 0, height: 0 };
              }
              init() {
                this.bindEvents();
                this.updateView();
                this.drawBackground();
                this.appendBoids(3);
                setInterval(this.simulate.bind(this), 1000 / FPS);
              }
              bindEvents() {
                addEventListener("click", (e) => {
                  this.appendBoids(1, e.pageX, e.pageY);
                });
                addEventListener("resize", () => {
                  this.updateView();
                  this.drawBackground();
                });
              }
              updateView() {
                this.view = {
                  width: window.innerWidth,
                  height: window.innerHeight,
                };
                this.canvas.width = this.view.width;
                this.canvas.height = this.view.height;
                this.offscreenCanvas.width = this.view.width;
                this.offscreenCanvas.height = this.view.height;
              }
              simulate() {
                this.ctx.drawImage(this.offscreenCanvas, 0, 0);
                this.drawBoids();
                this.moveBoids();
              }
              drawBackground() {
                for (let y = 0; y < this.offscreenCanvas.height / BOID_SIZE; y++) {
                  for (let x = 0; x < this.offscreenCanvas.width / BOID_SIZE; x++) {
                    let color =
                      backgroundArt[y % backgroundArt.length][
                        x % backgroundArt[0].length
                      ];
                    this.offscreenCtx.fillStyle = color === 1 ? "#A0DFF7" : "#B5E8FF";
                    this.offscreenCtx.fillRect(
                      x * BOID_SIZE,
                      y * BOID_SIZE,
                      BOID_SIZE,
                      BOID_SIZE
                    );
                  }
                }
              }
              appendBoids(length, x, y) {
                if (this.boids.length >= 10) {
                  return;
                }

                for (let i = 0; i < length; i++) {
                  this.boids.push({
                    x: x || Math.random() * this.view.width,
                    y: y || Math.random() * this.view.height,
                    vx: 0,
                    vy: 0,
                  });
                }
              }
              drawBoids() {
                for (let i = 0, len = this.boids.length; i < len; i++) {
                  this.drawPixelArt(this.boids[i].x, this.boids[i].y, i);
                }
              }
              drawPixelArt(x, y, index) {
                for (let py = 0; py < pixelArt.length; py++) {
                  for (let px = 0; px < pixelArt[py].length; px++) {
                    let color;
                    if (this.boids[index].vx > 0) {
                      color = pixelArt[py][pixelArt[py].length - 1 - px];
                    } else {
                      color = pixelArt[py][px];
                    }
                    if (color !== 0) {
                      switch (color) {
                        case 1:
                          this.ctx.fillStyle = "#000000"; // black
                          break;
                        case 2:
                          this.ctx.fillStyle = "#FEFEF6"; // white
                          break;
                        case 3:
                          this.ctx.fillStyle = "#193F91"; // blue1
                          break;
                        case 4:
                          this.ctx.fillStyle = "#5D9CE0"; // blue2
                          break;
                        case 5:
                          this.ctx.fillStyle = "#0A58AE"; // blue3
                          break;
                        case 6:
                          this.ctx.fillStyle = "#3E5495"; // blue4
                          break;
                        case 7:
                          this.ctx.fillStyle = "#182651"; // blue5
                          break;
                        case 8:
                          this.ctx.fillStyle = "#F788B2"; // pink1
                          break;
                        case 9:
                          this.ctx.fillStyle = "#F2B5CC"; // pink2
                          break;
                        case 10:
                          this.ctx.fillStyle = "#DD6795"; // pink3
                          break;
                        case 11:
                          this.ctx.fillStyle = "#B69DC9"; // purple
                          break;
                        default:
                          this.ctx.fillStyle = "#000000"; // black
                      }
                      this.ctx.fillRect(
                        x + px * BOID_SIZE,
                        y + py * BOID_SIZE,
                        BOID_SIZE,
                        BOID_SIZE
                      );
                    }
                  }
                }
              }
              moveBoids() {
                for (let i = 0, len = this.boids.length; i < len; i++) {
                  let boid = this.boids[i];
                  let speed = Math.sqrt(Math.pow(boid.vx, 2) + Math.pow(boid.vy, 2));

                  this.cohesion(i);
                  this.separation(i);
                  this.alignment(i);

                  if (speed >= MAX_SPEED) {
                    let r = MAX_SPEED / speed;
                    boid.vx *= r;
                    boid.vy *= r;
                  }

                  if (
                    (boid.x < 0 && boid.vx < 0) ||
                    (boid.x > this.view.width && boid.vx > 0)
                  ) {
                    boid.vx *= -1;
                  }
                  if (
                    (boid.y < 0 && boid.vy < 0) ||
                    (boid.y > this.view.height && boid.vy > 0)
                  ) {
                    boid.vy *= -1;
                  }

                  boid.x += boid.vx;
                  boid.y += boid.vy;
                }
              }
              cohesion(index) {
                let center = { x: 0, y: 0 };
                let boidLength = this.boids.length;

                for (let i = 0; i < boidLength; i++) {
                  if (i === index) {
                    continue;
                  }
                  center.x += this.boids[i].x;
                  center.y += this.boids[i].y;
                }
                center.x /= boidLength - 1;
                center.y /= boidLength - 1;

                this.boids[index].vx += (center.x - this.boids[index].x) / 100;
                this.boids[index].vy += (center.y - this.boids[index].y) / 100;
              }
              separation(index) {
                for (let i = 0, len = this.boids.length; i < len; i++) {
                  if (i === index) {
                    continue;
                  }
                  let distance = this.getDistance(this.boids[i], this.boids[index]);

                  if (distance < 50) {
                    this.boids[index].vx -= (this.boids[i].x - this.boids[index].x) / 15;
                    this.boids[index].vy -= (this.boids[i].y - this.boids[index].y) / 15;
                  }
                }
              }
              alignment(index) {
                let average = { vx: 0, vy: 0 };
                let boidLength = this.boids.length;

                for (let i = 0; i < boidLength; i++) {
                  if (i === index) {
                    continue;
                  }
                  average.vx += this.boids[i].vx;
                  average.vy += this.boids[i].vy;
                }
                average.vx /= boidLength - 1;
                average.vy /= boidLength - 1;

                this.boids[index].vx += (average.vx - this.boids[index].vx) / 8;
                this.boids[index].vy += (average.vy - this.boids[index].vy) / 8;
              }
              getDistance(boid1, boid2) {
                let x = boid1.x - boid2.x;
                let y = boid1.y - boid2.y;
                return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
              }
            }

            setTimeout(() => {
              new Boids().init();
            }, 1000);
          </script>
        </body>
      </html>
    `;
  }
}
