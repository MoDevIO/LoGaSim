import { GateFactory } from "./GateFactory.js";

export class Renderer {
  constructor(canvas, objects = []) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.gateFactory = new GateFactory();

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
      if (e.button === 0 && this.hoveringObject === null) {
        console.log("Adding object...");
        this.objects.push({
          id: Date.now(),
          x: this.mouseWorld.x,
          y: this.mouseWorld.y,
          width: 100,
          height: 100,
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
      if ("id" in hoveringObj) {
        this.hoveringObject = hoveringObj;
      } else {
        this.hoveringObject = null;
      }
    });
    this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const zoomFactor = 1.1;

      const worldX = (this.mouse.x - this.pan.x) / this.zoom;
      const worldY = (this.mouse.y - this.pan.y) / this.zoom;

      if (e.deltaY < 0) this.zoom = this.zoom * zoomFactor;
      else this.zoom = this.zoom / zoomFactor;

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
      Math.round((this.mouse.x - this.pan.x) / this.zoom / 10) * 10;
    this.mouseWorld.y =
      Math.round((this.mouse.y - this.pan.y) / this.zoom / 10) * 10;

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
    if ("id" in hoveringObj) {
      this.hoveringObject = hoveringObj;
    } else {
      this.hoveringObject = null;
    }

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

    for (const object of this.objects) {
      const gateProps = this.gateFactory.createGate(
        ctx,
        "AND",
        object.x,
        object.y,
        ["A", "B", "C"],
        ["Q"]
      );
      object.width = gateProps.width;
      object.height = gateProps.height;
    }

    ctx.globalAlpha = 0.5;
    this.gateFactory.createGate(
      ctx,
      "AND",
      Math.round(this.mouseWorld.x / 10) * 10,
      Math.round(this.mouseWorld.y / 10) * 10,
      ["A", "B", "C"],
      ["Q"]
    );
    ctx.globalAlpha = 1.0;

    ctx.restore();
  }
}
