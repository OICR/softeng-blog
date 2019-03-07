---
layout: post
title: 'Accelerate data visualization with Stardust, a WebGL Platform'
breadcrumb: true
author: henry_zhao
date: 2019-03-06
categories: henry_zhao
tags:
  - Javascript
  - WebGL
  - Stardust
teaser:
  info: Data visualization with massive data could be fine in your browser
  image: henry_zhao/stardust.png
header:
  version: small
  title: Software Engineering Blog
  image: header-logo-crop.png
  icon: icon-blog
---

<image src="{{ site.urlimg }}/henry_zhao/future_world.jpg" />

# Introduction

Genomic data is huge and disorganized. To provide researchers a powerful data analysis & management platform, we traditionally use d3, a popular data processing library. It has a wealth of tools that can use SVG to portray and manipulate data patterns.
For example, GDC's human figure was implemented in d3:

<image src="{{ site.urlimg }}/henry_zhao/human_body.png" />

However, when the data set is too big(larger than 10000 nodes), there will be an inevitable DOM operation bottleneck. It makes me think about what kind of tools can improve or even replace d3 to be able to visualize data faster.
So first we should understand what SVG is, and what are the possible causes of a bottleneck.

### SVG

SVG is a vector graphic format, based on XML, and is is used to display a variety of graphics on the Web and other environments. Since SVG are defined in XML, every SVG element is appended to the DOM which is big performance cost(It is the reason that reactjs use virtual DOM to avoid DOM operation).

### WebGL

There is a potential way to replace SVG which is WebGL. WebGL (Web Graphics Library) is a JavaScript API for rendering interactive 3D and 2D graphics within any compatible web browser without the use of plug-ins. WebGL does so by introducing an API that closely conforms to OpenGL ES2.0 that can be used in HTML5 canvas elements. It provides local computing resources API to accelerate the rendering of the graphics and avoids massive operations of DOM. Therefore, it is naturally suitable for large data manipulation.

[WebGL Example](https://webglsamples.org/)

<image src="{{ site.urlimg }}/henry_zhao/webgl_building.gif" />

There are a lot of WebGL libraries for data visualization. I will use [stardust](https://stardustjs.github.io/) as an example to demonstrate how to implement it.

### Stardust

First install stardust:

```javascript
import Stardust from 'stardust-core';
import 'stardust-webgl';
```

Create a platform object:

```javascript
var platform = Stardust.platform('webgl-2d', canvasNode, width, height);
```

The platform here is the based object of the canvas. All the graphics will be input into this object and drawn on a canvas. The first variable 'webgl-2d' import stardust-webgl into the platform. The second variable is a reference of html node.

Start from here, we can add the graphic object like rect or circle into the canvas.

Rect:

```javascript
var rectMark = Stardust.mark.rect();
var rects = Stardust.mark.create(rectMark, platform);
```

Circle:

```javascript
var circleMark = Stardust.mark.circle();
var circles = Stardust.mark.create(circleMark, platform);
```

To change the color of object:

```javascript
circles.attr('color', [0, 0, 0, 0.5]);
```

First three elements in the array represent the color(black). The last 0.5 is for transparency.

Add the radius of the circle:

```javascript
circles.attr('radius', 2);
```

Bind data:

```javascript
var data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
circles.data(data);
```

Add mouse event:

```javascript
    this._canvasNode.onmousedown = e => {
      let bounds = this._canvasNode.getBoundingClientRect();
      var x = e.clientX - bounds.left;
      var y = e.clientY - bounds.top;
      var pos = { x: x, y: y };
      window.open().document.write(JSON.stringify(pos));
    };
  }
 canvasNode.onmousemove = e => {
      let bounds = this._canvasNode.getBoundingClientRect();
      var x = e.clientX - bounds.left;
      var y = e.clientY - bounds.top;
      var pos = { x: x, y: y };
      var p = this._platform.getPickingPixel(x * 2, y * 2);
      var circles2 = Stardust.mark.create(circleMark, this._platform);
      var remove = document.getElementById('Div1');
      if (remove) remove.parentNode.removeChild(remove);
      if (p) {
        this._platform.clear();
        this._marks.rects.render();
        this._marks.circles.render();
        circles2.attr('center', d => [7 * d.x + 23, 7 * d.y + 23]);
        circles2.attr('radius', 2);
        circles2.attr('color', [1, 0, 0, 1]);
        circles2.data([p[0]._data[p[1]]]);
        circles2.render();
        var t1 = new ToolTip(
          this._canvasNode,
          { x: x, y: y, w: 10, h: 10 },
          'x:' + x + ' y:' + y,
          100,
          1000
        );
        t1.check(e);
      } else {
        circles2.data([]);
        circles2.render();
      }
    };
```

In general, Stardust has all the basic functionality of d3.

### Performance

To demonstrate the performance of stardust, I will mock up oncogrid features in GDC portal. The purpose of oncogrid is to demonstrate the mutation pattern between genes and patients. In the gif, there are less than 10,000 data points in the grid.

[Oncogrid](https://portal.gdc.cancer.gov/exploration?searchTableTab=oncogrid)

<image src="{{ site.urlimg }}/henry_zhao/oncogrid_demo.gif" />

It takes 1 more seconds to scripting and rendering.
<image src="{{ site.urlimg }}/henry_zhao/oncogrid_performance.png" />

In my implementation, I added 30,000 rects and circles data points with randomly position into a stardust platform to mock up the grid in oncogrid.

<image src="{{ site.urlimg }}/henry_zhao/stardust_grid.png" />

And here is performance:
<image src="{{ site.urlimg }}/henry_zhao/stardust_performance.png" />

As a result, grid in stardust is 2 times faster than oncogrid in scripting and 500 times faster in rendering. Here is my implementation code.

```javascript
import Stardust from 'stardust-core';
import 'stardust-webgl';
import * as d3 from 'd3';
export default class GridVisualization {
  constructor(container) {
    this._container = container;
    this._canvas = d3.select(container).append('canvas');
    this._canvasNode = this._canvas.node();
    this._svg = d3.select(container).append('svg');
    this._svgAxis = this._svg.append('g').classed('axis', true);

    let platform = Stardust.platform('webgl-2d', this._canvasNode, 1500, 600);

    this._platform = platform;
    var rectMark = Stardust.mark.rect();
    var rects = Stardust.mark.create(rectMark, this._platform);
    var circleMark = Stardust.mark.circle();
    var circles = Stardust.mark.create(circleMark, this._platform);
    this._marks = {
      rects: rects,
      circles: circles,
    };
    this._canvasNode.onmousemove = e => {
      let bounds = this._canvasNode.getBoundingClientRect();
      var x = e.clientX - bounds.left;
      var y = e.clientY - bounds.top;
      var pos = { x: x, y: y };
      var p = this._platform.getPickingPixel(x * 2, y * 2);
      var circles2 = Stardust.mark.create(circleMark, this._platform);
      var remove = document.getElementById('Div1');
      if (remove) remove.parentNode.removeChild(remove);
      if (p) {
        this._platform.clear();
        this._marks.rects.render();
        this._marks.circles.render();
        circles2.attr('center', d => [7 * d.x + 23, 7 * d.y + 23]);
        circles2.attr('radius', 2);
        circles2.attr('color', [1, 0, 0, 1]);
        circles2.data([p[0]._data[p[1]]]);
        circles2.render();
        var t1 = new ToolTip(
          this._canvasNode,
          { x: x, y: y, w: 10, h: 10 },
          'x:' + x + ' y:' + y,
          100,
          1000
        );
        t1.check(e);
      } else {
        circles2.data([]);
        circles2.render();
      }
    };
    this._canvasNode.onmousedown = e => {
      let bounds = this._canvasNode.getBoundingClientRect();
      var x = e.clientX - bounds.left;
      var y = e.clientY - bounds.top;
      var pos = { x: x, y: y };
      window.open().document.write(JSON.stringify(pos));
    };
  }
  addTooltips() {}
  // if data looks like this: data = [{ x: 16, y: 1 }, { x: 2, y: 3 }, {x: 4, y: 7}] and width is 20;
  // chartData will look like this: chartData = [{p1: [], p2: []}, {p1: [], p2: []}, {p1:[], p2: []}]
  setChartData(data, rowCount, colCount, height, width) {
    console.log('rect data size', data.filter(d => d.show).length);

    let chartData = data.filter(d => d.show).map(d => ({
      p1: [
        (width / rowCount + 1) * d.x + 20,
        (height / colCount + 1) * d.y + 20,
      ],
      p2: [
        (width / rowCount + 1) * d.x + 20 + width / rowCount,
        (height / colCount + 1) * d.y + 20 + height / colCount,
      ],
    }));
    return chartData;
  }
  rendered() {
    var rectData = [];
    for (var i = 0; i < 250; i++) {
      for (var j = 0; j < 100; j++) {
        var random_boolean = Math.random() >= 0.6;
        rectData.push({ x: i, y: j, show: random_boolean });
      }
    }
    var circleData = [];
    for (var i = 0; i < 250; i++) {
      for (var j = 0; j < 100; j++) {
        var random_boolean = Math.random() >= 0.6;
        circleData.push({ x: i, y: j, show: random_boolean });
      }
    }
    circleData = circleData.filter(d => d.show);
    this._marks.rects.attr('p1', d => d['p1']);
    this._marks.rects.attr('p2', d => d['p2']);
    this._marks.rects.attr('color', d => [0, 254, 127, 1]);
    this._marks.rects.data(this.setChartData(rectData, 250, 100, 600, 1500));
    this._marks.rects.render();

    this._marks.circles.attr('center', d => [7 * d.x + 23, 7 * d.y + 23]);
    this._marks.circles.attr('radius', 2);
    this._marks.circles.attr('color', [0, 0, 0, 1]);
    this._marks.circles.data(circleData);
    this._marks.circles.render();
    this._platform.beginPicking(
      this._canvasNode.width,
      this._canvasNode.height
    );
    this._marks.rects.render();
    this._marks.circles.render();
    this._platform.endPicking();
  }
}
```

### Conclusion

Although my implementation doesn't cover many real scenarios, there is no doubt that stardust has a better rendering performance than d3. Nevertheless, Stardust doesn't aim at replacing d3, but more at improving performance in rendering and animating points. The creator of Stardust actually recommends d3 being used to render a scatterplot’s axes and handle interactions such as range selections, but Stardust used to render and animate the points.
