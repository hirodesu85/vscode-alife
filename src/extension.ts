import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand(
		"boid-simulation.start",
		() => {
			const panel = vscode.window.createWebviewPanel(
				"boidSimulation",
				"Boid Simulation",
				vscode.ViewColumn.One,
				{
					enableScripts: true,
				}
			);

			panel.webview.html = getWebviewContent();
		}
	);

	context.subscriptions.push(disposable);
}

function getWebviewContent() {
	return `
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
							const FPS = 50;
							const BOID_SIZE = 3;
							const MAX_SPEED = 7;

							const pixelArt = [
								[1, 0, 1, 1, 1, 1, 0, 1],
								[0, 1, 1, 1, 1, 1, 1, 0],
								[1, 1, 0, 0, 0, 0, 1, 1],
								[1, 0, 0, 1, 1, 0, 0, 1],
								[1, 0, 1, 0, 0, 1, 0, 1],
								[0, 1, 1, 1, 1, 1, 1, 0],
								[0, 0, 1, 1, 1, 1, 0, 0],
								[0, 0, 0, 1, 1, 0, 0, 0],
							];

							class Boids {
								constructor() {
									this.canvas = document.querySelector("#canvas");
									this.ctx = this.canvas.getContext("2d");
									this.boids = [];
									this.view = { width: 0, height: 0 };
								}
								init() {
									this.bindEvents();
									this.updateView();
									this.appendBoids(3);
									setInterval(this.simulate.bind(this), 1000 / FPS);
								}
								bindEvents() {
									addEventListener("click", (e) => {
										this.appendBoids(1, e.pageX, e.pageY);
									});
									addEventListener("resize", () => {
										this.updateView();
									});
								}
								updateView() {
									this.view = {
										width: window.innerWidth,
										height: window.innerHeight,
									};
									this.canvas.width = this.view.width;
									this.canvas.height = this.view.height;
								}
								simulate() {
									this.drawBoids();
									this.moveBoids();
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
									this.ctx.clearRect(0, 0, this.view.width, this.view.height);

									for (let i = 0, len = this.boids.length; i < len; i++) {
										this.drawPixelArt(this.boids[i].x, this.boids[i].y);
									}
								}
								drawPixelArt(x, y) {
									for (let py = 0; py < pixelArt.length; py++) {
										for (let px = 0; px < pixelArt[py].length; px++) {
											if (pixelArt[py][px] === 1) {
												this.ctx.fillStyle = "black";
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

										let isOutsideX =
											(boid.x < 0 && boid.vx < 0) ||
											(boid.x > this.view.width && boid.vx > 0);
										let isOutsideY =
											(boid.y < 0 && boid.vy < 0) ||
											(boid.y > this.view.height && boid.vy > 0);

										if (isOutsideX) {
											boid.vx *= -1;
										}
										if (isOutsideY) {
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

										if (distance < 16) {
											this.boids[index].vx -= this.boids[i].x - this.boids[index].x;
											this.boids[index].vy -= this.boids[i].y - this.boids[index].y;
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

export function deactivate() {}
