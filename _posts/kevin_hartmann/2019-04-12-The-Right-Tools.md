---
layout: post
title:  "The Right Tool For The Job"
breadcrumb: true
author: kevin_hartmann
date: 2019-04-12
categories: kevin_hartmann
tags:
    - IntelliJ 
    - PyCharm
    - Data Grip
    - Software Development Tools
    - Productivity Enhancers 
    - JetBrains 
teaser:
    info: "Choosing the right tool for the job is always important. The Jetbrains toolset is a powerful tool that should be part of any programmer's toolbox."
    image: kevin_hartmann/tool-box-pro.jpg
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---
<image src="{{ site.urlimg }}kevin_hartmann/tool-box-pro.jpg" alt="Tool Box Image" />

There's an old saying: "a craftsman is no better than his tools". I think it applies to software development, too. 

I'm old enough to remember how to write code the "old-school" way: using just a console window, a text editor, and a command line. I even remember how to write programs directly in machine code: with no compilers, no assemblers, no IDEs; no software tools of any kind! And if I had to, I *could* still write code that way. But *do* I write code that way? No! 

Why is that? I'm also old enough to remember all the reasons why we stopped trying to develop code the "old-school" way: it's slower, it's easier to make mistakes, and those mistakes are harder to recover from. We have better tools for software development now, and it's a mistake to ignore them. 

Don't be like some carpentry purist insisting on using a hand saw instead of a power saw! Most of the time, the power saw will do the job faster, and better. You don't gain anything by doing your sawing by hand, and your odds of making a mistake are higher, especially with angle cuts. The moral of the story? Don't make life hard for yourself; always pick the right tool for the job! 

## Power Tools
I've written software a long time now, and over that time, I've come to appreciate the power of a well designed set of tools; and how they can make all the difference when it comes to getting a job done quickly and effectively. 

The best tools make the job they do look easy; and they often become so much a part of your development style that it's easy to simply take them for granted -- until you stop to look back, and wonder how you would solve a problem without them. 

## Introducing the IntelliJ Toolbox

For me, the entire IntelliJ Toolbox has become one of those toolkits: whether
I'm writing code in Java, Python, or just editing a JSON file, they just
make life easier. A whole host of stupid errors and tedious mistakes that I can (and do) make (typos, mis-spellings, case errors, missing quotes, formatting) 
just go away: if something isn't right, my tools show me what's wrong, where,
and offers suggestions for how to fix it for me -- so that I can focus on 
writing the code I want to write, instead of wasting time on side issues, like syntax or code style. 

## PyCharm

From the moment I saw it, I loved PyCharm. Today, writing Python code without PyCharm is a non-starter for me. It does so many things right out of the box that there's no real point in trying to develop code without it. I automatically get syntax highlighting and checking, PEP8 formatting standards compliance, unit tests, and more.

If I want to peek inside the libraries that my code imports, I just click on
the name, and "Goto->Declaration". **Boom**!  In two clicks, I'm snooping around
deep inside typing.pyi; a system module that adds a type system to the Python language. I see comments about how the internals of the new type system for Python have been implemented, and check out reference notes about how some implementation issues have been resolved. I quickly notice that *PEP 484* applies to this module. Suddenly, I know which documentation I to read to find out about how this new language feature works! 

PyCharm has built in handling for virtual environments, for version control, and for testing. Writing PyUnit tests are a snap. Code coverage metrics are right
there in front of you.  

If I want to set breakpoints inside python, I just click on the line I want,
and run the code in debug mode within PyCharm, and it stops where I told it to.
I can view the value of variables at that point, and see what's happening 
without wasting time writing print statements and commenting them out just to
trace the code flow, or trying to call obscure debug function hooks within Python runtime. 

Everything just works; which is exactly what I want from the tools that I rely on to do my job.  

I get more work done when my IDE does it for, especially when it does it without getting in my way when I don't want it to. PyCharm manages both at once, which
was as unexpected as it is delightful. I keep waiting for the other shoe to drop... but it never does.

## IntelliJ Idea

IntelliJ has all of the typical editing and formatting capabilities you
might expect, and more: including the ability to format code according to a company wide standard. I don't waste time worrying about whether my code is aligned properly; I just click "Reformat", and suddenly, I have one less problem to worry about. 

Other little side problems go away, too. Syntax highlighting just works. Quote detection just works. IntelliJ automatically checks my code whenever I save it,
and highlights (in red) code that won't compile. If I've made a typo, I see it right away. If I've accidentally deleted something, I hit <control-Z> and it goes back to the way it was.  

### Viewed in Proper Context

IntelliJ goes well beyond mere formatting, though. It detects unreachable code, and warns you about it. Methods that are never called anywhere in your program turn grey to let you know that they can safely be deleted; as do imports that you included which can be eliminated. 

Even better, IntelliJ understands the **Java context** of your code: it's automatic code completion feature pops up suggestions for all of the methods that you could call on a function. For functions that are overloaded, it not only pops up the type signatures that are available; it even greys out the ones that are no longer valid as you fill in types within your function call! It's hard to make a basic coding mistake that IntelliJ doesn't flag and warn you about. 

It's default code inspection comes with a whole host of common Java coding mistakes, and not only shows you what you've probably done wrong, it offers you suggestions on how it can fix them for you. It also offers to improve your code in other ways, like offering to automatically upgrade your code to use newer Java constructs (such as anonymous functions when streaming) where appropriate.  

### But what if I change everything?  

But, what if the code you're writing isn't just standard Java, but something that relies on annotatation processors (such as Spring, or Lombok) to build your program for you.  In that case, you might suspect that IntelliJ would have a hard time figuring out what you meant; at the very least, some of it's code completion or code inspection features might stop working. 

But no, that's not what happens! Instead, IntelliJ handles everything seamlessly. IntelliJ tracks your spring dependencies, and will even graph them for you. It understands the implications of your Lombok annotations, and handles them flawlessly. In fact, IntelliJ not only understands your code, it can also inform you about the consequences of your choices.  

Look at the screenshot below, annotated with @SuppressWarnings("unchecked")
Hovering over the warning not automatically brings up the section of code for which the warnings which are currently being suppressed *would be* generated. 

<image src="{{ site.urlimg }}kevin_hartmann/screenshot.png" alt="Screenshot Image" />

When my IDE handles those kinds of coding problems, I don't have to do it myself. That lets me use that time to get other work done; without the mental distractions that come from being side-tracked on minor issues. Productivity ensues. 

## Debuggers to the rescue

Some people claim that debuggers are bad, because they discourage careful 
thought about a codebase and it's function. They claim that if you develop
a correct mental model and reason carefully about the code, you will find 
the bugs as a consequence, because they are the points where the model doesn't
match the code.

Those people are mistaken, IMHO. What they say is true, in theory. The 
difference between theory and practice is that in theory, there is no 
difference between theory and practice...

A good debugger helps you bridge the gap between theory and practice. It shows you  what the code is **actually doing** (in practice), as opposed to what you think it *should be doing* (in theory). If there is no difference, then your code has no bugs in it. If there is a difference, a good debugger can help you find them. 

For example, when trying to work with multiple Java frameworks, it can become very easy to lose track of which framework is doing what, and at which layer. That's a good time to call in the debugger to help you understand what's actually going on. 

IntelliJ's debugger handles multiple threads of execution, so you can actually debug code that runs in parallel, (like Spring Boot). You also get automatic byte-code de-compilation, so you can read the source code inside jar files even if you don't have a copy of the original source code. With a little sleuthing, you can quickly find out what's gone wrong deep inside some ugly third party library that's now making your beautifully written code go horribly wrong.

## A Real World Example 

Recently, I had an issue with Spring Boot where I was trying to track down exactly where the code that was writing HTML to our REST endpoint was coming from. I waded through pages and pages of Spring Boot documentation, and tried five or six different ways to over-ride the default error pages that Spring was generating, but none of them actually changed anything. 

Finally, I turned to the IntelliJ debugger, and ran our server within the IntelliJ IDE. I set a breakpoint on the exception handler for the error conditions that I was throwing, and then sent the query that triggered the offending result, to try to figure out what Spring was (and wasn't) doing when it was trying to resolve it's error pages. 

It turns out that Spring itself wasn't triggering ANY of my error pages. Instead, it was generating the default page as part of the default error handling from *Tomcat*: specifically, by using ErrorValveReport class. I replaced Tomcat's 
ErrorValveReport class with one of my own, and viola! Instant success!

By contrast, trying to track down the behaviour of a multi-threaded server with multiple listener classes tucked away inside a Java framework that I hadn't even downloaded source code for would have been a nightmare years ago. With JetBrains, it's not just possible; it's nothing special. It's just another day at the office, when you have the right tools -- quietly making your life easier, faster, and more productive.  

## In Summary

A good tool should make your life easier; enable you do more work with less effort, and be worth the time it takes to become familiar with the features it provides. For me, here at the Ontario Institute for Cancer research, the Jetbrains toolset is definitely one of those tools.
