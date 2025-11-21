class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");

    this.mouse = { x: -100, y: -100 };
    this.zoom = 1;
    this.pan = { x: 0, y: 0 };
    this.isPanning = false;
    this.lastPanPos = { x: 0, y: 0 };

    this.objects = [];

    this._onMouseMove = this._onMouseMove.bind(this);
    this._onResize = this._onResize.bind(this);
    this._resizeToCSS = this._resizeToCSS.bind(this);
    this._loop = this._loop.bind(this);

    this.canvas.addEventListener("mousemove", this._onMouseMove);
    window.addEventListener("resize", this._onResize);
    this.canvas.addEventListener("mousedown", (e) => {
      if (e.button === 0) {
        const worldX =
          (e.clientX - this.canvas.getBoundingClientRect().left - this.pan.x) /
          this.zoom;
        const worldY =
          (e.clientY - this.canvas.getBoundingClientRect().top - this.pan.y) /
          this.zoom;

        this.objects.push({
          x: worldX,
          y: worldY,
          width: 40,
          height: 40,
          color: "blue",
        });
      }

      if (e.button === 1) {
        this.isPanning = true;
        this.lastPanPos.x = e.clientX;
        this.lastPanPos.y = e.clientY;
      }
    });
    this.canvas.addEventListener("mouseup", (e) => {
      if (e.button === 1) this.isPanning = false;
    });
    this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const zoomFactor = 1.1;
      const mouseX = e.clientX - this.canvas.getBoundingClientRect().left;
      const mouseY = e.clientY - this.canvas.getBoundingClientRect().top;

      const worldX = (mouseX - this.pan.x) / this.zoom;
      const worldY = (mouseY - this.pan.y) / this.zoom;

      if (e.deltaY < 0) this.zoom *= zoomFactor;
      else this.zoom /= zoomFactor;

      this.zoom = Math.min(Math.max(this.zoom, 0.2), 5);

      this.pan.x = mouseX - worldX * this.zoom;
      this.pan.y = mouseY - worldY * this.zoom;
    });

    this._resizeToCSS();
    requestAnimationFrame(this._loop);
  }

  _onMouseMove(e) {
    const r = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - r.left;
    this.mouse.y = e.clientY - r.top;

    if (this.isPanning) {
      const dx = e.clientX - this.lastPanPos.x;
      const dy = e.clientY - this.lastPanPos.y;
      this.pan.x += dx;
      this.pan.y += dy;
      this.lastPanPos.x = e.clientX;
      this.lastPanPos.y = e.clientY;
    }
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

    ctx.save();
    ctx.translate(this.pan.x, this.pan.y);
    ctx.scale(this.zoom, this.zoom);

    ctx.fillStyle = "red";
    ctx.fillRect(50, 50, 200, 100);

    for (const obj of this.objects) {
      ctx.fillStyle = obj.color;
      ctx.fillRect(
        obj.x - obj.width / 2,
        obj.y - obj.height / 2,
        obj.width,
        obj.height
      );
    }

    const worldX = (this.mouse.x - this.pan.x) / this.zoom;
    const worldY = (this.mouse.y - this.pan.y) / this.zoom;

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "blue";
    ctx.fillRect(worldX - 20, worldY - 20, 40, 40);
    ctx.globalAlpha = 1.0;

    ctx.restore();
  }
}

export { Renderer };
