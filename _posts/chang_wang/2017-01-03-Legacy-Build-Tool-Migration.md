---
layout: post
title:  "Migrating a legacy frontend build system to Webpack"
breadcrumb: true
author: chang_wang
date: 2017-01-03
categories: chang_wang
tags:
    - Javascript
    - Webpack
teaser:
    info: Migrating a legacy frontend build system to Webpack
    image: chang_wang/webpack/browserify.svg
---

DCC Portal is a project that was started in 2013. The build system it uses was fairly modern at the time, but hasn't quite kept up with new developments in the years since.  

### Our legacy build stack
- Grunt with usemin to concat our `.js` and `.css` files  

### Our current build stack
- Webpack with Babel  

## Motivations:

### Maintainability and Code Quality

We had some very large files.


<script src="https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/0.7.23/webcomponents-lite.min.js"></script>
<link rel="import" href="https://cdn.rawgit.com/Download/polymer-cdn/master/lib/google-chart/google-chart.html">

<google-chart
  style="width: 100%; height: 300px; overflow: hidden;"
  type='column'
  options='{
    "title": "Lines of Code in JS files",
    "legend": "none",
    "hAxis": {"textStyle": {"fontSize": 10}},
    "vAxis": {"title":"Lines of Code"},
    "width": "600",
    "height": "300",
    "chartArea": {
      "left": "60",
      "width": "590",
      "height": "290"
    }
  }'
  data="https://rawgit.com/cheapsteak/fe970840a5c12c32b5a0c21b4ab7ee6f/raw/14013ff1f815b715fd748715dba8d8c106551065/lines-of-code-table-data.json"
>
</google-chart>

I suspect this is mostly because creating new files is inconvenient  

  - Create a new file
  - Add it to `index.html` and via a `script` tag, with a filepath relative to the index.html
  - Add the karma config, with a filepath relative to the karma config=

Doesn't seem like a big deal, but sticking it in an existing file is relatively much more frictionless, and that's probably how we ended up with so many files with ~1000 lines of code. 

Having several Angular services or controllers that are each a few hundred lines long all in a `controllers.js`/`services.js`/`directives.js` file makes maintenence work very painful. You have to keep scrolling up and down to reference other things in the same service/controller/directive, but scroll too far and you'll end up in a separate service/controller/directive that has nothing to do with what you're working on.  

Things that weren't Angular modules (mostly functions) also couldn't be modularlized unless they were stuck into either the global variable or into an Angular service

### Development Efficiency
  - Unable to leverage libraries from npm.  
    Many packages are philosophically against making themselves available on bower, e.g. invariant, which has 4 million monthly downloads

### Performance
  - The legacy build system generated one 5MB bundle, 1.5MB of that was a library used on two pages that most users would be unlikely to hit. Being able to split that chunk out and defer loading it until it was needed would save quite a bit of unnecessary transfer and parsing.

### Developer Happiness
  "Arrow functions / destrucuring / spread operators make us happy" is rarely sufficient justification for expending large amounts of time.  

  It is a great side effect though 😉

## Steps

### \<script\> tag to 'require's

One of the first things to do is to change all of the script tag imports `<script src="*"></script>` into `require`s. We had 169 of these script tags so we definitely didn't want to do this manually.

[regexer](http://regexr.com/3etr6) came in handy. Using a pattern of `<script src="(.+)"><\/script>` and a replace string of `require('$1');`, our tags were easily moved from our html file into our entry file for webpack.

### Fix what breaks

Many of the vendor files we're using are expecting its dependencies to be in the global scope, and don't export anything since they're also expecting themselves to be in the global scope. We also had a vendor lib that ommited variable declarations and uses implied globals, which now cause a `ReferenceError: x is not defined` error.  

Luckily, Webpack already has solutions for this in the form of `expose-loader`, `imports-loader`, and `exports-loader`.

Here's an example:

```js
require('expose?donutChooserD3!imports?this=>window&outerRadius=>undefined!exports?donutChooserD3!../vendor/scripts/vcfiobio/donutChooser.d3.js');
```

Let's break that down - 

  - `imports?this=>window&outerRadius=>undefined`
    The module is expecting itself to be in the global scope, so we have to import `this=>window`, setting the value of `this` to `window` for this module.   
    It's also assigning to a variable `outerRadius` without declaring it, so we need to declare the variable first and assign it as `undefined`.
  - `exports?donutChooserD3`
    The module does not export anything, this yanks `donutChooserD3` out from the scope of the module and sets it as the exported value
  - `expose?donutChooserD3!`
    This sets the variable `donutChooserD3` onto the global scope since there are other modules that are expecting it to be there.

[More info on shimming modules with webpack](https://webpack.github.io/docs/shimming-modules.html)

There was one especially egregious library that had 104 objects/functions that needed to be exported into the global. To get that list of the 104 names we needed to add to the "imports" string, we pasted the contents of that library into the console for an about:blank page and ran this:

```js
var objects = [];
var functions = [];
for(var i in this) {
  try{
    if(this[i] instanceof Object && this[i].constructor.toString() === 'function Object() { [native code] }' && this[i].toString().indexOf("native")==-1) {
      objects.push(i);
    } else if ((typeof this[i]).toString()=="function"&&this[i].toString().indexOf("native")==-1) {
      functions.push(this[i].name);
    }
  } catch(e) {
    console.warn('error:', e);
  }
}
console.log(objects.concat(functions));
```

This gave us the list of all the globals that aren't native (i.e. were created by the library).

We saved the list of implicit globals and the list of things to export, and created the require string thusly

```js
// contents of shims/genome-viewer.js
var genomeViewerExports = require('./exports');
var genomeViewerImplicitGlobals = require('./implicit-globals');
var importsParams = genomeViewerImplicitGlobals.map(x => x + '=>undefined').join('&');
var exportsParams = genomeViewerExports.join('&');
var requireString = `imports?${importsParams}!exports?${exportsParams}!../vendor/scripts/genome-viewer/genome-viewer.js`;
module.exports = requireString;
```

For the curious, this generates a require string of 

```
imports?dataTypes=>undefined&transcript=>undefined&GraphLayout=>undefined&Point=>undefined&key=>undefined&filter=>undefined&option=>undefined&source=>undefined&target=>undefined&dbConnection=>undefined&IndexedDBTest=>undefined&start=>undefined&end=>undefined&overPositionBox=>undefined&movingPositionBox=>undefined&selectingRegion=>undefined&eventName=>undefined&dataType=>undefined&xx=>undefined&maxWidth=>undefined!exports?Region&Grid&FeatureBinarySearchTree&FileWidget&BEDFileWidget&GFFFileWidget&GTFFileWidget&TrackSettingsWidget&UrlWidget&VCFFileWidget&InfoWidget&GeneInfoWidget&GeneOrangeInfoWidget&MirnaInfoWidget&ProteinInfoWidget&SnpInfoWidget&TFInfoWidget&TranscriptInfoWidget&TranscriptOrangeInfoWidget&VCFVariantInfoWidget&ConsequenceTypeFilterFormPanel&FormPanel&GoFilterFormPanel&MafFilterFormPanel&PositionFilterFormPanel&SegregationFilterFormPanel&StudyFilterFormPanel&VariantBrowserGrid&VariantEffectGrid&VariantFileBrowserPanel&VariantGenotypeGrid&VariantStatsPanel&VariantWidget&CheckBrowser&GenericFormPanel&HeaderWidget&JobListWidget&LoginWidget&OpencgaBrowserWidget&ProfileWidget&ResultTable&ResultWidget&UploadWidget&CircosVertexRenderer&DefaultEdgeRenderer&DefaultVertexRenderer&Edge&Vertex&DataSource&FileDataSource&StringDataSource&TabularDataAdapter&UrlDataSource&FeatureDataAdapter&BamAdapter&BEDDataAdapter&CellBaseAdapter&DasAdapter&EnsemblAdapter&FeatureTemplateAdapter&GFF2DataAdapter&GFF3DataAdapter&GTFDataAdapter&OpencgaAdapter&VCFDataAdapter&AttributeNetworkDataAdapter&DOTDataAdapter&JSONNetworkDataAdapter&SIFNetworkDataAdapter&TextNetworkDataAdapter&XLSXNetworkDataAdapter&IndexedDBStore&MemoryStore&FeatureChunkCache&FileFeatureCache&BamCache&NavigationBar&ChromosomePanel&KaryotypePanel&StatusBar&TrackListPanel&Track&AlignmentTrack&FeatureTrack&GeneTrack&Renderer&AlignmentRenderer&ConservedRenderer&FeatureClusterRenderer&FeatureRenderer&GeneRenderer&HistogramRenderer&SequenceRenderer&VariantRenderer&VcfMultisampleRenderer&GenomeViewer&Point&IndexedDBTest&Utils&SVG&CellBaseManager&OpencgaManager&EnsemblManager&GraphLayout!../vendor/scripts/genome-viewer/genome-viewer.js
```

For maintenence reasons, we didn't want to check this generated string in, and since require strings couldn't be dynamic, in our code we [require in `require(process.env.GENOME_VIEWER_REQUIRE_STRING)`](https://github.com/icgc-dcc/dcc-portal/commit/6bd5a47dad0217ccaf8f76b5d6a24b455d568f65#diff-e1cf138b0fa5efafe4000a20da01e440R69)), and then [use Webpack's DefinePlugin to replace `process.env.GENOME_VIEWER_REQUIRE_STRING` with the value exported from `shims/genome-viewer.js`](https://github.com/icgc-dcc/dcc-portal/blob/develop/dcc-portal-ui/config/webpack.config.dev.js#L127).

### Code splitting

Splitting out a library into a separate deferred bundle is as simple as [wrapping `require.ensure([], require => { /**/ })`](https://github.com/icgc-dcc/dcc-portal/blob/c889673cd336f82b439e433fb080779cd548d772/dcc-portal-ui/app/scripts/genomemaps/js/viewer.js#L147) at the very top of directive link functions where the library is used. Since we're using an arrow function, context still remains the same, the directive just takes a bit longer to initialize  

## Next steps

### Migrate from lodash@3 to lodash@4.  
  It's unfortunate that there doesn't seem to be a completely painless way to upgrade from v3 to v4.  

  [lodash-migrate](https://www.npmjs.com/package/lodash-migrate), [lodash-codemods](https://www.npmjs.com/package/lodash-codemods), and [eslint-plugin-lodash](https://www.npmjs.com/package/eslint-plugin-lodash) all help, but still require some level of human effort that's relatively higher than dropping in a library.

  Still, the benefits of having access to some of the new utility functions without having to separately install each package outweigh the cost of running and potentially cleaning up after a codemod.  

### Migrate away from Bower.  
  We're currently using both Bower and npm, with new dependencies using npm.  
  
  We should be able to migrate most of the packages still using bower without issue, but there are a few libraries whose versions may be so old that they aren't available on npm, or they may have been abandoned. For those we may either internalize the dependencies (somewhat icky path of least resistence), upgrade to the versions that are available on npm (will need to test for regressions), or publish to npm ourselves (namespaced, of course).

### Make windows rampup easier  
  In the process of our build tool upgrade, we've moved from Ruby Sass to node-sass and removed the dependency on Ruby. Ruby was something that tended to snag developers on Windows machines during rampup, and we had hoped that node-sass would alleviate that problem. It turns out node-sass can be troublesome to setup on Windows as well, with binaries sometimes not downloading correctly, and the [recommended version of Visual Studio (2013) no longer being available](https://github.com/sass/node-sass/issues/1838).  
  
  A pure node solution would be ideal. However, although there is a pure JS implementation of Sass in [sass.js](https://github.com/medialize/sass.js/) (libsass run through emscripten), it does warn that node-sass is "considerably faster". The tradeoff in compilation speed would not be worth it to switch to sass.js for everyone, but perhaps we could look into using [sassjs-loader](https://github.com/NickHeiner/sassjs-loader) for windows environments only, or make it an opt-in.
