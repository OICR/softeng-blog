---
layout: post
title:  "Why Siri Can't Code (Yet)"
breadcrumb: true
author: kevin_hartmann 
date: 2017-07-31
categories: kevin_hartmann
tags:
    - Artificial Intelligence 
    - Semantic Analysis 
    - The 𝕂 framework 
    - Siri
teaser:
    info: "Read this article to learn why Siri can't code (yet), but how she might soon learn!" 
    image: kevin_hartmann/SiriHelp.jpg
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---
### And how she may be able to learn, in the near future...
<image src="{{ site.urlimg }}/kevin_hartmann/SiriHelp.jpg" /> 


Ten years ago, I read an article entitled _Why Johnny Can't Code_. I wasn't very interested in the question. At the time, and even more so today, I was much more interested in something else.

You see, I didn't care very much about why our kids could (or couldn't) develop code of the type we used to write when was a young boy, using the same tools that I had used. Instead, what I wanted to know was: _"Why have those tools for writing and managing code have advanced relatively little over the past thirty years?"_

As a boy, I often wondered if, when, and how, we could eventually be able to give over the task of writing and managing code to the computers themselves. Today, I still wonder. Why can't computers write code for us?

It's still a good question, I think. Fifty or sixty years ago, when people first starting trying to answer it, the answer was fairly obvious. Researchers knew, back then, that their computers couldn't out-do a human programmer at programming,  because their hardware simply didn't have enough processing power, and no one had done enough research yet on the software side to know if such a thing could be done.

Today, that situation has drastically changed. Hardware and software is, without exaggeration, over one trillion times more powerful on modern hardware than it was when Artificial Intelligence research in the 1950s. Modern research into _"artificially intelligent"_ programs, (often called simply _AIs_) has quietly become wildly successful. 

Right now, we have powerful computer programs that have solved problems that researchers in the 1950s weren't even sure could ever be solved by anyone other than a human being. Chess grandmasters have already been beaten by AI programs. Decades ago, computers had already "learned" how to read scanned-in text, and recognize the data within it. These days, our programs are even able to talk, and they're starting to understand speech, too!

Modern AI programs have become so wildly successful that even non-computer experts have started to use them on a daily basis. AIs like Google's _"Ok Google"_ voice search and Apple's _Siri_, have become astoundingly capable, astoundingly "smart". They can not only recognize what we want, they can link up to vast networks of powerful computers from all over the world to get it. 

We need only say what we want out loud: and surprisingly often, our AIs now understand what it is we want from them, and provide it. The reality of modern AIs has quietly crept from shadows of science fiction into the real world, but one staple of science fiction remains out of reach for our current AIs: one thing that we might think would be simple; even obvious for such a machine-based "intelligence". 

Given all of that power, why can't Siri, a computer program herself, interact with the native software environment in which she lives, and create other computer programs? 

Why can't she code?

### Or can she?
<image src="{{ site.urlimg }}/kevin_hartmann/robot.png" /> 

To be fair, to an extent, we already do have certain kinds of programs that can "code"; or at least,
that can generate code for us. While we don't typically think of them as AIs, modern optimizing
compilers generate machine code for us on a daily basis. They do such a good job that few, if any, modern programmers could compete with them directly by generating the same machine code of equal or better quality "by hand";  and even fewer of us would ever want to try. For this particular task, a computer program is already much better at "generating code" than the majority of its human counterparts.

 Vast libraries of existing code let us re-use known solutions to an assortment of problems; and IDEs and syntax checkers help give us hints and assistance; and various syntax checkers and proof verifiers already exist, and are getting better.

 Isn't that enough?

### It's not enough; it's never enough!
<image src="{{ site.urlimg }}/kevin_hartmann/never_enough4.jpg" /> 

For all that they can do, our existing tools take a very limited approach to understanding, verifying, or validating our code. Most of them focus on solving specific problems that are known to occur within a given programming language, such as Findbugs for Java, or Valgrind for C. Our tools work, but for the most part, they can't be said to be very "intelligent"; at least, not in the sense of understanding what the code they generate is supposed to do, or how it's supposed to work. 

Most of the hard part, making sure that the code that our tools produce not only works, but works correctly, and works according to our requirements is left to us, the programmers; and coding errors are so common that we typically rely on entire "QA" departments to help us find and fix these flaws; making mistakes is something that just happens. Our tools catch a few of our mistakes; but they miss a lot more of them. That's not an easy problem to fix.

## Arguing about semantics
<image src="{{ site.urlimg }}/kevin_hartmann/semantics2.png" /> 


One thing that our current tools are lacking is an understanding of what computer scientists call **_semantics_**; the underlying _meaning_ of what our programs do. Instead, most of our tools focus on **_syntax_**; the _representation_ of our code as patterns of symbols. When a programmer defines a programming language, they typically define the syntax very carefully and explicitly, using a mark-up language for syntax such as [BNF](https://en.wikipedia.org/wiki/Backus%E2%80%93Naur_form); but the language's semantics are usually written as an ad-hoc series of rules written in a human language, such as English, if they are even written down at all.

We leave it up to the writer of a compiler or interpreter to correctly translate the meaning of a program from it's syntactic inputs into code whose semantic meaning matches that of the programming language we're writing in. This job isn't an easy or an obvious one.

If we had tools that were capable of understanding and manipulating the code at these deeper levels of semantic understanding, we could automatically verify properties of programs, and even automatically generate correct compilers for languages that don't even exist yet! 

And if we could do that, maybe we could teach Siri (or some other AI) to do that sort of thing, too. Computer Scientists refer to this sort of task as _semantic analysis_. As our AI got really good at this kind of analysis, and could process and manipulate the underlying meaning of the code in useful ways, the tasks that it could perform would become closer and closer to what a human coder could do. At some point, we would probably want to admit that, in some sense, our AI could "understand" the code; in a way that our current programs don't. And once we have an AI that can _understand_ code, an AI that also "knows" how to **write** code is only a small step away.

So, if we know all that, why don't we have these kind of tools already?

### Why? Why must everything be so hard?
<image src="{{ site.urlimg }}/kevin_hartmann/homer-bbq.jpg" /> 

What's the problem? Why hasn't Google, or Apple, or somebody else who's really smart already solved this problem already? Why can't I make Siri do all my coding work for me? What's the hold up?

#### **How hard could it be?**
<image src="{{ site.urlimg }}/kevin_hartmann/how_hard2.jpg" /> 

Well, as you might have guessed, making machines that can think isn't easy.

If it were easy, one of those brilliant Computer Science professors who are doing research on the problem would have solved it by now. After all, these professors are usually the smartest and most gifted people in their field, and when they're not busy teaching other students what they know, they make their living finding out the answers to problems no one else can solve.  These brilliant men and women find research topics like Semantic Analysis _"challenging"_, which suggests that it's a very hard problem to solve.

And of course, they're right.

#### **For one thing, it's partly impossible.**
<image src="{{ site.urlimg }}/kevin_hartmann/frink3.png" /> 

As it turns out, there are a lot of questions in Computer Science that sound easy, but turn out to be impossible. Not merely _"impossibly"_ difficult (as in, _"Gosh, you'd need to be a thousand times smarter than Einstein to figure that one out!"_), but **actually impossible**; that is, mathematically proven not to be solvable, by any means, ever. 

That means if we run across one of these problems, we can't solve it, and neither can Siri. So, in particular, if we try to solve one of these impossible questions using semantic analysis, we can't succeed. 

Sadly, some of these unsolvable questions limit what we can know about the nature of certain programs; which is the exact sort of thing that we want to use semantic analysis to find out.

For example, we can't always know:

### 1. _Given some random program_: **"Will this program ever stop, or is there some combination of inputs that we can give it that will make it run forever?"**

### 2. _Given two random programs_: **"Do these two programs do the same thing?"** (_for all inputs_),  and, worst of all,

### 3. _Given a random program, with random inputs_: **"Is the problem that this program is trying to solve one of those nasty, unsolvable ones?"**


## So, now what?
<image src="{{ site.urlimg }}/kevin_hartmann/bridge.jpg" /> 

So, if we know that we can't always use semantic analysis to understand what a program will do, or even whether or not it's even possible to use semantic analysis to understand our, where do we go from here? What do we do now?

<image src="{{ site.urlimg }}/kevin_hartmann/barbie-doll-semantic-analysis-is-hard-lets-go-shopping.png" /> 

Well, we _could_ just ignore the problem, and not try to solve it. After all, it's hard enough for human programmers to understand what a given section of code does; let alone conveying that meaning in terms simple enough for a machine to understand. 

We _could_ continue to interact with our programs by manipulating their syntax; by making sure that all of the symbols in a language match the right patterns, and are arranged in a valid way. This is how most of our existing programming tools work, so it's obviously useful.  Syntax highlighters, compilers, symbolic debuggers, anti-pattern detectors, and test suites all continue to function mostly (or completely) at the level of syntax. Sure, they do rely upon a human programmer to check that the meaning of the code and the tests are correct. But, we've come a long way with this approach; so it's obviously working!

But, what if we don't **want** to give up on the dream of semantic analysis? What if I really do want to make Siri or one of her fellow AIs do at least part of my work for me? How can we know which programs we can analyze, and which ones we can't? 

**Wait!** Wasn't that last question one of the problems we already know we can't always solve?! _It was?_ Now what? Our dream of perfect semantic analysis is falling apart!

#### **Give up on perfect; settle for wonderful!**
<image src="{{ site.urlimg }}/kevin_hartmann/hammock2.jpg" /> 
We know we can't possibly use semantic analysis to answer all possible questions about all possible programs. 

We also know we can't always tell if the question we're asking about a given program is one that can't be solved.

But just because semantic analysis can't **always** succeed doesn't mean it can't **ever** succeed! In fact, sometimes the answers can be simple and obvious: so obvious that even a machine could figure them out!

For example, we know that at least one program must exist for which it is impossible for us to know, by any means, whether it will always terminate or if it might ever go into an infinite loop.

But it doesn't take a very smart program to figure out that a program that only consists of an infinite loop will never terminate. It's equally obvious that a program that aways returns a constant result will always terminate, no matter what input you give it.

So, we know a computer can do semantic analysis to find out the meaning of at least certain simple programs; and we also know that some programs can't ever be analysed.

**So, how do we tell if semantic analysis can succeed for some random program?**

Research has settled upon two main approaches to this problem.

1) **Stack the deck**
<image src="{{ site.urlimg }}/kevin_hartmann/five_aces.jpg" /> 

It is impossible to know for sure whether or not semantic analysis can succeed for some **randomly** chosen program. But, what if we don't analyze just any old program at random? What if we "cheat", by decided to only work on programs that we already know we can succeed at analyzing semantically? 

Some research projects do take this approach. By writing code in an artificially constructed language that was carefully designed to be analyzable(or a restricted subset of an existing language), they can ensure that any programs that they do encounter can be analysed. The problem with this is, none of our real world programs are written in these restricted languages; we're not even certain that they always can be.

2) **Roll the dice**
<image src="{{ site.urlimg }}/kevin_hartmann/dice.jpg" /> 
 
Try to analyze any program you're given. If you can't, at some point, give up and stop trying.

If you found an answer, great! 

If we gave up, we don't know the answer, but we also don't know _why_ we don't know it. One of those things we can't always know for all programs is whether the reason we failed to find an answer because the question can't be answered at all, or whether there was an answer that we could have found, but failed to.

### How do we get started?

This semantic analysis stuff sounds interesting and all, but how do we actually **do** it? Don't I need a PhD just to get started with this whole thing? Isn't it a purely research thing at this point?

The answers to those questions might have been "yes" a short time ago, but there's a new computing framework out there, designed to make semantic analysis a whole lot easier: in practice, not just in theory!

## Introducing The 𝕂 Framework for Semantic Analysis
<image src="{{ site.urlimg }}/kevin_hartmann/fireworks.jpg" /> 

[𝕂](http://www.kframework.org/) is an exciting new framework for doing semantic analysis of programming languages; from the ground up.

First, we need to define the both the syntax and the semantics of our programming language, using 𝕂. After that, the 𝕂 framework provides you with a whole suite of tools that are designed to help you work with, understand, and analyze programs written in that language! 

What sort of tools do we get? Well, according to the 𝕂 FAQ, you get "a parser, an interpreter, a state-space explorer ... and even a deductive program verifier." In other words, you provide the language; and the 𝕂 framework gives you the tools to run your language, to analyze programs in it, and to debug it; automatically!

The 𝕂 framework takes the "roll the dice" approach to semantic analysis; but it tries hard to succeed in all the cases where it **can** succeed. If the designers had instead opted for the more restricting "stack the deck" approach, you would be limited in what kind of semantics you could use 𝕂 to define.

As it is, the sky seems to be the limit for what semantics you can define using 𝕂! Not only can 𝕂 be used to define programming languages, the designers have made it capable of formally defining the semantics of such things as formal logic systems, and type systems, as well. 𝕂 is not only designed to handle the realities of real world programming language designs, the designers explicitly took all of difficult to implement features of modern programming languages, bundled them all together into a language definition called _"Challenge"_; then proceeded to use 𝕂 semantics to define the _Challenge_ language as an example of what their system can do!

One of the great things about 𝕂 is the high level of knowledge of the people who work on it.  When you use a software framework, it's always nice to know that the people who wrote it had a good idea of the problem at hand, before they started slinging code. The people who wrote 𝕂 clearly did.

𝕂 is a framework that does Semantic Analysis, designed and written by experts who know Semantic Analysis so well that they teach university students about it. They know what they're doing; the only challenge is keeping up with them! 

Quick, someone tell Siri!

### How do they do it?
<image src="{{ site.urlimg }}/kevin_hartmann/blueprint.jpg" /> 

Previously, one of the most popular representation for formally expressing and reasoning about the semantics of computer systems has been so-called [_"Hoare Triples"_](https://en.wikipedia.org/wiki/Hoare_logic) (invented by Tony Hoare in 1969), which encode how a piece of code changes the state of the system with three elements: a set of assertions about the state of the system, called the _preconditions_; the associated code, called the _command_, and a series of assertions about the new state of the system, called _postconditions_.

In addition, a logical system, called _Hoare logic_, is widely used for reasoning about the semantic meaning of Hoare Triples. It consists of a series of initial axioms, together with inference rules for reasoning about various programming language constructs. The difficulty with this system was that it's rules were very specific; they had to describe the effect of a change in terms of its impact on the entire system, and not just on the elements of the system that were relevant to the rule. 

The 𝕂 framework is one of the few successful alternatives to Hoare Logic available today. Here's how it works.

𝕂 lets you define the semantic meaning of an entire programming language in terms of three elements: its **syntax**, its **context**, and a series of **matching rules**.  

To encode the _syntax_ of a program, 𝕂 uses a BNF style, augmented with features to make interfacing with the semantics of the language easier. To track the _context_, 𝕂 uses what it calls "𝕂 cell structures". These are various types of collection data structures, such as lists, sets, maps, and multi-sets, which track the state of the abstract system in which program semantics are evaluated. Each 𝕂 cell structures can have a label to describe it; and 𝕂 cell structures can be nested. This makes it easy to model the context of a given system. 

One special type of 𝕂 cell structure is just called "K", and it represents a list of _computations_ to be computed in the environment. A _computation_ is just a series of program instructions to be executed in parallel. For example, the context for a very simple programming language with only global variables might consist of a top level 𝕂 cell simply labeled "top". Inside it might be two other cells, a "K" code structure to represent the program, and a mapping of variable names to values to represent global variables". 

Lastly, 𝕂 defines _matching rules_. Unlike rules in Hoare logic, K's matching rules describe only as much of the context as is necessary to define the rule; allowing them to be modular, and re-usable. It is these matching rules that define the semantic meaning of the programming language. How do they do that? 

Each rule consists of two parts: a part of the context to match (usually including the first element of the "K" structure, which represents the next computation to be evaluated), and a rule for what to replace it with. Each rule also defines the both the parts of the match that it will re-write itself, and the parts that it will leave unmodified. Any part of the match which a rule won't modify can be modified concurrently by other rules, but the parts of the term that the rule does modify won't be modified by any other rule until the current rule finishes executing.   

𝕂 rules are applied, concurrently, as soon as they apply. All rules either perform a computation, or re-arrange terms in the configuration so that a computational rule can be matched.

Matching rules are not only powerful enough to model concurrency, they can also model non-deterministic behaviours as well. 𝕂 rules are unconditional and context insensitive; and they are applied in parallel as soon as they match.  
 
Here's what the configuration for a simple programming language looks like in 𝕂.

<image src="{{ site.urlimg }}/kevin_hartmann/K_language_config.png" /> 

And here's the semantic definition of the programming language itself

<image src="{{ site.urlimg }}/kevin_hartmann/K_language.png" />

Both examples are taken directly from section 3.3 of [An Overview of the K Semantic Framework](http://fsl.cs.uiuc.edu/index.php/An_Overview_of_the_K_Semantic_Framework)

But don't worry. You don't need to write all of those fancy math symbols if you don't want to.
While 𝕂 allows you to display these formal computer science symbols using their preferred symbolic notation, it also lets you enter them as plain text, and generates the corresponding symbols for you.

Here's an example taken from [The K Primer (version 3.3)](http://fsl.cs.illinois.edu/index.php/The_K_Primer_(version_3.3)). It shows the plain text version of a simple language with concurrency support, as well as the fancy LaTEX markup version.

<image src="{{ site.urlimg }}/kevin_hartmann/K_pretty.png" />

Here's how the plain text markup looks, and how the corresponding symbolic representation is generated.

  

#### **How does all this computer theory help Siri and I?**
<image src="{{ site.urlimg }}/kevin_hartmann/grumpy_cat.jpg" /> 

Consider this scenario. Suppose you used the 𝕂 framework to define all the rules for the syntax and expected semantic behaviour for some real world language, like, say, Javascript.

You could use their program verifier tool to prove  that programs within the language were **formally correct** _according to the semantic meaning of the Javascript language itself_.

In other words, you could find out whether or not a program was a valid program within that programming language, and do so **using a computer program**.

And if a computer program within the 𝕂 framework can be taught to work like that, Siri can, too!

That's already a valuable real world programming task that Siri could for you, and that's hard (_ie. nearly impossible_) for the average programmer to do by hand.

In other words, by using the 𝕂 framework, we're already getting very close to teaching Siri to code!

#### **Doesn't every compiler and interpreter already do this sort of thing during it's parsing phase?**
<image src="{{ site.urlimg }}/kevin_hartmann/farnsworth1.jpg" /> 

Only in a very limited way. Compilers almost always do their parsing by addressing just the syntax of the language as much as possible. They tend to grow increasingly complex whenever they struggle to manage the complexities of real world languages with real world semantics. Most language parsing tools, be they compilers, interpreters, debuggers, IDEs, or static analysis tools don't try to address the semantics at all, leaving them implicitly defined, and as a result, often inconsistently implemented from tool to tool. 

This kind of confusion of language semantics can cause a program that works perfectly well with one tool to unexpectedly fail when run by another, despite both tools supposedly "understanding" the same language. 

Semantic analysis takes a completely different approach to analyzing the code. Instead of looking at the **syntax** of the language, and the relevant rules, and trying to generate the equivalent block of machine code, semantic analysis focuses on making sure the description of the program's interaction with it's inputs, outputs, and environment is always correct _according to the rules of the language itself_. This not only establishes a standard for _how_ a programming language _should_ behave, it gives a way to _verify_ the areas of compliance and non-compliance of with standard.

#### **All this theory is nice, but can it actually be done in practice?**
<image src="{{ site.urlimg }}/kevin_hartmann/square_wheel2.jpg" /> 

Yes! We know this for sure, because the same people who are developing the 𝕂 system have already done it! 
Here's a link to their research paper describing how they did it! [KJS: A Complete Formal Semantics of JavaScript](http://fsl.cs.illinois.edu/index.php/KJS:_A_Complete_Formal_Semantics_of_JavaScript)

They first described the entire Javascript language in 𝕂, directly from the ECMA5 specifications.

They then ran their program verifier against all of the major Javascript interpreters.

How well did that work? I'll let their abstract speak for itself:

>
This paper presents KJS, the most complete and throughly tested formal semantics of JavaScript to date. Being executable, KJS has been tested against the ECMAScript 5.1 conformance test suite, and passes all 2,782 core language tests. Among the existing implementations of JavaScript, only Chrome V8's passes all the tests, and no other semantics passes more than 90%. In addition to a reference implementation for JavaScript, KJS also yields a simple coverage metric for a test suite: the set of semantic rules it exercises. Our semantics revealed that the ECMAScript 5.1 conformance test suite fails to cover several semantic rules. Guided by the semantics, we wrote tests to exercise those rules. The new tests revealed bugs both in production JavaScript engines (Chrome V8, Safari WebKit, Firefox SpiderMonkey) and in other semantics. KJS is symbolically executable, thus it can be used for formal analysis and verification of JavaScript programs. We verified non-trivial programs and found a known security vulnerability. 

In a word: **amazing!** 

They found fundamental flaws in real world programs that are used on a daily basis by millions of people. They found test cases that the _Javascript language designers_ missed. 

The 𝕂 framework itself generated the tools they used. 

Even better, this is how easy it was to get those results!

>
The development of KJS took only four months by a first year PhD student, with no prior knowledge of JavaScript or of the K semantic framework.

Using 𝕂, in just four months, one grad student was able to find flaws in mainstream software used by millions of people, that entire teams of seasoned industry professionals, at Apple, at Google, and throughout the Open Source Community couldn't find over the course of decades, including subtle issues that designers of the Javascript language didn't think of!

If we can teach Siri to be half as smart as the 𝕂 framework already is, she'll not only qualify as a coder; she may well out-code us all!

#### **Meh. Javascript sucks. When are they going to tackle a "real" language?**
<image src="{{ site.urlimg }}/kevin_hartmann/comicbookguy.jpg" /> 


Is C. real enough for you? What about [Java](http://fsl.cs.uiuc.edu/index.php/K-Java:_A_Complete_Semantics_of_Java)?

Take a look at their semantic analysis of C in [Defining the Undefinedness of C](http://fsl.cs.illinois.edu/index.php/Defining_the_Undefinedness_of_C). If you've ever written a line of C code at any point in your life, you'll find their results impressive! 

Not only does their semantic definition of C work for programs defined within the C programming language, it also defines and detects when and how a given behaviour is *undefined*, and flags it as such.

<image src="{{ site.urlimg }}/kevin_hartmann/debugging.jpg" /> 

As every C. coder soon learns, undefined behaviour is one of the biggest cause of bugs in C. Null pointer errors, segmentation faults, buffer overruns, and stack exploits are invariably caused by a C program that accidentally attempts undefined behaviour. Buffer overruns alone have been the single greatest cause of security flaws within the Linux kernel. The real problem with undefined behaviour is how hard it is to track down.   

We can't get rid of undefined behaviour in our programs, because it's terribly easy to create by accident, and currently very hard to detect. Worse, according to the C standard, (for performance reasons, and to simplify their implementation), all C compilers are allowed to assume that they only ever operate on well-defined programs. This is almost never the case in the real world.

The fact that undefined behaviour in C is so easy to create, but so hard to find is the reason that there exist so many tools, both commercial and non-commercial, which are entirely dedicated to finding bugs in C programs that are caused by various types of undefined behaviour. 

C has existed since the 1960s, so you'd expect these tools to be very good at this sort of thing by now. I mean, 𝕂 should have a hard time out-doing them at their own game, right?

As it turns out, the tool generated using the 𝕂, kcc, did better than **all** of the competitors they tested it against: Astree, CompCert, Valgrind, and the Value Analysis tool for Frama C. In fact, kcc caught more cases of undefined behaviour than all of those industry standard powerhouses **put together**.

Not bad for a program written by another program! Siri would be proud!

kcc isn't perfect. It was designed a "drop in replacement" for gcc. However, all that correctness comes at a price. Since kcc is interpreted, not compiler, it runs significantly slower than native code; up to one hundred thousand times slower, in fact! 

However, addressing such speed issues in the 𝕂 framework is already a new research priority for that the team has set for themselves. Given everything else they've already done, this goal doesn't sound so difficult. 

And since, all matching rules in 𝕂 can be run in parallel, they could always implement a matching rule engine using massively parallel hardware, and gain at least a few orders of magnitude speed increase that way. 

## The future of AI?
<image src="{{ site.urlimg }}/kevin_hartmann/future1.jpg" /> 

The 𝕂 framework is an exciting research project; both in and of itself, and for the prospects for the future that it opens up.

To me, the 𝕂 framework clearly demonstrates that semantic analysis is finally workable, in practice, with real world languages, and real world results. I can foresee so many great new possibilities that could come about as a result of accurate semantic analysis techniques! While the 𝕂 framework is (currently) focused on addressing program validity and correctness, I think the power of semantic analysis that it provides could very easily be applied more generally, to benefit widespread aspects of Artificial Intelligence.

Here are just some of the benefits for coders that I foresee this kind of semantic analysis opening up, in the near future, or in some cases, starting right now! 

### C code that actually works
<image src="{{ site.urlimg }}/kevin_hartmann/swatter.jpg" /> 

C is a fast, powerful language that actually does run everywhere. It's also so bug-prone that some programmers reflexively wince when they think about trying to guarantee that their C code has no memory leaks, buffer over-runs, null pointer exceptions, or other bad behaviour that compilers don't catch for us.

Thanks to the 𝕂 framework, now we can detect those errors, and fix them; before the code ships!

Check out the kcc tool, a drop-in replacement for gcc. It might be slow; but then again, so is chasing bugs with Valgrind. 

### Real cross-language compatibility
<image src="{{ site.urlimg }}/kevin_hartmann/dolphins.jpg" /> 

 Up until now, a given program has usually been written in a single programming language; and porting part or all of that code to a different programming language, despite programs to assist automated translation, has always been a tedious and error prone task. Translating the syntax of one programming language into another is straightforward, but managing all the subtle differences in programming language semantics is what makes the task so difficult and error prone. 

A successful toolkit for semantic analysis could change all that. When a computer can verify that two sections of code have the same semantic meaning, it means that those two sections of code do the same thing, no matter how different they appear, and no matter what language they were written in.  

One of the things the people at the 𝕂 framework site have already developed is [A Language-Independent Proof System for Full Program Equivalence](http://fsl.cs.illinois.edu/index.php/A_Language-Independent_Proof_System_for_Full_Program_Equivalence). It demonstrates a formal, mathematical algorithm to prove that two programs do the same thing, regardless of what programming languages those programs are written in. It does so by demonstrating that the two programs are _semantically equivalent_; that is, for some set of semantic behaviour that we are concerned about, the two programs can be mathematically proven to do the same thing! Since that sort of semantic manipulation is exactly what the 𝕂 system is designed to do, I'd be quite surprised if the 𝕂 system can't do that sort of manipulation in the near future. For all I know, it might already be able to do it today! 

### Smarter compilers
<image src="{{ site.urlimg }}/kevin_hartmann/tunnel.jpg" /> 

With semantic analysis, compilers could get orders of magnitude "smarter". 

Today, programmers have to try to guess in advance which data structures and algorithms will be the best choice for a program to use, often when the final system that it will be run on isn't even known, and somehow try to balance the complexity of more "advanced" alternatives against the basic need to write simple, expressive, maintainable code.

Semantically aware compilers could change that. Programmers will simply write the code in the clearest possible way, in order to demonstrate the desired semantics.  Their semantic compiler will then figure out how to optimize the program's internal data structures and algorithms, automatically, from a set of known alternatives, and their relative characteristics. 

The programmer can then automatically generate the best possible program for an explicitly chosen set of alternatives, such as run time performance, space, time, decimal places of accuracy, and so on. Programmers will spend more time considering **what** to do, not _how_. 

One day, semantically aware compilers could even generate programs capable of perform run-time optimizations on the fly, dynamically choosing the best data structures and algorithms based upon the run-time environment, or even based upon specific characteristics of the data set being processed.

Modern optimizing compilers are often (rightly) distrusted by programmers, because they can modify the semantics of the program they optimize without the programmer being aware of the fact that it has happened. With a semantically aware optimizing compiler, programmers will know that no matter how strangely the code has been internally re-arranged or re-written, the underlying behaviour the compiled program will remain semantically equivalent to the program they wrote: and the compiler will guarantee it! 

**That's** the compiler I want to have.

### Mission critical code that is formally proven to be correct
<image src="{{ site.urlimg }}/kevin_hartmann/hal2.gif" /> 

Semantic analysis allows us to verify code in ways that testing simply can't.
Testing just spot-checks to make sure we haven't gone wrong; but semantic analysis looks deeper into the meaning of the code, and can, in many cases, prove for us that our code is, in fact, correct by definition.

That's a much stronger guarantee; and it's why the breakthroughs in semantic analysis by computer scientists are so exciting.  

I'd be much happier flying in a plane if I knew all the control software on it had been formally guaranteed not to be able go wrong, ever.

They're already hard at work on this problem! Check out this paper from the 𝕂 framework's web site: [RV-ECU: Maximum Assurance In-Vehicle Safety Monitoring](http://fsl.cs.illinois.edu/index.php/RV-ECU:_Maximum_Assurance_In-Vehicle_Safety_Monitoring) to see how they're formally verifying that the control system for a bus works correctly.

### Smarter AIs
<image src="{{ site.urlimg }}/kevin_hartmann/smarter_ai4.jpg" /> 

What might happen if we took a program capable of semantic analysis of its own code, and gave it the task of optimizing itself? 

We'd have a new type of AI, one that we haven't tried before.

That, in itself, is very exciting! Equally interesting and exciting is the potential for different hybrid variants of AI techniques, put together. Just think about what we might be able to build one day! 

We could have an AI with a neural network for understanding what human beings are asking, an expert system to provide the state of the art knowledge of the task at hand, coupled with a semantic analysis code engine capable of understanding the existing codebase; and understand how to change that codebase in the proper way. 

If we had that, we could bring our Siri coder to life; if such a thing turns out to be possible, that is. We won't know for sure until we try!

## That's all very interesting! But, CAN Siri learn to code?
<image src="{{ site.urlimg }}/kevin_hartmann/siri_future.jpg" /> 

#### **Well, CAN she be taught?**

In my opinion, the short answer is _"yes, at least a little"_. The longer answer is _"it depends upon how you define the problem, of course"_.

Since the early days of computing, there have been attempts to get computers to apply our existing mathematical knowledge to the problem of generating new information. 

In 1955, a program called _Logical Theorist_ was able to use deductive reasoning alone in order to generate proofs of 38 of the first 58 mathematical theorems in the _Principia Mathematica_. This little AI was even able to generate new proofs for some of those theorems that were not yet known to mathematics, despite being severely limited by the hardware available back in the 1950s! 

The 𝕂 framework, like Logical Theorist before it, and even modern compiler tools, all share one critically important aspect of Artificial Intelligence; they have all generated new information that humans didn't have without those programs. 

#### **What do you mean by "It wrote the code all by itself!"?**
<image src="{{ site.urlimg }}/kevin_hartmann/servers.jpg" /> 
Suppose we gave our AI a set of requirements, and an abstract starting environment, and it could then generate all of the rest of the program for us, in any language that our the AI "knew". In that case, it would be fair to say that in some sense, the AI had "coded" the program for us.

That's almost exactly what the 𝕂 framework already does right now; only backwards. The 𝕂 framework reasons forward according to the semantics of a given language and a given program, and can prove that it will generate results of a given type. 

What we want to do is the same thing, only in reverse; starting from the results, we want our framework to give us a program that can do what we've asked.

Can we teach our hero Siri how to do that? Can it be done?

#### **What Siri can't do**
We already know that an AI like Siri can't write the code for every program that we can think of, because no one can. It's not mathematically possible; there are infinitely more programs that could exist than we could physically describe within a finite amount of memory. 

#### **Could Siri, or some other AI, be programmed to generate the code for certain programs?** 

Yes, of course! There are certainly programs that even the simplest AI can generate for us. For example, we don't even need an AI to pull an answer from a cache once we've already solved it.

#### **Sure, but could an AI write code for us that a human couldn't write for themselves?**

<image src="{{ site.urlimg }}/kevin_hartmann/future2.jpg" /> 

The answer to that question probably depends a lot upon the human, the AI, and the nature of the program requirements themselves. It's pretty easy to make an AI that can code better than my grandmother.[1] It's much harder to make an AI that can  out-code me, or any other professional programmer[2]. 
 
One of the ways programmers write code is to replace requirements with code that implements those requirements, and to keep doing that until the entire program is done.

So, if we created a big huge library of existing code, and matched each bit of code up with the corresponding semantic requirements which that code could fulfill, even a very simple program could generate a program for us. It would just have to match up all of the requirements with the corresponding code, assemble all the pieces into a program, and give it back to us! 

### How Siri might soon learn to out-code us all
<image src="{{ site.urlimg }}/kevin_hartmann/hail_science.jpg" /> 

The 𝕂 framework already lets us clearly describe a program's requirements in terms of it's semantic results on it's surrounding environment. 

Once we have encoded those requirements, we then could try to use its validation tools demonstrate that two programs that start with the same starting environment execute programs whose semantics are _equivalent_; that is, they compute the same result when give the same inputs.

If Siri can prove that a possible solution provides results that are _semantically equivalent_ to the results she wants, she knows that the solution is an answer to her problem. That means that no matter how she gets the right answer, even if it's just by a "lucky guess", she can recognize that the solution is correct, and give us the right answer. 

In such a scenario, Siri could write some programs for us just by quickly making educated guesses about possible solutions until she guesses correctly. She could even start out guessing blindly, and then try to refine her guesses until more and more of the semantics associated with her result **become** semantically equivalent to the semantics of the desired result.

How can we teach Siri how to make new guesses, starting from old ones? How can we teach her how to create new programs, starting from old ones?

Well, human coders use deductive logic to write programs.

So...

### What if we taught Siri how to reason about programs?
<image src="{{ site.urlimg }}/kevin_hartmann/brain.jpg" /> 

After all, we know it's something that we can teach programs about. We did it in the 1950s, with _Logical Theorist_, so we know we can do it now! 

In fact, we could use the 𝕂 framework for this, because logic systems are one of the things that 𝕂 was designed to operate on!

For example, we could use 𝕂 to teach Siri to associate the rule for adding a "NOT" symbol in front of an expression with the corresponding semantic change to the new program.

In general, we could teach Siri how to associate the rules for how to modify the **syntax** of a given programming language with the corresponding change to the **semantics** of the resulting program.

Once we do that, Siri could use any one of a number of clever Artificial Intelligence tricks for making an initial guess, and refining it to get a better one. In this case, a "better" guess is a program whose semantics are a closer match to our desired semantic requirements than the last one. Every time Siri's guesses finally converge on the right answer, she'll have **written a program** for us!

In other words, we might not have to teach Siri to code. Maybe, **Siri could teach herself!** In that case, she would not  just be limited by our understanding of what we could teach her; she could explore new possibilities "on her own". 

She might even end up being able to code better than we can!

## Conclusion
<image src="{{ site.urlimg }}/kevin_hartmann/yes5.jpg" /> 
Developing an AI capable of coding the way that I have described here might not actually turn out to be possible, for reasons that I can't foresee now.

But then again, it might. We'll only know if we try. And there's good reason to suspect that we can succeed.

Personally, I'm feeling very confident that **one day soon, Siri** _(or some other AI very much like her)_ **can** (and will) **learn to code**.

Semantic Analysis in general, and the 𝕂 framework in particular, might just be the key to making that happen. 

Check it out at [http://www.kframework.org/]()

### References:
1. [http://www.kframework.org/](http://www.kframework.org/)
2. [http://www.kframework.org/index.php/K_Publications](http://www.kframework.org/index.php/K_Publications)
3. [An overview of the K Semantic Framework](http://fsl.cs.uiuc.edu/index.php/An_Overview_of_the_K_Semantic_Framework)
4. [KJS:A Complete Formal Semantics of JavaScript](http://fsl.cs.uiuc.edu/index.php/KJS:_A_Complete_Formal_Semantics_of_JavaScript)
5. [Defining the Undefinedness Of C](http://fsl.cs.uiuc.edu/index.php/Defining_the_Undefinedness_of_C)
6. [A Complete Semantics of Java](http://fsl.cs.uiuc.edu/index.php/K-Java:_A_Complete_Semantics_of_Java)
7. [https://github.com/kframework](https://github.com/kframework)
8. [Logical Theorist](https://en.wikipedia.org/wiki/Logic_Theorist)
9. [_Why Johnny Can't Code_]( http://www.salon.com/2006/09/14/basic_2 )

### Footnotes
1. For one thing, she's dead.
2. At least, I hope so. 

