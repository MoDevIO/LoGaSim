class Renderer {
  constructor(canvas, objects = []) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");

    this.mouse = { x: undefined, y: undefined };
    this.mouseWorld = { x: undefined, y: undefined };
    this.zoom = 1;
    this.pan = { x: 0, y: 0 };
    this.isPanning = false;
    this.lastPanPos = { x: 0, y: 0 };

    this.objects = objects;
    this.hoveringObject = null;

    this._onMouseMove = this._onMouseMove.bind(this);
    this._onResize = this._onResize.bind(this);
    this._resizeToCSS = this._resizeToCSS.bind(this);
    this._loop = this._loop.bind(this);

    this.canvas.addEventListener("mousemove", this._onMouseMove);
    window.addEventListener("resize", this._onResize);
    this.canvas.addEventListener("mousedown", (e) => {
      if (e.button === 0) {
        this.objects.push({
          id: Date.now(),
          x: this.mouseWorld.x,
          y: this.mouseWorld.y,
          width: 100,
          height: 100,
          color: "blue",
        });
        console.log("Adding object:", this.objects[this.objects.length - 1]);
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

      const worldX = (this.mouse.x - this.pan.x) / this.zoom;
      const worldY = (this.mouse.y - this.pan.y) / this.zoom;

      if (e.deltaY < 0) this.zoom *= zoomFactor;
      else this.zoom /= zoomFactor;

      this.zoom = Math.min(Math.max(this.zoom, 0.2), 5);

      this.pan.x = this.mouse.x - worldX * this.zoom;
      this.pan.y = this.mouse.y - worldY * this.zoom;
    });

    this._resizeToCSS();
    requestAnimationFrame(this._loop);
  }

  _onMouseMove(e) {
    const r = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - r.left;
    this.mouse.y = e.clientY - r.top;

    this.mouseWorld.x =
      Math.round((this.mouse.x - this.pan.x) / this.zoom / 100) * 100;
    this.mouseWorld.y =
      Math.round((this.mouse.y - this.pan.y) / this.zoom / 100) * 100;

    const hoveringObj = Object(
      this.objects.find((object) => {
        return (
          this.mouseWorld.x >= object.x - object.width / 2 &&
          this.mouseWorld.x <= object.x + object.width / 2 &&
          this.mouseWorld.y >= object.y - object.height / 2 &&
          this.mouseWorld.y <= object.y + object.height / 2
        );
      })
    );
    hoveringObj["hovering"] = true;
    this.objects.forEach((object) => {
      if (object !== hoveringObj) {
        object["hovering"] = false;
      }
    });
    this.hoveringObject = hoveringObj || null;

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

    for (const object of this.objects) {
      ctx.fillStyle = object.color;
      ctx.fillRect(
        object.x - object.width / 2,
        object.y - object.height / 2,
        object.width,
        object.height
      );
    }

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "blue";
    if (this.hoveringObject === null) {
      ctx.fillStyle = "green";
    }
    ctx.fillRect(
      Math.round(this.mouseWorld.x / 100) * 100 - 50,
      Math.round(this.mouseWorld.y / 100) * 100 - 50,
      100,
      100
    );
    ctx.globalAlpha = 1.0;

    ctx.restore();
  }
}

export { Renderer };
