---
layout: post
title:  "Fizz buzz in Tensorflow?"
breadcrumb: true
author: minh_ha
date: 2018-06-22
categories: minh_ha
tags:
    - Javascript
    - Tensorflow
    - Machine learning
teaser:
    info: I tried teaching a computer some math and learned a couple things along the way
    image: minh_ha/ai_robot.jpg
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---

<image src="{{ site.urlimg }}/minh_ha/ai_robot.jpg" />

# Introduction

If you have been remotely involved in the tech industry, you must have been
hearing about the rise of AI and Machine Learning (ML) at every corner.
The mix of excitement in the potential of what it can do, together with the fear
of the AI overlord, has been keeping many of us developers up at night.
So when google announced the release of the long-waited [TensorFlow.js](https://js.tensorflow.org/)
(a Javascript implementation of their ever popular machine learning library), I gave myself no
choice but to dive right in and solve one of the software world's most infamous
problem: [**Fizz buzz!**](https://en.wikipedia.org/wiki/Fizz_buzz)

### tl;dr
* Disclaimer 1: half way through working on the problem, I realized the same idea
  was indeed circulating in the ML world a while back. I challenged my will power
  to resist reading the [amazing article by an actual ML expert](http://joelgrus.com/2016/05/23/fizz-buzz-in-tensorflow/)
  before figuring it out for myself.
* Like any software project, machine learning is iterative (or it is especially
  so).
* It goes without saying, this is the wrong tool for the job.

<image src="{{ site.urlimg }}/minh_ha/ml_buzz.jpg" />

### What is Fizz buzz... and oh god, why?!...

Oh Fizz buzz, the age-old problem that supposedly [filters out the 99.5% of programmers](http://wiki.c2.com/?FizzBuzzTest)
who can't seem to code. Most of us devs have likely been asked to implement this
[children's multiplication game](https://en.wikipedia.org/wiki/Fizz_buzz) at some
point in our lives.

A refresher for those unfamiliar souls, it goes like this:

> Write a program that prints the numbers from 1 to 100. But for multiples of
> three print “Fizz” instead of the number and for the multiples of five print “Buzz”.
> For numbers which are multiples of both three and five print “FizzBuzz”.

In Javascript, a simple solution takes less than 10 lines of code...

```javascript
for (var i = 0; i < 100; i++) {
  if (i % 15 === 0) console.log("FizzBuzz");
  else if (i % 3 === 0) console.log("Fizz");
  else if (i % 5 === 0) console.log("Buzz");
  else console.log(i);
}
```

... and it almost reads as if itself is the description of the game.
But it's got looping and conditions, all the good stuff that traditional software
boils down to. And in most programming languages, the code will continue to look
mostly the same.

### An entry-level interview question? Must be a piece of cake to solve for an almighty AI to solve!

# Let's jump right in!

The first thing I needed to learn was how ML works differently from traditional
programming. For this, I found the following diagram to be a great summary.

<image src="{{ site.urlimg }}/minh_ha/ml_difference.png" />

For my Fizz buzz program, this means the output of my code is not the Fizz buzz
sequence, but a program that can by itself, figure out how to solve Fizz buzz
(already, this seems to ring very well with the notion of ML being "machines writing
their own code"). This also mean, we needed to establish a ground rule: I am not
allowed to tell the machine what to do explicitly, but rather let it learn by itself
how to solve the problem! (This turns out to be more challenging for my monkey
brain to follow than expected).

The process for doing something like this can be summarized as:

  1. Create training data
  2. Set up the model
  3. Train the model with the training data from `step 1`
  4. Use the model to run inference (aka, watch it magically demonstrate its news
   math skills with an epic Fizz buzz series)

### So I followed the steps...

1) **Create training data:**
   What we will need here is a list of inputs and the corresponding output we want
   our program to give for each input. In other words, a set of numbers, and the
   corresponding Fizz buzz output we expect the program to give. This turned out to
   be not exactly the most readily available dataset in the world, so I am simply going
   to generate this with the code we have earlier, and pretend I just found it after
   an extensive research in a lab... something like this should work:

   _(if you see the problem with this, please feel free to skip this section...
   or read on if you enjoy seeing me fail)_

   ```
   [
     { "x": 0, "y": "fizzBuzz" },
     { "x": 1, "y": 1 },
     { "x": 2, "y": 2 },
     { "x": 3, "y": "fizz" },
     ...
     { "x": 120, "y": "fizzBuzz" }
   ]
   ```

2) **Set up the model:**
   I went ahead and set up an [artificial neural network](https://en.wikipedia.org/wiki/Artificial_neural_network),
   the spooky "simulation of a human brain" that has been in the news. With Tensorflow,
   the code may look something like so:

   ```javascript
     const fizzBuzzModel = tf.sequential();
     fizzBuzzModel.add(tf.layers.dense({ units: 10, inputShape: 1 }));
     fizzBuzzModel.add(tf.layers.dense({ units: 10, activation: "relu" }));
     fizzBuzzModel.add(tf.layers.dense({ units: 1, activation: "softmax" }));
   ```
   This represents a neural net with 1 input, 2 hidden layers of 10 neurons each, and
   finally one output. Internally, each neuron is responsible for a very simple
   task: take a weighted average of the values from all neurons in the previous
   layer, apply the __activation function (`activation`)__ on the value, and pass
   the result on to every neuron on the next layer. During training, the neurons
   will readjust these weights so that the ultimate output of the model is as close
   as possible to the output we have provided the model with. [`"relu"`](https://en.wikipedia.org/wiki/Rectifier_(neural_networks)) 
   and (`"softmax"`)[https://en.wikipedia.org/wiki/Softmax_function] are
   two of many activation functions that are commonly used.


   _(For a more in-depth explanation of neural networks with some code, I highly
   recommend [this Youtube series](https://www.youtube.com/watch?v=XJ7HLz9VYz0))_

   <iframe width="560" height="315" src="https://www.youtube.com/embed/XJ7HLz9VYz0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

3) **Train the model:**
   Training a model is essentially repeating the process of feeding it the input,
   take its output to compare with the expected output, and let the model readjust
   so it can better fit that expected output on the next iteration using a strategy
   called "gradient descent" and "back propagation" (for our purpose, let's not dig
   into how these work...). By repeating the process, our model will theoretically
   pick up on patterns in the data and "learn" to produce the right output for any
   given input.

   We are going to train our ML model over 300 iterations, where `trainingData`
   is the data from above. With Tensorflow.js, the code looks like bellow:

   ```javascript
    const cycles=300
    const learningRate=0.1
    const optimizer = tf.train.sgd(learningRate);
    fizzBuzzModel.compile({
      optimizer: optimizer,
      loss: "categoricalCrossentropy",
      metrics: ["accuracy"]
    });
    for (let i = 0; i <= cycles; i++) {
      const xs = tf.tensor(
        trainingData.map(({ x }) => x)
      );
      const ys = tf.tensor(
        trainingData.map(({ y }) => y)
      );
      await fizzBuzzModel.fit(xs, ys)
    }
   ```
   ### _BOOM! AN ERROR!_ ###

### And back to the drawing board...

Unsurprisingly, the above naive approach did not work at all.
There are many problems here, one being:

* `"fizz"`, `"buzz"` and `"fizzBuzz"` are alien species to our model. They must
  be represented in a format that is understandable by TensorFlow... a vector,
  or [tensor](https://en.wikipedia.org/wiki/Tensor) if you will...

To address these problems, we need to revisit the previous steps and apply some
changes... So here we go again!!!

1) **Create training data:**
   It turned out, there are two main types of problems
   that ML focuses on: **Classification** and **Regression**. In order
   to solve Fizz buzz using ML, we have to bring our problem to one of these two
   domains. Here's the difference

* **Classification** focuses on predicting what **type** (or group, or class) a given
  data point belongs to; while
* **Regression** focuses on predicting what **output value** a given input data point
  would produce.

Although Fizz buzz may appear to be a regression problem at first sight (as it seems
to resemble a simple linear `y = ax + b` problem), it is actually a better represented
as a classification problem. We are basically trying to categorize a given number
into one of 4 categories: **fizz**, **buzz**, **fizzBuzz**, and **none of the above**.
That means our output must be encoded to fit this paradigm. This can be
represented with a vector of 4 numbers as bellow:

* `[1, 0, 0, 0]`: fizz
* `[0, 1, 0, 0]`: buzz
* `[0, 0, 1, 0]`: fizzbuzz
* `[0, 0, 0, 1]`: none of the above

Notice that the structure of the data now resembles a series of "activations",
where each number is either a 1 or 0, and we can interpret the meaning based on
which position is "activated". This is essentially the language that machines
speak: **binary**. After a few tweaks to our original data generation script
_(Shh! it doesn't exist!!!)_, our training data now looks like so:

```json
[
  { "x": 0, "y": [0, 0, 1, 0] },
  { "x": 1, "y": [0, 0, 0, 1] },
  { "x": 2, "y": [0, 0, 0, 1] },
  { "x": 3, "y": [1, 0, 0, 0] },
  { "x": 4, "y": [0, 0, 0, 1] },
  { "x": 5, "y": [0, 1, 0, 0] },
  ...
]
```
_(Fine, since you asked for it, here's the secret script too:)_
```Javascript
range = (min, max) => {
	const output = []
	for(var i = min; i < max; i++){
		output.push(i)
	}
	return output
}
const trainingData = range(0, 100).map(num => ({
	x: num,
	y: [
		Number(num % 3 === 0 && num % 5 !== 0),
		Number(num % 3 !== 0 && num % 5 === 0),
		Number(num % 15 === 0),
		Number(!(num%3===0 || num%5===0 || num%15===0))
	]
}))
```

2) **Set up the model**: After modifying our data structure, we now have to modify
   our model to match up. This only took a minor tweak:

```Javascript
const fizzBuzzModel = tf.sequential();
fizzBuzzModel.add(tf.layers.dense({ units: 10, inputShape: 1 }));
fizzBuzzModel.add(tf.layers.dense({ units: 10, activation: "relu" }));
//The only line changed
fizzBuzzModel.add(tf.layers.dense({ units: 4, activation: "softmax" }));
```

The only change here is in the last line: we have bumped the output units to 4
to reflect the 4 categories the model will predict.

3) **Train the model**

Using the same training code from above, we now get no error! The training runs,
my laptop is screaming from its fan, something is happening!

**Perfect! The machine is ready to learn!!!** or is it?...

4) **Fizz buzz time!!!** (or so I thought)

Once the training has completed, the following code can be used to validate the model:

```Javascript
for(let x = 0; x < 100; x++){
  const data = await fizzBuzzModel
    .predict(tf.tensor([[x]]))
    .data();
  console.log(data.map(num => Math.round(num)));
}
```

Running this code will show the following in the console:

```
[0, 0, 0, 0]
[0, 0, 0, 1]
[0, 0, 0, 1]
[0, 0, 0, 1]
[0, 0, 0, 1]
[0, 0, 0, 1]
[0, 0, 0, 1]
[0, 0, 0, 1]
[0, 0, 0, 1]
[0, 0, 0, 1]
[0, 0, 0, 1]
...
```

Wait a minute, something is wrong... After all that, our model categorized every
single number under the `none of the above` category?!

  <image src="{{ site.urlimg }}/minh_ha/disappointment_buzz.jpg" />

After an hour of turning all the knobs I could think of, I started to question my
life decisions and decided to go watch The Matrix instead... and that's when it
occurred to me! (ok, it might not have actually happen that way, but it might as
well have).

Remember how we said `binary` was the machine's language? As it turns out,
1s and 0s were pretty much the only thing machines really understand.
You know where this is going again...

### To the drawing board it is!!! (Last time, I promise...)

Similar to the human brain, an artificial neural net is a clusters of connected
"neurons", where each one either get "activated" or not, based on some weighted
combinations of activation states of those neurons it is connected to.
For machines, the 1s and 0s are how this activation state is represented.
We have encoded our output data into 1s and 0s, but what about the input? It
would need to be represented as a series of "activation state" somehow as well.

_(well, there are certainly more scientific reasons why this would makes sense,
but let's save the discussion for another time...)_

<image src="{{ site.urlimg }}/minh_ha/morpheus.jpg" />

Converting a number into a series of "activation state" turns out to be as simple
as turning it into a binary vector format. In other words, we are doing the following
conversion:

```
0 => [0, 0, 0, 0]
1 => [0, 0, 0, 1]
2 => [0, 0, 1, 0]
3 => [0, 0, 1, 1]
4 => [0, 1, 0, 0]
5 => [0, 1, 0, 1]
...
```

There is one very practical challenge here that we should recognize: there is an
upper limit to what number we can represent with this format! With the above 4-bit
system, we can only reach a maximum of __2^4__, or __16__.

Additionally, changing the shape of the input data requires a change in the shape
of our model as well. Even further, the more bits we use, the more computationally
expensive training our model will become. With a 32-bit system (a number used by
most computers up to the late 2000s), we can represent numbers up to 2,147,483,647.
Certainly training a model on a dataset that big is not a task my poor laptop was
meant to do. If we were to do it however, we would be doing so only on a subset
of the data, and hope for the machine to have learned some pattern in the subset
that applies to the rest of the dataset as well.

I threw a dart and decided to go with 8-bit. That's how the best decisions are
made right? Actually, 8 bits would give us up to 255, which is way more than enough
if we strictly want to stick with the original Fizz buzz spec.

Although these considerations may seem arbitrary and unrelated to machine
learning, working with limited resources and specific domain is a very real part
of any software project, and so it is for ML.

So let's revisit our steps!

1) **Create training data:** With some tweak to our (theoretically non-existence)
   data-generation code, we now have something that looks like so:

```json
[
  { "x": [0, 0, 0, 0, 0, 0, 0, 0], "y": [0, 0, 1, 0] },
  { "x": [0, 0, 0, 0, 0, 0, 0, 1], "y": [0, 0, 0, 1] },
  { "x": [0, 0, 0, 0, 0, 0, 1, 0], "y": [0, 0, 0, 1] },
  { "x": [0, 0, 0, 0, 0, 0, 1, 1], "y": [1, 0, 0, 0] },
  { "x": [0, 0, 0, 0, 0, 1, 0, 0], "y": [0, 0, 0, 1] },
  { "x": [0, 0, 0, 0, 0, 1, 0, 1], "y": [0, 1, 0, 0] },
  ...
  { "x": [1, 1, 1, 1, 1, 1, 1, 1], "y": [0, 0, 1, 0] }
]
```

Now that we have more data than we really need, let's sample the data in the spirit
of "proper" ML. This means we will not train the model on the full population, but
a subset of it, to leave room for a dataset we can use to test our model. We will
do this by "proxying" a 90% random selection with a "90% probability of selection",
with something like so:

```Javascript
// where population is the full set above
const trainingData = population.filter(() => Math.random() < 0.7)
const testingData = population.filter(sample => !trainingData.includes(sample))
```

It is very important that we get a random set across the whole population rather
than simply taking the first 90%. This is because the first 90% will not use the
upper bits in their encoding, so our model will not be able to learn any pattern
that may appear in those upper bits.

2) **Set up the model:**

Only a minor tweak is needed to our model shape: change `inputShape` to `16`

3) **Train the model:** We can use the same training code as the previous attempt
4) **Fizzbuzz time!!!**

Put together, the whole code we have looks like so:

```javascript
// utilities
const range = (min, max) => {
  const output = []
  for(let num = min; num < max; num++){ output.push(num) }
  return output
}
const binarySize = 8
const maxDec = parseInt(
  range(0, binarySize)
    .map(() => 1)
    .join(""),
  2
);
const leftpad = (data, size, paddingChar) =>
  (new Array(size + 1).join(paddingChar || '0')
    + String(data)).slice(-size);
const decimalToBinaryArray = num =>
  leftpad(num.toString(2), binarySize, "0")
    .split("")
    .map(Number);

// generate the data (pretend this does not exist)
const population = range(0, maxDec).map(num => ({
  x: decimalToBinaryArray(num),
  y: [
    Number(num%3 === 0 && num%5 !== 0),
    Number(num%3 !== 0 && num%5 === 0),
    Number(num%15 === 0),
    Number(!(num%3 === 0 || num%5 === 0)),
  ]
}))

// sampling the data
const trainingData = population.filter(() => Math.random() < 0.7)
const testingData = population.filter(sample => !trainingData.includes(sample))

// initialize the model
const fizzBuzzModel = tf.sequential();
fizzBuzzModel.add(tf.layers.dense({ units: 10, inputShape: binarySize }));
fizzBuzzModel.add(tf.layers.dense({ units: 10, activation: "relu" }));
fizzBuzzModel.add(tf.layers.dense({ units: 10, activation: "relu" }));
fizzBuzzModel.add(tf.layers.dense({ units: 4, activation: "softmax" }));

// train the model
const cycles=300
const learningRate=0.1
const optimizer = tf.train.sgd(learningRate);
fizzBuzzModel.compile({
  optimizer: optimizer,
  loss: "categoricalCrossentropy",
  metrics: ["accuracy"]
});
const xs = tf.tensor(
  trainingData.map(({ x }) => x)
);
const ys = tf.tensor(
  trainingData.map(({ y }) => y)
);
for (let i = 0; i <= cycles; i++) {
  const {history: {loss}} = await fizzBuzzModel.fit(xs, ys)
  console.log(loss);
}

const correctSet = await testingData.reduce(async(acc, entry) => {
  const prediction = (await fizzBuzzModel
    .predict(tf.tensor([entry.x]))
    .data())
    .map(Math.round)
  const expectedOutput = entry.y
  const isCorrect = expectedOutput.reduce((isCorrect, num, i) =>
    isCorrect && num === prediction[i],
    true
  )
  return isCorrect ? [...(await acc), entry] : await acc
}, Promise.resolve([]))
const accuracy = correctSet.length / testingData.length
console.log("======================");
console.log("Test accuracy: ", accuracy);
console.log("======================");

// run the fizzBuzz test
console.log("Fizz buzz time!!! ")
for(let x = 0; x < 100; x++){
  const data = await fizzBuzzModel
    .predict(tf.tensor([decimalToBinaryArray(x)]))
    .data();
  const [fizz, buzz, fizzBuzz, none] = data.map(Math.round)
  console.log(
    fizz ? "fizz"
      : buzz ? "buzz"
      : fizzBuzz ? "fizzBuzz"
      : x
  )
}
```

You can visit the [Tensorflow.js website](https://js.tensorflow.org/) and paste
this code in your browser console then press enter to watch the magic.
Here are just a few small modification worth noting:

1. We've added a log of the `loss` in every training cycle. This is a measure of
   **how well the model's prediction is fitting the expected outputs** we have provided
   it with. Which means, the lower we see, the better. While the model is being
   trained, we are expecting to see this number falling. Too low however, might be
   an indication that the model has simply memorized the training dataset rather
   than learning a fundamental patter. If you were using Fizz buzz to teach a child
   about multiplication, memorization is not quite the right strategy we ultimately
   want the child to do, and the same goes for ML.   
2. We've included a computation of the accuracy of the model when predicting from
   our `testingSet`, which is data that has not been previously seen by the model.
   This will give us a picture about how well the model actually picked up on
   underlying patterns that are true for the entire population.
3. We have increased the "depth" of our model, by adding an additional layer.
   This is to account for the higher dimensionality that resulted from increasing
   our inputShape from 1 to 8. The higher the size of our input, the more intricate
   the underlying patter that we are looking for may be, and the more complex our
   model will have to be to find those patters. How these decisions are made is
   a lot more art than science.

And the result?... [insert drum roll...]

```
fizzBuzz
1
2
fizz
4
buzz
fizz
7
8
fizz
buzz
11
fizz
13
14
fizzBuzz
16
17
fizz
fizz
19
buzz
22
23
fizz
25
26
fizz
28
29
fizzBuzz
...
```

## It did it!!!! IT'S ALIVE!!!!

Well, close enough anyway. It did get a few numbers wrong... That is until I noticed
the __accuracy on test data was 34%__... Machine be like:

<image style="width: 500px" src="{{ site.urlimg }}/minh_ha/memorization_meme.jpg" />

At this point however, I think we have gotten quite close to what a "self-taught
Fizz-buzzing machine" can do. There are certainly things we can do to try and
make it do better, such as training it for longer, making it deeper / shallower,
more neurons per layer, different types of layers, and on and on, etc...

An interesting point to mention is that if we run the same code multiple times,
we will get different results. The performance of a model can depend on so many
different things, such as the data it was trained with, such as how each neuron's
**"weight"** was initialized. Since our training dataset was randomly generated,
we cannot easily tell ahead of time how a model would perform. If we fed the
model a dataset that was heavily biased towards **fizz** and not a proportional
**buzz**, it will much more likely to predict fizz. Designing the data is therefore
is a large part of what goes into ML. While a decent amount of work was put into
designing the data structure, we did not quite consider the sampling.

What has this experience taught me? It is clear, machine learning
is different, it is powerful, but it is meant to solve a different type of problems.
It is meant for optimization, and clearly Fizz buzz is not one of them.
While it's true, many problems that would have great impacts on the world are
optimization in essence, a lot of work outside of the machine needs to be done to
even begin to leverage its power. And like all tools, it's just a tool that needs
to be applied to the right problem.
