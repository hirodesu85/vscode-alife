import * as vscode from "vscode";

export class WebViewProvider implements vscode.WebviewViewProvider {
  constructor(private extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = {
      enableScripts: true,
    };

    // 画像のURIを取得
    const boidImageUri = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "resources", "images", "boid.png")
    );

    webviewView.webview.html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Boid Simulation</title>
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
            const MAX_SPEED = 2;

            class Boids {
              constructor() {
                this.canvas = document.querySelector("#canvas");
                this.ctx = this.canvas.getContext("2d");
                this.offscreenCanvas = document.createElement("canvas");
                this.offscreenCtx = this.offscreenCanvas.getContext("2d");
                this.boids = [];
                this.view = { width: 0, height: 0 };
                this.boidImage = new Image();
                this.boidImage.src = "${boidImageUri}";
              }

              init() {
                this.boidImage.onload = () => {
                  this.bindEvents();
                  this.updateView();
                  this.drawBackground();
                  this.appendBoids(3);
                  requestAnimationFrame(this.simulate.bind(this));
                };
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
                requestAnimationFrame(this.simulate.bind(this));
              }

              drawBackground() {
                this.offscreenCtx.fillStyle = "#B5E8FF";
                this.offscreenCtx.fillRect(0, 0, this.view.width, this.view.height);
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
                  const boid = this.boids[i];
                  this.ctx.save();
                  this.ctx.translate(boid.x, boid.y);
                  if (boid.vx > 0) {
                    this.ctx.scale(-1, 1);
                  }
                  this.ctx.drawImage(
                    this.boidImage,
                    -this.boidImage.width / 2,
                    -this.boidImage.height / 2
                  );
                  this.ctx.restore();
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

                  const boidWidth = this.boidImage.width;
                  const boidHeight = this.boidImage.height;

                  if (
                    (boid.x < boidWidth/2 && boid.vx < 0) ||
                    (boid.x + boidWidth/2 > this.view.width && boid.vx > 0)
                  ) {
                    boid.vx *= -1;
                  }
                  if (
                    (boid.y < boidHeight/2 && boid.vy < 0) ||
                    (boid.y + boidHeight/2 > this.view.height && boid.vy > 0)
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
                    this.boids[index].vx -= (this.boids[i].x - this.boids[index].x) / 20;
                    this.boids[index].vy -= (this.boids[i].y - this.boids[index].y) / 20;
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
            }, 1500);
          </script>
        </body>
      </html>
    `;
  }
}
