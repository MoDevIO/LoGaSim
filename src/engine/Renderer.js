class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");

    this.mouse = { x: -100, y: -100 };

    this._onMouseMove = this._onMouseMove.bind(this);
    this._onResize = this._onResize.bind(this);
    this._resizeToCSS = this._resizeToCSS.bind(this);
    this._loop = this._loop.bind(this);

    this.canvas.addEventListener("mousemove", this._onMouseMove);
    window.addEventListener("resize", this._onResize);
    this._resizeToCSS();

    requestAnimationFrame(this._loop);
  }

  _onMouseMove(e) {
    const r = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - r.left;
    this.mouse.y = e.clientY - r.top;
  }

  _onResize() {
    this._resizeToCSS();
  }
  _resizeToCSS() {
    const r = this.canvas.getBoundingClientRect();
    this.canvas.width = r.width;
    this.canvas.height = r.height;
  }

  _loop() {
    this.renderer();
    requestAnimationFrame(this._loop);
  }

  renderer() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = "red";
    ctx.fillRect(50, 50, 200, 100);

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "blue";
    ctx.fillRect(this.mouse.x - 20, this.mouse.y - 20, 40, 40);
    ctx.globalAlpha = 1.0;
  }
}

export { Renderer };
