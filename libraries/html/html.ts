import "setimmediate";
import {Program, Library, createId, RawValue, RawEAV, RawMap, handleTuples} from "../../src";

const EMPTY:never[] = [];

export interface Instance extends HTMLElement {
  __element: RawValue,
  __source: HTML,
  //__styles?: RawValue[],
  //__sort?:RawValue,
  //__autoSort?:RawValue,
  //__listeners?: {[event:string]: boolean},
  //__capturedKeys?: {[code:number]: boolean}
}

export class HTML extends Library {
  static id = "html";

  /** Topmost element containing root elements. */
    _container:HTMLElement;
    _canvas: HTMLCanvasElement;
  /** Instances are the physical DOM elements representing table elements. */
  _instances: Instance[][] = [];
  _paths: number[][] = []; 

  setup() {
    // If we're not in a browser environment, this library does nothing
    if(typeof document === "undefined") {
      this.handlers = {} as any;
      return;
    }

    this._container = document.createElement("div");
    this._container.setAttribute("program", this.program.name);
    document.body.appendChild(this._container);
    let canvas = this._canvas = document.createElement("canvas");
    canvas.setAttribute("width","1000");
    canvas.setAttribute("height","1000");
    this._container.appendChild(canvas);

    var context = canvas.getContext('2d');
    if (context !== null) {
      var centerX = canvas.width / 2;
      var centerY = canvas.height / 2;
      var radius = 10;

      context.beginPath();
      context.arc(centerX, centerY, radius, 0, 2 *  Math.PI, false);
      context.fillStyle = 'green';
      context.fill();
      context.lineWidth = 1;
      context.strokeStyle = '#003300';
      context.stroke();
    }


  }

  protected decorate(elem:Element, value: RawValue): Instance {
    let e = elem as Instance;
    e.__element = value;
    e.__source = this;
    e.textContent = `${value}`;
    this._container.appendChild(e);
    return e;
  }

  protected addInstance(table: number, row: number, column: number, value: number) {
    row = row - 1;
    column = column - 1; 
    //if(id === null || id === "null") throw new Error(`Cannot create instance with null id for element '${elemId}'.`);
    if (this._instances[row] === undefined) {
      this._instances[row] = [];
    }
    
    /*
    let instance = this._instances[row][column];
    if (instance == undefined) {
      this._instances[row][column] = this.decorate(document.createElement("div"), value);
    } else {
      instance.textContent = `${value}`;
    }*/




    if (this._paths[row] === undefined) {
      this._paths[row] = [];
    }
    this._paths[row][column] = value;
    
    //let n = new Node();
    //this._container.appendChild(n);
    //if(instance) throw new Error(`Recreating existing instance '${id}'`);
    //if(ns) instance = this.decorate(document.createElementNS(""+ns, ""+tagname), elemId);
    //else instance = this.decorate(document.createElement(""+tagname), elemId);
    //if(!this._elementToInstances[elemId]) this._elementToInstances[elemId] = [id];
    //else this._elementToInstances[elemId].push(id);
    //return this._instances[id] = instance;
    this.changing();
  }

  rerender() {
    let canvas = this._canvas;
    let context = canvas.getContext("2d")!;
    context.clearRect(0, 0, canvas.width, canvas.height);
    let radius = 6;
    for (let path of this._paths) {
      let centerX = path[0] / 10;
      let centerY = path[1] / 10;
      context.beginPath();
      context.arc(centerX, centerY, radius, 0, 2 *  Math.PI, false);
      context.fillStyle = 'green';
      context.fill();
      context.lineWidth = 1;
      context.strokeStyle = '#003300';
      context.stroke();
    }
  }

  _isChanging = false;
  changed = () => {
    this.rerender();
    this._isChanging = false;
  }

  changing() {
    if(!this._isChanging) {
      this._isChanging = true;
      setImmediate(this.changed);
    }
  }

  handlers = {
    "export instances": handleTuples(({adds, removes}) => {
      for(let remove of removes || EMPTY) {
        //this.removeInstance(instanceId);
      }
      for(let [handler, table, row, column, value] of adds || EMPTY) {
        this.addInstance(table, row, column, value);
      }
    })
  };

};

Library.register(HTML.id, HTML);
(window as any)["lib"] = Library;