---
layout: post
title:  "How to Customize the Toolbar in React-Plotly.js"
breadcrumb: true
author: sam_rich
date: 2020-02-23
categories: sam_rich
tags:
    - JavaScript
    - GDC Portal
    - Visualization
    - React
teaser:
    info: Using Plotly.js's built-in methods to make a bigger, better toolbar.
    image: sam_rich/plotly/thumbnail.png
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---

[Plotly.js](https://plot.ly/javascript/) is an open-source data visualization tool that you can embed in your web application. There's also a React version that requires Plotly.js as a dependency: [React-Plotly.js](https://plot.ly/javascript/react/).

Plotly.js includes a toolbar or "modebar" that, by default, is visible when you hover over a plot. There are various [configuration options](https://plot.ly/javascript/configuration-options/#force-the-modebar-to-always-be-visible), but none for changing the appearance or positioning of the buttons. 

We wanted to change how the toolbar looks, to make it consistent with the rest of the [GDC Portal](https://portal.gdc.cancer.gov/). Plotly.js doesn't give you this option out of the box. If you want to change how the modebar looks, that means making a whole new toolbar, and remotely or programmatically invoking Plotly.js functionality from elsewhere in the app.

## How to make your own modebar

First, you have to [customize the Plotly.js bundle](https://github.com/plotly/React-Plotly.js#customizing-the-plotlyjs-bundle), which is as simple as changing how you import the packages.

By default, React-Plotly.js loads Plotly.js and creates a `<Plot />` element. You can create `<Plot />` on your own for more customization.

```js
// default implementation
import Plot from 'React-Plotly.js';

// custom bundle implementation
import Plotly from 'plotly.js';
import createPlotlyComponent from 'React-Plotly.js/factory';

const Plot = createPlotlyComponent(Plotly);
```

You can also use this opportunity to import a [partial bundle](https://github.com/plotly/plotly.js/blob/master/dist/README.md#partial-bundles). By default, React-Plotly.js loads Plotly.js, which is quite heavy, at 2mb minified. For this example we'll use the [basic partial bundle](https://github.com/plotly/plotly.js/blob/master/dist/README.md#plotlyjs-basic), which is 853kb minified.

```js
import Plotly from 'plotly.js/lib/index-basic';
```

Next, modifying the `<Plot />` element. Use [Plotly.js's `onInitialized` method](https://github.com/plotly/React-Plotly.js/#basic-props) to get the `graphDiv` (the DOM node where the plot is displayed).

```js
export default class CustomPlotlyModeBar extends React.Component {
  state = { graphDiv: null };

  onInitialized = (figure, graphDiv) => {
    this.setState({ graphDiv }); 
  };

  render() {
    return (
      <>
        {/* quickstart example from React-Plotly.js */}
        <Plot
          // hiding the modebar in this example
          {% raw %}config={{ displayModeBar: false, showlogo: false }}{% endraw %}
          data={[
            {
              x: [1, 2, 3],
              y: [2, 6, 3],
              type: 'scatter',
              mode: 'lines+markers',
              marker: { color: 'red' }
            },
            { type: 'bar', x: [1, 2, 3], y: [2, 5, 3] }
          ]}
          {% raw %}layout={{ width: 320, height: 240, title: 'A Fancy Plot' }}{% endraw %}
          onInitialized={this.onInitialized}
        />
      </>
    );
  }
}
```

Next, import the `ModeBarButtons` object:

```js
import ModeBarButtons from 'plotly.js/src/components/modebar/buttons';
```

Referring to the [the source code for modebar buttons](https://github.com/plotly/plotly.js/blob/master/src/components/modebar/buttons.js), make new buttons with the required `data` attributes:

```js
<button
  data-attr="zoom"
  data-name="zoomIn2d"
  data-val="in"
  onClick={this.handleButtonClick}
>
  Zoom In
</button>
```

Add a click handler above the `render()` function in the class:

```js
handleButtonClick = e => {
  const { graphDiv } = this.state;
  e.persist();
  const name = e.target.getAttribute('data-name');
  ModeBarButtons[name].click(graphDiv, e);
};
```

Let's break this down:

- `e.persist()` allows you to use the event's properties asynchronously. In React, you should store event properties in a variable if you want to use them, or they may be nullified to free up memory. If you want to preserve the entire event, as we do here, use `e.persist()`. (See: [Synthetic Events in React](https://reactjs.org/docs/events.html))
- The buttons in `ModeBarButtons` all have `click` methods that take specific arguments - usually the arguments are `graphDiv` and the click event.

Voila! You should be able to zoom in and out using these buttons. This can be replicated for any existing buttons in Plotly.

## Next steps: Using Plotly.js methods to make new buttons

Besides copying existing Plotly.js buttons, we can also tap into other functionality.

By default, Plotly's `toImage` modebar button only offers downloads in a single image format. Thankfully, `downloadImage()` is [exposed as a Plotly.js method](https://github.com/plotly/plotly.js/blob/master/src/components/modebar/buttons.js#L73).

Here are buttons for downloading PNG and SVG images:

```js
<button
  data-format="png"
  data-name="downloadImage"
  data-scale="3" // scale PNGs to 3x so they print clearly
  onClick={this.handleButtonClick}
>
  Download PNG
</button>
<button
  data-format="svg"
  data-name="downloadImage"
  data-scale="1"
  onClick={this.handleButtonClick}
>
  Download SVG
</button>
```

Lastly, the click handler needs to be updated to call `Plotly.downloadImage()` and pass in options.

```js
handleButtonClick = e => {
  const { graphDiv } = this.state;
  e.persist();
  const name = e.target.getAttribute('data-name');
  if (name === 'downloadImage') {
    const format = e.target.getAttribute('data-format');
    const scale = e.target.getAttribute('data-scale');
    Plotly.downloadImage(graphDiv, { format, scale })
  } else {
    ModeBarButtons[name].click(graphDiv, e);
  }
};
```

## Demo

<iframe
  src="https://codesandbox.io/embed/oicr-plotly-modebar-co300?fontsize=14&hidenavigation=1&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="oicr-plotly-modebar"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

## Links

- [React-Plotly.js homepage](https://plot.ly/javascript/react/)
- Plotly forums: [How to trigger a Modebar action from somewhere else?](https://community.plot.ly/t/how-to-trigger-a-modebar-action-from-somewhere-else/2663/12)
- Plotly forums: [Save as .svg instead of .png in modeBar](https://community.plot.ly/t/save-as-svg-instead-of-png-in-modebar/4560)

## Conclusion

If you want to change the look and feel of React-Plotly.js's modebar, you have to make a new modebar and programmatically access Plotly.js's button methods. In the process, you can also make new buttons, and reduce Plotly.js's hefty footprint by using a partial bundle.