import { GateFactory } from "./GateFactory.js";

export class Renderer {
  constructor(canvas, objects = []) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.gateFactory = new GateFactory();

    this.mouse = { x: undefined, y: undefined };
    this.mouseWorld = { x: undefined, y: undefined };
    this.mouseWorldSnap = { x: undefined, y: undefined };
    this.zoom = 1;
    this.pan = { x: 0, y: 0 };
    this.isPanning = false;
    this.lastPanPos = { x: 0, y: 0 };

    this.objects = objects;
    this.selectedGateType = {
      type: "XOR",
      inputs: ["A", "B"],
      outputs: ["Q", "-Q"],
    };
    this.hoveringObject = null;
    this.hoveringObjectOffset = { x: 0, y: 0 };
    this.draggingObject = null;
    this.wires = [];
    this.hoveringPin = null;
    this.draggingConnection = null;

    this._onMouseMove = this._onMouseMove.bind(this);
    this._onResize = this._onResize.bind(this);
    this._resizeToCSS = this._resizeToCSS.bind(this);
    this._loop = this._loop.bind(this);

    this.canvas.addEventListener("mousemove", this._onMouseMove);
    window.addEventListener("resize", this._onResize);
    this.canvas.addEventListener("mousedown", (e) => {
      if (e.button === 0) {
        if (this.hoveringPin) {
          console.log("Start connection from pin", this.hoveringPin);
          this.draggingConnection = { from: this.hoveringPin, to: null };
          return;
        }

        if (this.hoveringObject && !this.draggingConnection) {
          this.draggingObject = this.hoveringObject;
          this.hoveringObjectOffset.x =
            this.mouseWorld.x - this.hoveringObject.x;
          this.hoveringObjectOffset.y =
            this.mouseWorld.y - this.hoveringObject.y;
        }

        if (this.hoveringObject === null) {
          this.objects.push({
            id: Date.now(),
            x: this.mouseWorld.x,
            y: this.mouseWorld.y,
            inputs: this.selectedGateType.inputs,
            outputs: this.selectedGateType.outputs,
            type: this.selectedGateType.type,
          });
          console.log("Adding object...");
        }
      }

      if (e.button === 1) {
        this.isPanning = true;
        this.lastPanPos.x = e.clientX;
        this.lastPanPos.y = e.clientY;
      }
    });
    this.canvas.addEventListener("mouseup", (e) => {
      if (e.button === 0) {
        if (this.draggingConnection) {
          if (
            this.hoveringPin &&
            this.draggingConnection.from !== this.hoveringPin
          ) {
            console.log("Complete connection to pin", this.hoveringPin);
            this.draggingConnection.to = this.hoveringPin;
            this.wires.push({
              from_obj_id: this.draggingConnection.from.object.id,
              from_pin_type: this.draggingConnection.from.type,
              from_pin_index: this.draggingConnection.from.index,
              to_obj_id: this.draggingConnection.to.object.id,
              to_pin_type: this.draggingConnection.to.type,
              to_pin_index: this.draggingConnection.to.index,
            });
            console.log("Wires:", this.wires);
          }
          this.draggingConnection = null;
        }
      }
      if (this.draggingObject) {
        this.draggingObject = null;
      }

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

    requestAnimationFrame(this._loop);
    this._resizeToCSS();
    setTimeout(() => this._resizeToCSS(), 100);
    setTimeout(() => this._resizeToCSS(), 1000);
    setTimeout(() => this._resizeToCSS(), 5000);
    setTimeout(() => this._resizeToCSS(), 10000);
  }

  _onMouseMove(e) {
    const r = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - r.left;
    this.mouse.y = e.clientY - r.top;

    this.mouseWorld.x = (this.mouse.x - this.pan.x) / this.zoom;
    this.mouseWorld.y = (this.mouse.y - this.pan.y) / this.zoom;
    this.mouseWorldSnap.x =
      Math.round((this.mouse.x - this.pan.x) / this.zoom / 10) * 10;
    this.mouseWorldSnap.y =
      Math.round((this.mouse.y - this.pan.y) / this.zoom / 10) * 10;

    const hoveringObj = Object(
      this.objects.find((object) => {
        return (
          this.mouseWorld.x >= object.x - (object.width + 15) / 2 &&
          this.mouseWorld.x <= object.x + (object.width + 15) / 2 &&
          this.mouseWorld.y >= object.y - (object.height + 15) / 2 &&
          this.mouseWorld.y <= object.y + (object.height + 15) / 2
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

    this.hoveringPin = null;

    for (const object of this.objects) {
      const pins = this.gateFactory.getPinPositions(
        object.x,
        object.y,
        object.inputs,
        object.outputs
      );

      let found = false;

      for (const pin of pins.inputs || []) {
        const dx = this.mouseWorld.x - pin.x;
        const dy = this.mouseWorld.y - pin.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= pins.pinRadius) {
          this.hoveringPin = {
            object,
            type: "in",
            index: pin.index,
            x: pin.x,
            y: pin.y,
            label: pin.label,
          };
          found = true;
          break;
        }
      }
      if (found) break;

      for (const pin of pins.outputs || []) {
        const dx = this.mouseWorld.x - pin.x;
        const dy = this.mouseWorld.y - pin.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= pins.pinRadius) {
          this.hoveringPin = {
            object,
            type: "out",
            index: pin.index,
            x: pin.x,
            y: pin.y,
            label: pin.label,
          };
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (this.isPanning) {
      const dx = e.clientX - this.lastPanPos.x;
      const dy = e.clientY - this.lastPanPos.y;
      this.pan.x += dx;
      this.pan.y += dy;
      this.lastPanPos.x = e.clientX;
      this.lastPanPos.y = e.clientY;
    }

    if (this.draggingConnection) {
      this.draggingConnection.to = {
        x: this.mouseWorld.x,
        y: this.mouseWorld.y,
      };
    }

    if (this.draggingObject) {
      this.draggingObject.x = this.mouseWorld.x - this.hoveringObjectOffset.x;
      this.draggingObject.y = this.mouseWorld.y - this.hoveringObjectOffset.y;
      this.objects = this.objects.map((obj) =>
        obj.id === this.draggingObject.id ? this.draggingObject : obj
      );
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

    for (const wire of this.wires) {
      const fromObj = this.objects.find((obj) => obj.id === wire.from_obj_id);
      const toObj = this.objects.find((obj) => obj.id === wire.to_obj_id);

      let fromPos;
      let toPos;
      if (fromObj) {
        const pins = this.gateFactory.getPinPositions(
          fromObj.x,
          fromObj.y,
          fromObj.inputs,
          fromObj.outputs
        );
        if (wire.from_pin_type === "out") {
          const pin = pins.outputs?.[wire.from_pin_index];
          fromPos = { x: pin.x, y: pin.y };
        } else {
          const pin = pins.inputs?.[wire.from_pin_index];
          fromPos = { x: pin.x, y: pin.y };
        }
      }

      if (toObj) {
        const pins = this.gateFactory.getPinPositions(
          toObj.x,
          toObj.y,
          toObj.inputs,
          toObj.outputs
        );
        if (wire.to_pin_type === "out") {
          const pin = pins.outputs?.[wire.to_pin_index];
          toPos = { x: pin.x, y: pin.y };
        } else {
          const pin = pins.inputs?.[wire.to_pin_index];
          toPos = { x: pin.x, y: pin.y };
        }
      }

      if (fromPos && toPos) {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(fromPos.x, fromPos.y);
        ctx.lineTo(toPos.x, toPos.y);
        ctx.stroke();
      }
    }
    if (this.draggingConnection) {
      if (this.draggingConnection.from && this.draggingConnection.to) {
        ctx.strokeStyle = "hsl(0, 0%, 10%)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(
          this.draggingConnection.from.x,
          this.draggingConnection.from.y
        );
        ctx.lineTo(this.draggingConnection.to.x, this.draggingConnection.to.y);
        ctx.stroke();
      }
    }

    for (const object of this.objects) {
      const gateProps = this.gateFactory.createGate(
        ctx,
        object.type,
        object.x,
        object.y,
        object.inputs,
        object.outputs
      );
      object.width = gateProps.width;
      object.height = gateProps.height;
    }
    if (
      !this.hoveringObject &&
      this.selectedGateType &&
      this.draggingConnection === null
    ) {
      ctx.globalAlpha = 0.5;
      this.gateFactory.createGate(
        ctx,
        this.selectedGateType.type,
        this.mouseWorld.x,
        this.mouseWorld.y,
        this.selectedGateType.inputs,
        this.selectedGateType.outputs
      );
      ctx.globalAlpha = 1.0;
    }

    ctx.restore();
  }
}
